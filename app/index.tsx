
import React, { use, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import zoho from "../assets/images/zoho.png";


export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const backendURL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(()=>{
    const checkTOKEN=async()=>{
      const token = await AsyncStorage.getItem('userId');
      if(token) return router.replace('/home')
    }
  checkTOKEN()
  })

  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${backendURL}api/v1/login`, {
        email,
        password,
      });

      if (res.data.success) {
        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(res.data.userName));
        await AsyncStorage.setItem("userId", JSON.stringify(res.data.id));

        Alert.alert("Success", "Login successful!");
        router.replace("/home");
      } else {
        Alert.alert("Error", res.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      Alert.alert(
        "Login failed",
        err.response?.data?.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        source={require("../assets/images/PostLogo.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome to Postgram</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#888"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.other}>OR</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.loginCard}>
        <TouchableOpacity>
          <Image source={zoho} style={styles.logoLogin} />
        </TouchableOpacity>

        <TouchableOpacity >
          <AntDesign name="google" size={40} color="green" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Entypo name="instagram" size={35} color="pink" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.signupText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor:'#1A237E',
    shadowColor:'#FFFFFF',
    shadowOpacity:0.15,
    shadowRadius:10
  },
  logo: { width: 100, height: 100, marginBottom: 20, resizeMode: "contain" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, color: "#fff" },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#f1b2119f",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  footer: { flexDirection: "row", marginTop: 20 },
  footerText: { color: "#fff" },
  signupText: { color: "#fbfb62ff", marginLeft: 5, fontWeight: "600" },
  dividerContainer: { flexDirection: "row" },
  line: { flex: 1, height: 1, backgroundColor: "#ccc", marginTop: 22 },
  other: {
    color: "#fff",
    fontSize: 18,
    padding: 2,
    marginTop: 7,
    marginHorizontal: 10,
  },
  logoLogin: {
    width: 65,
    height: 35,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: "contain",
    marginTop: 17,
  },
  loginCard: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    alignItems: "center",
    marginRight: 25,
  },
});
