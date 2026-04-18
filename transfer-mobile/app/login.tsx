import { useState } from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../firebase";
import { useRouter } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#eef6ff",
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome</Text>

      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
          borderRadius: 8,
          backgroundColor: "white",
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          marginBottom: 20,
          padding: 10,
          borderRadius: 8,
          backgroundColor: "white",
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: "#2563eb",
          padding: 12,
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSignup}
        style={{
          backgroundColor: "#60a5fa",
          padding: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}
