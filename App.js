import "react-native-gesture-handler";
import React from "react";
import { SQLiteProvider } from "expo-sqlite";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import RegisterScreen from "./RegisterScreen";
import LoginScreen from "./LoginScreen";
import UserListScreen from "./UserListScreen";
import MessengerScreen from "./MessengerScreen";
import CommentScreen from "./CommentScreen";
import AboutScreen from "./screens/AboutScreen";

const Stack = createStackNavigator();

// 🟣 Custom Neon Navigation Theme
const NeonDarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#000000",
    card: "#0a0014",
    text: "#ffffff",
    border: "#4d007d",
    primary: "#bb00ff",
  },
};

export default function App() {
  return (
    <SQLiteProvider
      databaseName="authDatabase.db"
      onInit={async (db) => {
        // Users, Messages, Comments tables
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS auth_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            receiver TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT NOT NULL,
            comment TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );

          -- ✅ New table for bio & address
          CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            bio TEXT,
            address TEXT,
            FOREIGN KEY(user_id) REFERENCES auth_users(id)
          );
        `);
      }}
    >
      <NavigationContainer theme={NeonDarkTheme}>
        <Stack.Navigator
          initialRouteName="Register"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#0a0014",
              shadowColor: "rgba(187, 0, 255, 0.8)",
            },
            headerTintColor: "#ffffff",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 22,
              textShadowColor: "rgba(187, 0, 255, 0.8)",
              textShadowRadius: 12,
            },
          }}
        >
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "REGISTER" }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "LOGIN" }}
          />
          <Stack.Screen
            name="Users"
            component={UserListScreen}
            options={{ title: "USERS" }}
          />
          <Stack.Screen
            name="Messenger"
            component={MessengerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Comments"
            component={CommentScreen}
            options={{ title: "COMMENTS" }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{ title: "ABOUT" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SQLiteProvider>
  );
}
