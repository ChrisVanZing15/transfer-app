"use client";

import { useState, useEffect } from "react";
import { universities } from "../data/universities";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function Home() {
  const [gpa, setGpa] = useState("");
  const [credits, setCredits] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("studentData");
    if (saved) {
      const data = JSON.parse(saved);
      setGpa(data.gpa || "");
      setCredits(data.credits || "");
      setSubjects(data.subjects || []);
      setSelectedIndex(data.selectedIndex || 0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "studentData",
      JSON.stringify({ gpa, credits, subjects, selectedIndex }),
    );
  }, [gpa, credits, subjects, selectedIndex]);

  const toggleSubject = (subj: string) => {
    if (subjects.includes(subj)) {
      setSubjects(subjects.filter((s) => s !== subj));
    } else {
      setSubjects([...subjects, subj]);
    }
  };

  const handleCheck = async () => {
    const g = parseFloat(gpa);
    const c = parseInt(credits);
    const uni = universities[selectedIndex];

    if (!g || !c) {
      setResult("⚠️ Please enter valid GPA and credits");
      return;
    }

    let thaiGPA = g > 4 ? (g / 100) * 4 : g;

    setLoading(true);

    try {
      // 🔥 CALL YOUR AI API
      const res = await fetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({
          gpa: thaiGPA,
          credits: c,
          subjects,
          university: uni.name,
        }),
      });

      const data = await res.json();

      // 🔥 SAVE TO FIREBASE
      await addDoc(collection(db, "students"), {
        gpa: thaiGPA,
        credits: c,
        subjects,
        university: uni.name,
        aiResult: data.result,
        createdAt: new Date(),
      });

      setResult(data.result);
    } catch (err) {
      setResult("Error generating AI response");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-white flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl border border-blue-100 shadow-2xl rounded-3xl w-full max-w-lg p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-700">
          🎓 Transfer Planner AI
        </h1>

        <p className="text-center text-blue-500 text-sm">
          Smart academic planning for Thailand
        </p>

        {/* UNIVERSITY */}
        <select
          className="w-full border p-2 rounded-lg"
          value={selectedIndex}
          onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
        >
          {universities.map((u, i) => (
            <option key={i} value={i}>
              {u.name}
            </option>
          ))}
        </select>

        {/* SUBJECTS */}
        <div className="flex gap-2 flex-wrap">
          {["Math", "Science", "Business"].map((s) => (
            <button
              key={s}
              onClick={() => toggleSubject(s)}
              className={`px-4 py-1 rounded-full text-sm ${
                subjects.includes(s)
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* INPUTS */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="GPA"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            className="border p-2 rounded-lg"
          />
          <input
            type="number"
            placeholder="Credits"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            className="border p-2 rounded-lg"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleCheck}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-xl font-semibold"
        >
          {loading ? "Analyzing..." : "Analyze with AI"}
        </button>

        {/* RESULT */}
        {result && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 whitespace-pre-line">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}
