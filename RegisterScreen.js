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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={form.confirmPassword}
            onChangeText={(text) =>
              setForm({ ...form, confirmPassword: text })
            }
          />

          <View style={{ marginVertical: 10 }}>
            <Button title="Register" onPress={handleRegister} color="#007bff" />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: "center", 
    padding: 20,
  },

  // 🖤 FUTURISTIC NEON TITLE
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 25,
    textAlign: "center",
    color: "#ffffff",
    textShadowColor: "rgba(187, 0, 255, 0.7)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  // 🔲 LIGHT INPUTS WITH NEON GLOW
  input: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#d6b3ff",
    color: "#000",
    shadowColor: "rgba(187, 0, 255, 0.7)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },

  // 🟣 LINK TEXT
  link: {
    color: "#d180ff",
    textAlign: "center",
    marginTop: 18,
    fontWeight: "600",
    fontSize: 16,
    textShadowColor: "rgba(209, 128, 255, 0.4)",
    textShadowRadius: 7,
  },
});

export default RegisterScreen;
