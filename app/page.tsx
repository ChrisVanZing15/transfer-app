"use client";

import { useState, useEffect } from "react";
import { universities } from "../data/universities";
import { db, auth } from "../lib/firebase";
import { convertGPA, buildAIRequest } from "../lib/logic";

import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [gpa, setGpa] = useState("");
  const [credits, setCredits] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [result, setResult] = useState("");

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [compareList, setCompareList] = useState<number[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔐 Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 📊 Load history
  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      const q = query(
        collection(db, "students"),
        where("user", "==", user.email),
      );
      const snapshot = await getDocs(q);
      setHistory(snapshot.docs.map((d) => d.data()));
    };

    loadHistory();
  }, [user]);

  const toggleSubject = (s: string) => {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const toggleCompare = (i: number) => {
    if (compareList.includes(i)) {
      setCompareList(compareList.filter((x) => x !== i));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, i]);
    }
  };

  // 🔐 Auth
  const handleLogin = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const handleSignup = async () => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // 🤖 AI single university
  const handleCheck = async () => {
    const g = parseFloat(gpa);
    const c = parseInt(credits);
    const uni = universities[selectedIndex];

    if (!g || !c) return setResult("⚠️ Enter valid values");

    const thaiGPA = convertGPA(g);

    setLoading(true);

    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify(
        buildAIRequest({
          gpa: thaiGPA,
          credits: c,
          subjects,
          university: uni.name,
        }),
      ),
    });

    const data = await res.json();

    await addDoc(collection(db, "students"), {
      user: user.email,
      gpa: thaiGPA,
      credits: c,
      subjects,
      university: uni.name,
      ai: data.result,
      createdAt: new Date(),
    });

    setResult(data.result);
    setLoading(false);
  };

  // 🤖 AI compare
  const handleCompare = async () => {
    const selected = compareList.map((i) => universities[i]);

    setLoading(true);

    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify(
        buildAIRequest({
          gpa: convertGPA(parseFloat(gpa)),
          credits: parseInt(credits),
          subjects,
          compare: true,
          universities: selected.map((u) => u.name),
        }),
      ),
    });

    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  // 🔒 LOGIN SCREEN
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-200 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-xl w-80 space-y-4">
          <h1 className="text-xl font-bold text-center text-blue-700">
            Login / Sign Up
          </h1>

          <input
            placeholder="Email"
            className="w-full border p-2 rounded"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            className="w-full border p-2 rounded"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            Login
          </button>

          <button
            onClick={handleSignup}
            className="w-full bg-blue-400 text-white p-2 rounded"
          >
            Sign Up
          </button>
        </div>
      </main>
    );
  }

  // 🔓 MAIN APP
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-white p-4 flex justify-center">
      <div className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex justify-between">
          <h1 className="font-bold text-blue-700">🎓 Planner AI</h1>
          <button onClick={handleLogout} className="text-red-500 text-sm">
            Logout
          </button>
        </div>

        <p className="text-sm text-gray-500">{user.email}</p>

        {/* FORM */}
        <select
          className="w-full border p-2 rounded"
          onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
        >
          {universities.map((u, i) => (
            <option key={i} value={i}>
              {u.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2 flex-wrap">
          {["Math", "Science", "Business", "Engineering", " Liberal Arts"].map(
            (s) => (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                className={`px-3 py-1 rounded ${
                  subjects.includes(s)
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {s}
              </button>
            ),
          )}
        </div>

        <input
          placeholder="GPA"
          className="w-full border p-2 rounded"
          onChange={(e) => setGpa(e.target.value)}
        />

        <input
          placeholder="Credits"
          className="w-full border p-2 rounded"
          onChange={(e) => setCredits(e.target.value)}
        />

        <button
          onClick={handleCheck}
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {/* COMPARE */}
        <div>
          <h2 className="font-semibold text-blue-700">Compare (max 3)</h2>

          <div className="flex flex-wrap gap-2">
            {universities.map((u, i) => (
              <button
                key={i}
                onClick={() => toggleCompare(i)}
                className={`px-2 py-1 text-sm rounded ${
                  compareList.includes(i)
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>

          {compareList.length > 1 && (
            <button
              onClick={handleCompare}
              className="mt-2 w-full bg-blue-500 text-white p-2 rounded"
            >
              Compare AI
            </button>
          )}
        </div>

        {/* RESULT */}
        {result && (
          <div className="bg-blue-50 p-4 rounded whitespace-pre-line">
            {result}
          </div>
        )}

        {/* DASHBOARD */}
        <div>
          <h2 className="font-semibold text-blue-700">History</h2>

          <div className="max-h-40 overflow-y-auto space-y-2">
            {history.map((h, i) => (
              <div key={i} className="bg-blue-50 p-2 rounded text-sm">
                <p>{h.university}</p>
                <p>GPA: {h.gpa}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
