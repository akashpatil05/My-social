// 📁 frontend/src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${process.env.REACT_APP_API}/api/users/${username}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setProfileData(data);

      // Check if current user is following this profile
      if (user && data.followers?.includes(user.username)) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    } catch (err) {
      console.error("Failed to load profile", err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const endpoint = `${process.env.REACT_APP_API}/api/users/${username}/${isFollowing ? 'unfollow' : 'follow'}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      setIsFollowing(!isFollowing);
      fetchProfile(); // Refresh profile data
    } catch (err) {
      console.error("Error following/unfollowing", err);
      setError(err.message || 'Error following/unfollowing');
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!profileData) return <div>No profile data found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{profileData.username}</h2>
        <div className="profile-stats">
          <p><strong>Posts:</strong> {profileData.posts?.length || 0}</p>
          <p><strong>Followers:</strong> {profileData.followers?.length || 0}</p>
          <p><strong>Following:</strong> {profileData.following?.length || 0}</p>
        </div>

        {user && user.username !== username && (
          <button 
            onClick={handleFollow}
            className={`follow-button ${isFollowing ? 'unfollow' : 'follow'}`}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      <div className="user-posts">
        <h3>Posts by @{username}</h3>
        {profileData.posts?.length ? (
          <div className="posts-grid">
            {profileData.posts.map((post) => (
              <div key={post._id} className="post-box">
                {post.content && <p className="post-content">{post.content}</p>}
                {post.image && (
                  <img 
                    src={post.image} 
                    alt="Post" 
                    className="post-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                {post.createdAt && (
                  <p className="post-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-posts">No posts yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;