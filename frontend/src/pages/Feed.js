import React, { useState, useEffect } from 'react';
import './Feed.css';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';

const Feed = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [likedPosts, setLikedPosts] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API}/api/posts`);
        const data = await res.json();

        const postsWithComments = await Promise.all(
          data.map(async (post) => {
            const res = await fetch(`${process.env.REACT_APP_API}/api/comments/${post._id}`);
            const comments = await res.json();
            return { ...post, comments };
          })
        );

        setPosts(postsWithComments);
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };
    fetchPosts();
  }, []);

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !imageFile) return;

    try {
      let base64Image = '';
      if (imageFile) base64Image = await toBase64(imageFile);

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newPost,
          image: base64Image,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Post failed:', data);
        alert(data.message || 'Failed to create post');
        return;
      }

      setPosts([data, ...posts]);
      setNewPost('');
      setImageFile(null);
      setPreview(null);
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Something went wrong while creating post');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLike = (postId) => {
    if (!user) return alert('Login to like posts');
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Delete failed:', data);
        alert(data.message || 'Failed to delete post');
        return;
      }

      setPosts(posts.filter((p) => p._id !== postId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Something went wrong while deleting post');
    }
  };

  const handleCommentSubmit = async (postId) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API}/api/comments/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentText: comment }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Comment failed:', data);
        alert(data.message || 'Failed to add comment');
        return;
      }

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p._id === postId ? { ...p, comments: [...p.comments, data] } : p
        )
      );
      setCommentInputs({ ...commentInputs, [postId]: '' });
    } catch (err) {
      console.error('Comment error:', err);
      alert('Something went wrong while adding comment');
    }
  };

  return (
    <div className="feed-container">
      {user ? (
        <div className="create-post enhanced">
          <textarea
            placeholder="What's on your mind? ✍️"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />

          <label htmlFor="image-upload" className="upload-label">
            📷 Choose Image
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
            </div>
          )}

          <button className="post-btn" onClick={handleCreatePost}>
            🚀 Post
          </button>
        </div>
      ) : (
        <div className="no-posts">
          <h3>Welcome to MySocial 👋</h3>
          <p>Log in to create a post!</p>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="no-posts">
          <h3>No posts yet</h3>
          <p>Be the first to post!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post._id} className="post animated">
            <div className="post-header">
              <Link to={`/user/${post.username}`} className="user-tag">
                @{post.username}
              </Link>
              {user?.username === post.username && (
                <button
                  className="delete-btn"
                  title="Delete post"
                  onClick={() => handleDelete(post._id)}
                >
                  <span role="img" aria-label="delete">🗑️</span>
                </button>
              )}
            </div>

            <div className="post-content">{post.content}</div>

            {post.image && (
              <div className="post-image">
                <img src={post.image} alt="Post" />
              </div>
            )}

            <div className="post-actions">
              <button className="like-btn" onClick={() => handleLike(post._id)}>
                {likedPosts.includes(post._id) ? '❤️' : '🤍'} Like
              </button>
            </div>

            {post.comments?.length > 0 && (
              <div className="comments-section">
                {post.comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <strong>@{comment.username}</strong>: {comment.text}
                  </div>
                ))}
              </div>
            )}

            {user && (
              <div className="comment-box">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post._id] || ''}
                  onChange={(e) =>
                    setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                  }
                />
                <button onClick={() => handleCommentSubmit(post._id)}>Comment</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Feed;