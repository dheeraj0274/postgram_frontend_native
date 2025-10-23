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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "John Doe", _id: null });
  const [posts, setPosts] = useState([]);
  
  const [commentText, setCommentText] = useState({});
  const backendURL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const [refreshing, setRefreshing] = useState(false);

 
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
    (id) => id && currentUser._id && id.toString() === currentUser._id.toString()
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




const onRefresh=async()=>{
  setRefreshing(true);
  await fetchUserAndPosts();
  setRefreshing(false)

}
  




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

  const renderPost = ({ item }) => {

const imageURL = item.image?.startsWith("http")
    ? item.image
    : `${backendURL}${item.image?.replace(/\\/g, "/")}`;

  

    return(
    
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
          <Text style={[styles.actionText, item.userLiked && styles.liked]}>
            {item?.userLiked? '❤️' : '🤍'}
             {item.likesCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.actionText}>💬 {item.comments.length}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.caption}>
        <Text style={styles.bold}>{item.userName}</Text> {item.caption}
      </Text>

      <View style={styles.commentsList}>
        {item.comments.map((c, index) => (
          <Text key={index} style={styles.commentText}>
            <Text style={styles.bold}>
              {c?.user?.name || "Unknown"}
            </Text>{" "}
            {c.text}
          </Text>
        ))}
      </View>

      <View style={styles.commentContainer}>
        <TextInput
          placeholder="Add a comment..."
          placeholderTextColor="#aaa"
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
}

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Text style={styles.logo}>Postgram</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/addPost")}
        >
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" , paddingTop:40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "#1E1E1E",
  },
  logo: { fontSize: 22, fontWeight: "bold", color: "#FFD700" },
  addButton: {
    backgroundColor: "#FFD700",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: { color: "#121212", fontSize: 26, marginTop: -2 },
  postContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 15,
    backgroundColor: "#1E1E1E",
    paddingBottom: 5,
  },
  postHeader: { flexDirection: "row", alignItems: "center", padding: 10 },
  userName: { fontWeight: "600", color: "#FFD700" },
  postImage: { width: "100%", height: 300, resizeMode: "cover" },
  postActions: { flexDirection: "row", justifyContent: "flex-start", padding: 10 },
  actionText: { fontSize: 16, marginRight: 20, color: "#fff" },
  liked: { color: "#FF4500" },
  caption: { paddingHorizontal: 10, paddingBottom: 10, color: "#EEE" },
  bold: { fontWeight: "600", color: "#FFD700" },
  commentsList: { paddingHorizontal: 10, paddingBottom: 10 },
  commentText: { color: "#ccc", marginBottom: 3 },
  commentContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    color: "#fff",
    backgroundColor: "#2C2C2C",
  },
  commentButton: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  commentButtonText: { color: "#121212", fontWeight: "600" },
});
