  import React, { useState } from "react";
  import {
    SafeAreaView,
    KeyboardAvoidingView,
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Image,
    Platform,
    FlatList,
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

    // 🖼️ Pick new profile image
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

        // Optionally, save to DB
        if (loggedInUser) {
          try {
            await db.runAsync("UPDATE auth_users SET profileUri = ? WHERE id = ?", [
              uri,
              loggedInUser.id,
            ]);
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
          setProfileImage(user.profileUri || null); // Load saved image
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
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <KeyboardAvoidingView
          style={{ flex: 1, padding: 20 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {!loggedInUser ? (
            // 🧭 LOGIN SCREEN
            <View style={styles.loginContainer}>
              <Text style={styles.title}>Login</Text>

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

              <View style={{ marginVertical: 10 }}>
                <Button title="Login" onPress={handleLogin} color="#007bff" />
              </View>

              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.link}>Don’t have an account? Register</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // 🧍 AFTER LOGIN VIEW
            <View style={{ flex: 1 }}>
              {/* 👤 User profile section */}
              <View style={styles.profileSection}>
                <TouchableOpacity onPress={pickImage}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
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

              <View style={{ marginVertical: 10 }}>
                <Button
                  title="Logout"
                  onPress={() => {
                    setLoggedInUser(null);
                    setOtherUsers([]);
                    setProfileImage(null);
                  }}
                  color="#dc3545"
                />
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  };

const styles = StyleSheet.create({
  loginContainer: { 
    flex: 1,
    justifyContent: "center",
  },

  // 🖤 FUTURISTIC GLOWING TITLE
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

  // 🔲 LIGHT INPUT FIELD WITH NEON GLOW
  input: {
    backgroundColor: "#f9f9f9",       // Light input field
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

  // 🟣 LINK
  link: {
    color: "#d180ff",
    textAlign: "center",
    marginTop: 18,
    fontWeight: "600",
    fontSize: 16,
    textShadowColor: "rgba(209, 128, 255, 0.5)",
    textShadowRadius: 8,
  },

  // 👤 PROFILE SECTION
  profileSection: {
    alignItems: "center",
    marginBottom: 25,
    marginTop: 20,
    paddingVertical: 10,
  },

  // 🟣 NEON PROFILE GLOW
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#bb00ff",
    shadowColor: "rgba(187, 0, 255, 0.9)",
    shadowOpacity: 1,
    shadowRadius: 20,
  },

  userNameBig: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 10,
    color: "#fff",
  },

  changePhotoText: {
    fontSize: 13,
    marginTop: 5,
    color: "#aaa",
  },

  subtitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
    color: "#fff",
    textShadowColor: "rgba(187, 0, 255, 0.5)",
    textShadowRadius: 10,
  },

  // 🟣 USER ROW WITH GLOW
  userRow: {
    padding: 15,
    backgroundColor: "#121212",
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#bb00ff",
    shadowColor: "rgba(187, 0, 255, 0.4)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },

  userName: { 
    fontSize: 17, 
    fontWeight: "700", 
    color: "#fff" 
  },

  userEmail: { 
    fontSize: 14, 
    color: "#ccc" 
  },
});


  export default LoginScreen;
