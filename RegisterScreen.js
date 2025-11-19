import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const RegisterScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleRegister = async () => {
    const { name, email, password, confirmPassword } = form;
    if (!name || !email || !password || !confirmPassword) {
      return Alert.alert("Error", "All fields are required.");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match.");
    }

    try {
      await db.runAsync(
        "INSERT INTO auth_users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password]
      );
      Alert.alert("Success", "Registration complete! You can now log in.");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      navigation.navigate("Login");
    } catch (error) {
      console.error("Register Error:", error);
      if (error.message?.includes("UNIQUE constraint failed")) {
        Alert.alert("Error", "Email already registered.");
      } else {
        Alert.alert("Error", "Registration failed.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#fff"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#fff"
            autoCapitalize="none"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#fff"
            secureTextEntry
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#fff"
            secureTextEntry
            value={form.confirmPassword}
            onChangeText={(text) =>
              setForm({ ...form, confirmPassword: text })
            }
          />

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#0d0d0d" },
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },

  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 25,
    textAlign: "center",
    color: "#ffffff",
    textShadowColor: "rgba(187, 0, 255, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  input: {
    backgroundColor: "#1a1a1a",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#8a2be2",
    color: "#fff",
    shadowColor: "rgba(155, 77, 255, 0.7)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },

  registerButton: {
    backgroundColor: "#8a2be2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#bb00ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  link: {
    color: "#c084ff",
    textAlign: "center",
    marginTop: 18,
    fontWeight: "600",
    fontSize: 16,
    textShadowColor: "rgba(192, 132, 255, 0.5)",
    textShadowRadius: 7,
  },
});

export default RegisterScreen;
