import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios from "axios";
import diwali from '../assets/images/diwali3.jpg';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const backendURL = process.env.EXPO_PUBLIC_BACKEND_URL;


   useEffect(()=>{

    const checkLogin = async()=>{
      const token = await AsyncStorage.getItem('token');
    if(token){
      router.push('/home')

    }
    else return

    }
    checkLogin()
    
   },[])

 
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${backendURL}api/v1/login`, { email, password });
      console.log('hi', res.data);
      

      if (res.data.success) {
        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(res.data.userName));
        await AsyncStorage.setItem("userId", JSON.stringify(res.data.id));

        Alert.alert("Success", "Login successful!");
        router.push("/home");
      } else if (res.data.success===false){
        Alert.alert("Error", res.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      Alert.alert("Login failed", err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={diwali} style={styles.container}>
      <Image source={require("../assets/images/favicon.png")} style={styles.logo} />
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

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don’t have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text style={styles.signupText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  footer: { flexDirection: "row", marginTop: 20 },
  footerText: { color: "#fff" },
  signupText: { color: "#007bff", marginLeft: 5, fontWeight: "600" },
});
