import { Stack } from "expo-router";
import { DefaultTheme } from "@react-navigation/native";

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#eef6ff",
  },
};

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#eef6ff" }, // 👈 fixes black background
      }}
    />
  );
}
