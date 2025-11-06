import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import ProfileScreen from "./profile";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "John Doe", _id: null });
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [isProfile, setIsProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const backendURL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const [stories, setStories] = useState([
    { id: 1, name: "You", image: "https://i.pravatar.cc/150?img=68", isUser: true },
    { id: 2, name: "Riya", image: "https://i.pravatar.cc/150?img=2" },
    { id: 3, name: "Arjun", image: "https://i.pravatar.cc/150?img=5" },
    { id: 4, name: "Maya", image: "https://i.pravatar.cc/150?img=8" },
    { id: 5, name: "Amit", image: "https://i.pravatar.cc/150?img=10" },
  ]);

  const fetchUserAndPosts = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      let currentUser = { _id: null };
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
        setUser(currentUser);
      }

      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${backendURL}api/getAll`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formattedPosts = res.data.posts.map((p) => ({
        ...p,
        userName: p.userId?.name || "Unknown",
        likesCount: p.likes?.length || 0,
        userLiked: p.likes?.some(
          (id) =>
            id && currentUser._id && id.toString() === currentUser._id.toString()
        ),
      }));

      setPosts(formattedPosts);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserAndPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserAndPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        `${backendURL}/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
              ...post,
              likesCount: post.userLiked
                ? post.likesCount - 1
                : post.likesCount + 1,
              userLiked: !post.userLiked,
            }
            : post
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const text = commentText[postId];
      if (!text) return;

      const res = await axios.post(
        `${backendURL}/${postId}api/comment`,
        { comment: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newComment = res.data.comments;
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        )
      );
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error(err);
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Text style={styles.userName}>{item.userName}</Text>
      </View>

      {item.image && (
        <Image
          source={{
            uri: item.image.startsWith("http")
              ? item.image
              : `${backendURL}${item.image.replace(/\\/g, "/")}`,
          }}
          style={styles.postImage}
        />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity onPress={() => handleLike(item._id)}>
          <Ionicons
            name={item.userLiked ? "heart" : "heart-outline"}
            size={22}
            color={item.userLiked ? "#2E8BFF" : "#ccc"}
            style={{ marginRight: 20 }}
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="chatbubble-outline" size={22} color="#ccc" />
        </TouchableOpacity>
        <Text style={styles.likesCount}>{item.likesCount}</Text>
      </View>

      <Text style={styles.caption}>
        <Text style={styles.bold}>{item.userName}</Text> {item.caption}
      </Text>

      <View style={styles.commentsList}>
        {item.comments.map((c, index) => (
          <Text key={index} style={styles.commentText}>
            <Text style={styles.bold}>{c?.user?.name || "Unknown"}</Text>{" "}
            {c.text}
          </Text>
        ))}
      </View>

      <View style={styles.commentContainer}>
        <TextInput
          placeholder="Add a comment..."
          placeholderTextColor="#888"
          value={commentText[item._id] || ""}
          onChangeText={(text) =>
            setCommentText((prev) => ({ ...prev, [item._id]: text }))
          }
          style={styles.commentInput}
        />
        <TouchableOpacity
          style={styles.commentButton}
          onPress={() => handleComment(item._id)}
        >
          <Text style={styles.commentButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>


      {
        isProfile ? <ProfileScreen /> :

          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logo}>𝓟𝓸𝓼𝓽𝓰𝓻𝓪𝓶</Text>
              <TouchableOpacity onPress={() => router.push("/addPost")}>
                <Ionicons name="add-circle" size={32} color="#2E8BFF" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="notifications-outline" size={26} color="#ccc" />
              </TouchableOpacity>
            </View>

            {/* 🔹 Story Section */}
            <View style={styles.storyContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 12 }}
              >
                {stories.map((story) => (
                  <View key={story.id} style={styles.storyItem}>
                    <View style={[styles.storyOuterCircle, { borderColor: story.isUser ? "#2E8BFF" : '#aaa' }]}>
                      <Image source={{ uri: story.image }} style={styles.storyImage} />
                      {story.isUser && (
                        <View style={styles.addIconContainer}>
                          <Ionicons name="add-circle" size={22} color="#3ec7edff" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={styles.storyName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {story.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Feed */}
            <FlatList
              data={posts}
              keyExtractor={(item) => item._id.toString()}
              renderItem={renderPost}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />


          </View>



      }
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => { setActiveTab("home"); setIsProfile(false) }}
          style={styles.navItem}
        >
          <Ionicons
            name={activeTab === "home" ? "home" : "home-outline"}
            size={26}
            color={activeTab === "home" ? "#f5ff2eff" : "#aaa"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("search")}
          style={styles.navItem}
        >
          <Ionicons
            name={activeTab === "search" ? "search" : "search-outline"}
            size={26}
            color={activeTab === "search" ? "#f5ff2eff" : "#aaa"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("reels")}
          style={styles.navItem}
        >
          <Ionicons
            name={activeTab === "reels" ? "film" : "film-outline"}
            size={26}
            color={activeTab === "reels" ? "#f5ff2eff" : "#aaa"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setActiveTab("profile");
            setIsProfile(true)
           
          }}
          style={styles.navItem}
        >
          <Ionicons
            name={activeTab === "profile" ? "person" : "person-outline"}
            size={26}
            color={activeTab === "profile" ? "#f5ff2eff" : "#aaa"}
          />
        </TouchableOpacity>
      </View>


    </View>





  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f", paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
    backgroundColor: "#121212",
  },
  logo: { fontSize: 30, fontWeight: "700", color: "#E0E0E0" },

  /* 🔹 Story Section */
  storyContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
    paddingVertical: 10,
    backgroundColor: "#121212",
  },
  storyItem: {
    alignItems: "center",
    marginRight: 16,
  },
  storyOuterCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#5fff2eff",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  storyImage: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  addIconContainer: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#121212",
    borderRadius: 20,
  },
  storyName: {
    color: "#E0E0E0",
    fontSize: 12,
    marginTop: 6,
    maxWidth: 70,
    textAlign: "center",
  },

  /* Feed + Bottom Nav */
  postContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
    marginBottom: 15,
    backgroundColor: "#181818",
    paddingBottom: 5,
  },
  postHeader: { flexDirection: "row", alignItems: "center", padding: 10 },
  userName: { fontWeight: "600", color: "#E0E0E0" },
  postImage: { width: "100%", height: 300, resizeMode: "cover" },
  postActions: { flexDirection: "row", alignItems: "center", padding: 10 },
  likesCount: { color: "#bbb", marginLeft: 8, fontSize: 14 },
  caption: { paddingHorizontal: 10, paddingBottom: 10, color: "#d4d4d4" },
  bold: { fontWeight: "600", color: "#E0E0E0" },
  commentsList: { paddingHorizontal: 10, paddingBottom: 10 },
  commentText: { color: "#aaa", marginBottom: 3 },
  commentContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    color: "#fff",
    backgroundColor: "#1f1f1f",
  },
  commentButton: {
    backgroundColor: "#2E8BFF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  commentButtonText: { color: "#fff", fontWeight: "600" },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#121212",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1f1f1f",
  },
  navItem: { alignItems: "center", justifyContent: "center" },
});
