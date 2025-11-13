import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  Keyboard,
  Image,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const MessengerScreen = ({ route, navigation }) => {
  const { currentUser, chatWithUser } = route.params;
  const db = useSQLiteContext();
  const flatListRef = useRef();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [currentUserPic, setCurrentUserPic] = useState(null);
  const [chatWithUserPic, setChatWithUserPic] = useState(null);

  // Fetch user profile pictures
  const loadUserPics = async () => {
    try {
      const current = await db.getFirstAsync(
        "SELECT profileUri FROM auth_users WHERE name = ?",
        [currentUser.name]
      );
      const chatWith = await db.getFirstAsync(
        "SELECT profileUri FROM auth_users WHERE name = ?",
        [chatWithUser.name]
      );
      setCurrentUserPic(current?.profileUri || null);
      setChatWithUserPic(chatWith?.profileUri || null);
    } catch (err) {
      console.error("Load user pics error:", err);
    }
  };

  // Create messages table
  const createTable = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sender TEXT NOT NULL,
          receiver TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error("DB Error:", error);
    }
  };

  // Load messages
  const loadMessages = async () => {
    try {
      const results = await db.getAllAsync(
        `SELECT * FROM messages
         WHERE (sender = ? AND receiver = ?)
            OR (sender = ? AND receiver = ?)
         ORDER BY created_at ASC`,
        [currentUser.name, chatWithUser.name, chatWithUser.name, currentUser.name]
      );
      setMessages(results);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Load Messages Error:", error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await db.runAsync(
        "INSERT INTO messages (sender, receiver, message) VALUES (?, ?, ?)",
        [currentUser.name, chatWithUser.name, newMessage.trim()]
      );
      setNewMessage("");
      loadMessages();
    } catch (error) {
      console.error("Send Message Error:", error);
    }
  };

  useEffect(() => {
    createTable().then(() => {
      loadMessages();
      loadUserPics();
    });

    const showSub = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const renderItem = ({ item }) => {
    const isMe = item.sender === currentUser.name;
    const profilePic = isMe ? currentUserPic : chatWithUserPic;

    return (
      <View style={[styles.messageRow, isMe ? styles.rowRight : styles.rowLeft]}>
        {!isMe && (
          <Image
            source={profilePic ? { uri: profilePic } : require("./assets/default.png")}
            style={styles.chatHeadImage}
          />
        )}
        <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
          <Text style={isMe ? styles.myMessageText : styles.otherMessageText}>{item.message}</Text>
        </View>
        {isMe && (
          <Image
            source={profilePic ? { uri: profilePic } : require("./assets/default.png")}
            style={styles.chatHeadImage}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0084ff" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>◀ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerName}>{chatWithUser.name}</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 10 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {/* Input */}
        <View style={[styles.inputRow, { marginBottom: keyboardHeight }]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // 🖤 Entire messenger dark mode
  safeArea: { 
    flex: 1, 
    backgroundColor: "#000",
  },

  // 🟣 Glowing Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a001f",
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "space-between",
    shadowColor: "rgba(187, 0, 255, 0.8)",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 14,
    shadowOpacity: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#4d0066",
  },

  backButton: { padding: 4 },

  backText: { 
    color: "#d180ff", 
    fontSize: 16, 
    fontWeight: "bold",
    textShadowColor: "rgba(209, 128, 255, 0.6)",
    textShadowRadius: 12,
  },

  headerName: { 
    color: "#fff", 
    fontSize: 20, 
    fontWeight: "800",
    textShadowColor: "rgba(187, 0, 255, 0.6)",
    textShadowRadius: 12,
    flex: 1,
    textAlign: "center",
  },

  container: { flex: 1 },

  // 🔮 Chat rows
  messageRow: { 
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6,
    paddingHorizontal: 10,
  },

  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },

  chatHeadImage: { 
    width: 38, 
    height: 38, 
    borderRadius: 20, 
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: "#d180ff",
  },

  // ☄️ Message bubbles
  messageBubble: { 
    padding: 12, 
    borderRadius: 18, 
    maxWidth: "70%",
  },

  // ✨ Your message (neon purple)
  myMessage: { 
    backgroundColor: "#5d0099",
    shadowColor: "rgba(187, 0, 255, 0.8)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 14,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: "#bb00ff",
  },

  myMessageText: { 
    color: "#fff", 
    fontSize: 16,
  },

  // 💬 Their message (gray bubble)
  otherMessage: { 
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#4d4d4d",
    marginRight: 6,
  },

  otherMessageText: { 
    color: "#fff", 
    fontSize: 16 
  },

  // 🔲 Input bar (light input, not black)
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#4d0066",
    backgroundColor: "#0d0d0d",
  },

  input: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    color: "#000",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#d6b3ff",
    shadowColor: "rgba(187, 0, 255, 0.7)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    maxHeight: 100,
  },

  // 🚀 Neon Send button
  sendButton: {
    backgroundColor: "#bb00ff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: "rgba(187, 0, 255, 0.9)",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 14,
    shadowOpacity: 1,
  },
});


export default MessengerScreen;
