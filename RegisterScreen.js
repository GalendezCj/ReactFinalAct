import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleRegister = async () => {
    const { name, email, password, confirmPassword } = form;

    // Validations
    if (!name || !email || !password || !confirmPassword) {
      return Alert.alert("Error", "All fields are required.");
    }
    if (!emailRegex.test(email)) {
      return Alert.alert("Invalid Email", "Please enter a valid email format.");
    }
    if (password.length < 6) {
      return Alert.alert("Weak Password", "Password must be at least 6 digits.");
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
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#888"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#888"
            autoCapitalize="none"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Password (min 6 digits)"
            placeholderTextColor="#888"
            secureTextEntry
            maxLength={20}
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            secureTextEntry
            maxLength={20}
            value={form.confirmPassword}
            onChangeText={(text) =>
              setForm({ ...form, confirmPassword: text })
            }
          />

          <View style={{ marginVertical: 10 }}>
            <Button title="Register" onPress={handleRegister} color="#9b4dff" />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ⭐ DARK MODE NEON STYLES
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },

  container: {
    flexGrow: 1,
    padding: 25,
    justifyContent: "center",
  },

  // ⚡ Neon Title  
  title: {
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 30,
    textAlign: "center",
    color: "#fff",
    textShadowColor: "rgba(155, 77, 255, 0.9)",
    textShadowRadius: 18,
  },

  // 🔥 Dark Inputs with Purple Glow
  input: {
    backgroundColor: "#1a1a1a",
    padding: 15,
    borderRadius: 12,
    marginBottom: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#6432c8",
    color: "#fff",
    shadowColor: "rgba(155, 77, 255, 0.7)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },

  // 💜 Neon Link
  link: {
    color: "#c084ff",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
    fontSize: 16,
    textShadowColor: "rgba(192, 132, 255, 0.5)",
    textShadowRadius: 7,
  },
});

export default RegisterScreen;
