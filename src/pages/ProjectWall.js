import React, { useEffect, useState, useContext } from "react";
import {ProjectsContext} from "../context/ProjectsContext";
import { useParams } from "react-router-dom";
import { getWallPosts, addWallPost, getUser, addWallComment, deleteWallComment, deleteWallPost } from "../api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import "../components/style/ProjectWall.css";
import { FaTrash } from "react-icons/fa";

const ProjectWall = () => {
    const { projectId } = useParams();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [username, setUsername] = useState("");
    const [showCommentBox, setShowCommentBox] = useState({});
    const [commentInputs, setCommentInputs] = useState({});
    const { projects } = useContext(ProjectsContext);

    const project = projects.find(p => p.projectId === projectId);
    const isScrumMaster = project?.userRole === "scrumMasters";
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

            // Po uspešni oddaji:
            setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
            setShowCommentBox((prev) => ({ ...prev, [postId]: false })); // Zapri vnos
            fetchPosts();
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    return (
        <div className="project-wall-page">
            <div className="center--box">
                <div className="project-wall-container">
                    <h1 className="page-title">Project Wall</h1>

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
                                <div key={post.id || idx} className={`wall--message ${isCurrentUser ? "current-user" : ""}`}>
                                    <div className="wall--message-header">
                                        <div>
                                            <strong>{post.username}</strong>
                                            <span>({formattedDate})</span>
                                        </div>

                                        <div className="wall--message-actions">
                                            <button
                                                className="wall--comment-toggle"
                                                onClick={() =>
                                                    setShowCommentBox((prev) => ({
                                                        ...prev,
                                                        [post.id]: !prev[post.id],
                                                    }))
                                                }
                                                title="Add Comment"
                                            >
                                                💬
                                            </button>

                                            {(user?.system_rights === 'Admin' || isScrumMaster) && (
                                                <FaTrash
                                                    className="p--alert"
                                                    onClick={async () => {
                                                        if (window.confirm("Are you sure you want to delete this post and its comments?")) {
                                                            try {
                                                                await deleteWallPost(post.id);
                                                                fetchPosts();
                                                            } catch (err) {
                                                                console.error("Failed to delete post:", err);
                                                            }
                                                        }
                                                    }}
                                                    title="Delete Post"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>

                                    {/* Comments */}
                                    {post.comments &&
                                        post.comments.map((comment, cIdx) => {
                                            const isOwnComment = comment.userId === user?.uid;
                                            const commentDate = new Date(comment.timestamp).toLocaleString(undefined, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            });

                                            return (
                                                <div
                                                    key={comment.id || cIdx}
                                                    className={`wall--comment ${isOwnComment ? "current-user" : ""}`}
                                                >
                                                    <div className="wall--comment-header">
                                                        <div>
                                                            <strong>{comment.username}</strong>
                                                            <span>({commentDate})</span>
                                                        </div>

                                                        {(user?.system_rights === 'Admin' || isScrumMaster) && (
                                                            <FaTrash
                                                                className="p--alert"
                                                                onClick={async () => {
                                                                    if (window.confirm("Delete this comment?")) {
                                                                        try {
                                                                            await deleteWallComment(post.id, comment.id);
                                                                            fetchPosts();
                                                                        } catch (err) {
                                                                            console.error("Failed to delete comment:", err);
                                                                        }
                                                                    }
                                                                }}
                                                                title="Delete Comment"
                                                            />
                                                        )}
                                                    </div>
                                                    <p style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                                                </div>
                                            );
                                        })}

                                    {/* Comment input */}
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
                                            <div className="comment-buttons">
                                                <Button onClick={() => handleAddComment(post.id)}>Comment</Button>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() =>
                                                        setShowCommentBox((prev) => ({
                                                            ...prev,
                                                            [post.id]: false,
                                                        }))
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    </div>

                    {/* New post input */}
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
            </div>
        </div>
    );
};

export default ProjectWall;
