import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSQLiteContext } from "expo-sqlite";
import { Ionicons } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const db = useSQLiteContext();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  // Ensure profileUri column exists
  useEffect(() => {
    const createProfileUriColumn = async () => {
      try {
        await db.runAsync(
          "ALTER TABLE auth_users ADD COLUMN profileUri TEXT;"
        );
      } catch (err) {
        if (!err.message.includes("duplicate column")) {
          console.error("Error adding profileUri column:", err);
        }
      }
    };
    createProfileUriColumn();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);

      if (loggedInUser) {
        try {
          await db.runAsync(
            "UPDATE auth_users SET profileUri = ? WHERE id = ?",
            [uri, loggedInUser.id]
          );
          Alert.alert("Updated", "Profile picture updated successfully!");
        } catch (err) {
          console.error("Error saving profile:", err);
        }
      }
    }
  };

  const handleLogin = async () => {
    const { email, password } = form;
    if (!email || !password)
      return Alert.alert("Error", "Enter email and password.");

    try {
      const user = await db.getFirstAsync(
        "SELECT * FROM auth_users WHERE email = ? AND password = ?",
        [email, password]
      );

      if (user) {
        setLoggedInUser(user);
        setForm({ email: "", password: "" });
        setProfileImage(user.profileUri || null);
        loadOtherUsers(user.id);
        Alert.alert("Success", `Welcome back, ${user.name}!`);
      } else {
        Alert.alert("Error", "Invalid email or password.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert("Error", "Login failed.");
    }
  };

  const loadOtherUsers = async (userId) => {
    try {
      const users = await db.getAllAsync(
        "SELECT * FROM auth_users WHERE id != ?",
        [userId]
      );
      setOtherUsers(users);
    } catch (error) {
      console.error("Load Users Error:", error);
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() =>
        navigation.navigate("Messenger", {
          currentUser: loggedInUser,
          chatWithUser: item,
        })
      }
    >
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {!loggedInUser ? (
            <View style={styles.loginContainer}>
              <Image
                source={require("./assets/logo.jpg")}
                style={styles.logo}
              />
              <Text style={styles.title}>Login</Text>

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

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.link}>Don’t have an account? Register</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <View style={styles.profileSection}>
                <TouchableOpacity onPress={pickImage}>
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <Ionicons name="person-circle-outline" size={100} color="#aaa" />
                  )}
                </TouchableOpacity>
                <Text style={styles.userNameBig}>{loggedInUser.name}</Text>
                <Text style={styles.userEmail}>{loggedInUser.email}</Text>
                <Text style={styles.changePhotoText}>Tap image to change photo</Text>
              </View>

              <Text style={styles.subtitle}>Select a user to message:</Text>

              <FlatList
                data={otherUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUser}
                style={{ flex: 1, marginTop: 10 }}
              />

              {/* ABOUT BUTTON */}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#6f42c1" }]}
                onPress={() =>
                  navigation.navigate("About", {
                    userId: loggedInUser.id,
                    image: profileImage,
                  })
                }
              >
                <Text style={styles.actionButtonText}>About</Text>
              </TouchableOpacity>

              {/* LOGOUT BUTTON */}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#dc3545" }]}
                onPress={() => {
                  setLoggedInUser(null);
                  setOtherUsers([]);
                  setProfileImage(null);
                }}
              >
                <Text style={styles.actionButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#121212" },
  loginContainer: { flex: 1, justifyContent: "center" },
  logo: { width: 120, height: 120, alignSelf: "center", marginBottom: 15, borderRadius: 60 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 25,
    textAlign: "center",
    color: "#e0e0e0",
    textShadowColor: "rgba(138, 43, 226, 0.7)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  input: {
    backgroundColor: "#1e1e1e",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#8a2be2",
    color: "#e0e0e0",
  },
  loginButton: {
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
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: {
    color: "#b57fff",
    textAlign: "center",
    marginTop: 18,
    fontWeight: "600",
    fontSize: 16,
    textShadowColor: "rgba(139, 69, 255, 0.5)",
    textShadowRadius: 8,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 25,
    marginTop: 20,
    paddingVertical: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#8a2be2",
  },
  userNameBig: { fontSize: 22, fontWeight: "800", marginTop: 10, color: "#e0e0e0" },
  changePhotoText: { fontSize: 13, marginTop: 5, color: "#aaa" },
  subtitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    color: "#e0e0e0",
    textShadowColor: "rgba(138, 43, 226, 0.5)",
    textShadowRadius: 10,
  },
  userRow: {
    padding: 15,
    backgroundColor: "#1e1e1e",
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#8a2be2",
  },
  userName: { fontSize: 17, fontWeight: "700", color: "#e0e0e0" },
  userEmail: { fontSize: 14, color: "#bbb" },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 8,
  },
  actionButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

export default LoginScreen;
