import React, { createContext, useContext, useState, useEffect } from 'react';

const PostContext = createContext();

export const usePost = () => useContext(PostContext);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const savedPosts = localStorage.getItem('posts');
    if (savedPosts) setPosts(JSON.parse(savedPosts));
  }, []);

  useEffect(() => {
    localStorage.setItem('posts', JSON.stringify(posts));
  }, [posts]);

  const addPost = (post) => setPosts([post, ...posts]);
  const deletePost = (id) => setPosts(posts.filter((p) => p.id !== id));

  return (
    <PostContext.Provider value={{ posts, addPost, deletePost }}>
      {children}
    </PostContext.Provider>
  );
};