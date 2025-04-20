import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getWallPosts, addWallPost, getUser, addWallComment } from "../api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "../components/style/ProjectWall.css";

const ProjectWall = () => {
    const { projectId } = useParams();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [username, setUsername] = useState("");
    const [showCommentBox, setShowCommentBox] = useState({});
    const [commentInputs, setCommentInputs] = useState({});

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

    const fetchPosts = async () => {
        try {
            const data = await getWallPosts(projectId);
            setPosts(data);
        } catch (err) {
            console.error("Error loading wall posts:", err);
        }
    };

    useEffect(() => {
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

    const handleAddComment = async (postId) => {
        const commentContent = commentInputs[postId];
        if (!commentContent || !commentContent.trim()) return;
    
        try {
            const res = await addWallComment(postId, {
                userId: user.uid,
                username,
                content: commentContent.trim(),
            });
    
            setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
            fetchPosts();
        } catch (error) {
            console.error("Error adding comment:", error);
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
                            key={post.id || idx}
                            className={`wall--message ${isCurrentUser ? "current-user" : ""}`}
                        >
                            {/* Header z uporabnikom, časom in komentar ikonco */}
                            <div className="wall--message-header">
                                <div>
                                    <strong>{post.username}</strong>
                                    <span>({formattedDate})</span>
                                </div>
                                <button
                                    className="wall--comment-toggle"
                                    onClick={() =>
                                        setShowCommentBox((prev) => ({
                                            ...prev,
                                            [post.id]: !prev[post.id],
                                        }))
                                    }
                                >
                                    💬
                                </button>
                            </div>

                            {/* Vsebina objave */}
                            <p>{post.content}</p>

                            {/* Prikaz komentarjev */}
                            {post.comments &&
                                post.comments.map((comment, cIdx) => (
                                    <div key={cIdx} className="wall--comment">
                                        <strong>{comment.username}</strong>
                                        <span>
                                            (
                                            {new Date(comment.timestamp).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                            )
                                        </span>
                                        <p>{comment.content}</p>
                                    </div>
                                ))}

                            {/* Vnos komentarja */}
                            {showCommentBox[post.id] && (
                                <div className="wall--comment-box">
                                    <textarea
                                        rows="2"
                                        placeholder="Write a comment..."
                                        value={commentInputs[post.id] || ""}
                                        onChange={(e) =>
                                            setCommentInputs({
                                                ...commentInputs,
                                                [post.id]: e.target.value,
                                            })
                                        }
                                    />
                                    <Button onClick={() => handleAddComment(post.id, idx)}>
                                        Comment
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Glavni vnos za objavo */}
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
