import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { useRouter } from "expo-router";
import { convertGPA, buildAIRequest } from "../logic";

import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// If you created subjects file
import { subjectsList } from "../data/subjects";

export default function HomeScreen() {
  const router = useRouter();

  // 🔐 Auth
  const [user, setUser] = useState<any>(undefined);

  // 📊 App state
  const [gpa, setGpa] = useState("");
  const [credits, setCredits] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🏫 Universities
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedUni, setSelectedUni] = useState("");

  // 🔒 Premium (mock for now)
  const [isPro, setIsPro] = useState(false);

  // 🔐 Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsub;
  }, []);

  // 🔄 Redirect if not logged in
  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user]);

  // 🏫 Load universities
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          "https://transfer-app.vercel.app/api/universities",
        );
        const data = await res.json();
        setUniversities(data);
        if (data.length > 0) setSelectedUni(data[0].name);
      } catch {
        console.log("Failed to load universities");
      }
    };
    load();
  }, []);

  // 🎯 Toggle subject
  const toggleSubject = (s: string) => {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  // 🧠 AI call
  const handleAI = async () => {
    // 🔒 simple premium lock
    if (!isPro && subjects.length > 3) {
      alert("Upgrade to Pro to select more subjects 🚀");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://transfer-app.vercel.app/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          buildAIRequest({
            gpa: convertGPA(parseFloat(gpa)),
            credits: parseInt(credits),
            subjects,
            university: selectedUni,
          }),
        ),
      });

      const data = await res.json();

      try {
        setResult(JSON.parse(data.result));
      } catch {
        setResult({ raw: data.result });
      }
    } catch {
      setResult({ raw: "Error connecting to server" });
    }

    setLoading(false);
  };

  // ⏳ Loading auth
  if (user === undefined) {
    return <Text style={{ padding: 40 }}>Loading...</Text>;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#eef6ff", padding: 20 }}>
      {/* HEADER */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>🎓 Transfer AI</Text>

        <TouchableOpacity onPress={() => signOut(auth)}>
          <Text style={{ color: "red" }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ marginBottom: 10 }}>{user?.email}</Text>

      {/* DASHBOARD NAV */}
      <TouchableOpacity onPress={() => router.push("/dashboard")}>
        <Text style={{ color: "#2563eb", marginBottom: 10 }}>
          📊 Go to Dashboard
        </Text>
      </TouchableOpacity>

      {/* GPA */}
      <TextInput
        placeholder="GPA"
        value={gpa}
        onChangeText={setGpa}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          backgroundColor: "white",
        }}
      />

      {/* CREDITS */}
      <TextInput
        placeholder="Credits"
        value={credits}
        onChangeText={setCredits}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          backgroundColor: "white",
        }}
      />

      {/* UNIVERSITIES */}
      <Text style={{ marginBottom: 5 }}>University:</Text>
      {universities.map((u, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => setSelectedUni(u.name)}
          style={{
            padding: 8,
            marginBottom: 5,
            borderRadius: 8,
            backgroundColor: selectedUni === u.name ? "#2563eb" : "#cfe3ff",
          }}
        >
          <Text
            style={{
              color: selectedUni === u.name ? "white" : "#003366",
            }}
          >
            {u.name}
          </Text>
        </TouchableOpacity>
      ))}

      {/* SUBJECTS */}
      <Text style={{ marginTop: 10 }}>Subjects:</Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {subjectsList.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => toggleSubject(s)}
            style={{
              padding: 8,
              margin: 4,
              borderRadius: 20,
              backgroundColor: subjects.includes(s) ? "#2563eb" : "#cfe3ff",
            }}
          >
            <Text
              style={{
                color: subjects.includes(s) ? "white" : "#003366",
              }}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ANALYZE BUTTON */}
      <TouchableOpacity
        onPress={handleAI}
        style={{
          backgroundColor: "#2563eb",
          padding: 12,
          borderRadius: 10,
          alignItems: "center",
          marginTop: 10,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          {loading ? "Analyzing..." : "Analyze"}
        </Text>
      </TouchableOpacity>

      {/* PREMIUM BUTTON */}
      {!isPro && (
        <TouchableOpacity
          style={{
            backgroundColor: "#facc15",
            padding: 10,
            borderRadius: 8,
            marginTop: 10,
          }}
        >
          <Text style={{ textAlign: "center" }}>Upgrade to Pro 🚀</Text>
        </TouchableOpacity>
      )}

      {/* RESULT */}
      {result && (
        <View
          style={{
            marginTop: 20,
            backgroundColor: "white",
            padding: 15,
            borderRadius: 10,
          }}
        >
          {result.raw ? (
            <Text>{result.raw}</Text>
          ) : (
            <>
              <Text style={{ fontWeight: "bold" }}>Eligibility:</Text>
              <Text>{result.eligibility}</Text>

              <Text style={{ marginTop: 10, fontWeight: "bold" }}>Majors:</Text>
              {result.majors?.map((m: string, i: number) => (
                <Text key={i}>• {m}</Text>
              ))}

              <Text style={{ marginTop: 10, fontWeight: "bold" }}>
                Strategy:
              </Text>
              <Text>{result.strategy}</Text>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}
