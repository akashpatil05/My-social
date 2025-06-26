import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user } = useUser();

  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.username === username;

  const fetchProfile = useCallback(async () => {
  try {
    setLoading(true);
    const res = await fetch(`${process.env.REACT_APP_API}/api/users/${username}`);
    const data = await res.json();

    console.log('Profile response:', data);

    if (res.ok) {
      setProfile(data.user);
      setUserPosts(Array.isArray(data.posts) ? data.posts : []);
      setIsFollowing(data.user.followers.includes(user?._id));
    } else {
      console.error('Failed to fetch profile:', data.message);
    }
  } catch (err) {
    console.error('Error fetching profile:', err);
  } finally {
    setLoading(false);
  }
}, [username, user]);


  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFollowToggle = async () => {
    if (!user) return alert('Please log in to follow users.');

    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const token = localStorage.getItem('token');

      const res = await fetch(`${process.env.REACT_APP_API}/api/users/${username}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.message);
        alert(data.message || 'Something went wrong while updating follow status');
        return;
      }

      // Refresh profile data
      fetchProfile();
    } catch (err) {
      console.error('Follow/unfollow error:', err);
      alert('Something went wrong while updating follow status');
    }
  };

  if (loading) return <div className="profile-page"><p>Loading...</p></div>;

  return (
    <div className="profile-page">
      {profile && (
        <div className="profile-header">
          <img
            src={profile.profilePicture || '/default-avatar.png'}
            alt="Avatar"
          />

          <div className="profile-info">
            <h2>{profile.username}</h2>

            <div className="profile-stats">
              <span>{userPosts.length} Posts</span>
              <span>{profile.followers.length} Followers</span>
              <span>{profile.following.length} Following</span>
            </div>

            <div className="profile-actions">
              {isOwnProfile ? (
                <button className="edit-btn">Edit Profile</button>
              ) : (
                <button
                  className={`follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="profile-posts-column">
        {Array.isArray(userPosts) && userPosts.length > 0 ? (
          userPosts.map((post) => (
            <div key={post._id} className="profile-post">
              <p>{post.content}</p>
              {post.image && <img src={post.image} alt="Post" />}
            </div>
          ))
        ) : (
          <p>No posts yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
