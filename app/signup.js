import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import axios from 'axios'
import diwali from '../assets/images/diwali3.jpg'
import { StatusBar } from "expo-status-bar";

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async() => {
    const backendURL = process.env.EXPO_PUBLIC_BACKEND_URL ; 
    console.log(backendURL);



    if(!email || !name || !password){
      Alert.alert('Please fill all the required field')
    }
  

    try {
          const res = await axios.post(`${backendURL}api/v1/register` , {name , email , password});
         console.log(res.data);
         if(res.data.success){
          Alert.alert('Registration Successfull! Kindly Login')
          router.push('/')
         }
         else{
          Alert.alert('Error' , res.data.message)
         }
         

      
    } catch (err) {
       console.error("Login error:", err.response?.data || err.message);
      Alert.alert("Login failed", err.response?.data?.message || "Something went wrong.");
      
    }
    router.push("/");
  };

  return (
    <View style={styles.container}   >
      <StatusBar style="light"/>
      <Image source={require("../assets/images/PostLogo.png")} style={styles.logo} />
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1,  alignItems: "center", justifyContent: "center", padding: 20 , backgroundColor:'maroon' },
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
    marginTop:12,
    backgroundColor: "#f1b2119f",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  footer: { flexDirection: "row", marginTop: 20 },
  footerText: { color: "#fff" },
  loginText: { color: "#66fd73ff", marginLeft: 5, fontWeight: "600" },
});
