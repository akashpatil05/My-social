// src/components/CreatePost.js
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import './CreatePost.css';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="create-post-guest">
        <p>
          You need to{' '}
          <span className="login-link" onClick={() => navigate('/login')}>
            log in
          </span>{' '}
          to create a post.
        </p>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('Post content cannot be empty!');
      return;
    }

    const newPost = {
      id: Date.now(),
      content,
      author: user.username,
      createdAt: new Date().toISOString(),
    };

    const existingPosts = JSON.parse(localStorage.getItem('posts')) || [];
    const updatedPosts = [newPost, ...existingPosts];

    localStorage.setItem('posts', JSON.stringify(updatedPosts));
    setContent('');
    onPostCreated(); // Refresh posts
  };

  return (
    <div className="create-post-container">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default CreatePost;