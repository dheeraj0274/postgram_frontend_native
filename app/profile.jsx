import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const POST_IMAGE_SIZE = width / 3 - 2;

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState({
    _id: null,
    name: "John Doe",
    username: "johndoe",
    profilePic: "https://i.pravatar.cc/150?img=68",
    followers: 0,
    following: 0,
  });
  const [posts, setPosts] = useState([]);
  const backendURL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const fetchProfile = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("userId");
      if (!storedUser) return;
      const currentUser = JSON.parse(storedUser);
      setUser(currentUser);

      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${backendURL}api/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assuming res.data.user has followers/following and posts array
      setUser((prev) => ({
        ...prev,
        followers: res.data.user.followers.length,
        following: res.data.user.following.length,
      }));
      setPosts(res.data.user.posts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const renderPost = ({ item }) => (
    <Image
      source={{ uri: item.image }}
      style={styles.postImage}
    />
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      {/* Username & Edit Profile */}
      <View style={styles.userInfo}>
        <Text style={styles.username}>{user.username}</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* User Posts */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id.toString()}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 2 }}
        scrollEnabled={false}
        style={{ marginTop: 10 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 15,
    alignItems: "center",
  },
  profilePic: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    flex: 1,
    marginLeft: 20,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  statLabel: {
    fontSize: 14,
    color: "#aaa",
  },
  userInfo: {
    paddingHorizontal: 15,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  editButton: {
    borderWidth: 1,
    borderColor: "#2E8BFF",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#2E8BFF",
    fontWeight: "600",
  },
  postImage: {
    width: POST_IMAGE_SIZE,
    height: POST_IMAGE_SIZE,
    marginBottom: 2,
  },
});
