import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

export default function AddPostScreen() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const[loading , setloading]=useState(false)

  const backendURL = process.env.EXPO_PUBLIC_BACKEND_URL; // no trailing slash

  // Pick image from gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) setImage(result.assets[0]);
  };

  // Upload post
  // Upload post
const handleSubmit = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!caption && !image) {
      alert("Please add a caption or select an image");
      return;
    }

    const formData = new FormData();
    setloading(true)

    if (image) {
      // For React Native, the image object needs these properties
      formData.append("image", {
        uri: image.uri,
        name: image.uri.split("/").pop(),
        type: "image/jpeg", // or "image/png" depending on file
      });
    }

    formData.append("caption", caption);
     console.log('image' , formData);

    // const response = await axios.post(
    //   `${backendURL}api/create`,
    //   formData,
    //   {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //       Authorization: `Bearer ${token}`,
    //     },
    //   }
    // );

    const res = await axios.post(`${backendURL}api/create` ,formData , {
       headers:{
        "Content-Type":"multipart/form-data",
        Authorization:`Bearer ${token}`
       },
    });
    console.log('response',res.data);
    
   
    

    
    alert("Post created successfully!");
    
  } catch (err) {
    console.error("Upload error:", err.response?.data || err.message);
    alert("Error creating post: " + (err.response?.data?.message || err.message));
  }finally{
    setloading(false)
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Post</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.imagePickerText}>Pick an Image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Write a caption..."
        placeholderTextColor="#aaa"
        style={styles.captionInput}
        value={caption}
        onChangeText={setCaption}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>{loading ? 'Posting...' : 'Post'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#FFD700", marginBottom: 20 },
  imagePicker: {
    height: 200,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
  },
  imagePickerText: { color: "#ccc" },
  previewImage: { width: "100%", height: "100%", borderRadius: 10 },
  captionInput: {
    backgroundColor: "#2C2C2C",
    color: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: { color: "#121212", fontWeight: "bold", fontSize: 16 },
});
