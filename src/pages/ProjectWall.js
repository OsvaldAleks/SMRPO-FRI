import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getWallPosts, addWallPost, getUser } from "../api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "../components/style/ProjectWall.css";

const ProjectWall = () => {
    const { projectId } = useParams();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [username, setUsername] = useState("");

    useEffect(() => {
        const fetchUsername = async () => {
            if (user?.uid) {
                try {
                    const userData = await getUser(user.uid);
                    setUsername(userData.username || userData.email || "unknown");
                } catch (err) {
                    console.error("Failed to load user data:", err);
                    setUsername("unknown");
                }
            }
        };
        fetchUsername();
    }, [user]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getWallPosts(projectId);
                setPosts(data);
            } catch (err) {
                console.error("Error loading wall posts:", err);
            }
        };
        fetchPosts();
    }, [projectId]);

    const handleSubmit = async () => {
        if (!newPost.trim() || !username || !user?.uid) return;

        const postData = {
            userId: user.uid,
            username,
            content: newPost.trim(),
        };

        try {
            const res = await addWallPost(projectId, postData);
            setPosts([...posts, res.post]);
            setNewPost("");
        } catch (err) {
            console.error("Failed to post to wall:", err);
        }
    };

    return (
        <div className="project-wall-container">
            <h2>Project Wall</h2>

            <div className="wall--list">
                {posts.map((post, idx) => {
                    const isCurrentUser = post.userId === user?.uid;
                    const timestamp = new Date(post.timestamp);
                    const formattedDate = timestamp.toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    });

                    return (
                        <div
                            key={idx}
                            className={`wall--message ${isCurrentUser ? "current-user" : ""}`}
                        >
                            <strong>{post.username}</strong>
                            <span>({formattedDate})</span>
                            <p>{post.content}</p>
                        </div>
                    );
                })}
            </div>

            <div className="wall--input-container">
                <textarea
                    className="wall--input"
                    rows="4"
                    placeholder="Write a message..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                />
                <Button onClick={handleSubmit} style={{ marginTop: "0.5rem" }}>
                    Post
                </Button>
            </div>
        </div>
    );
};

export default ProjectWall;
