// src/pages/Dashboard.js
import React from 'react';
import { useUser } from '../context/UserContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useUser();

  return (
    <div className="dashboard-container">
      {/* Profile Header */}
      <div className="profile-header">
        <img
          src={user?.profilePic || "https://via.placeholder.com/100"}
          alt="Profile"
          className="profile-image"
        />
        <h2 className="username">{user?.username || 'Guest User'}</h2>
      </div>

      {/* Welcome Text */}
      <h1 className="dashboard-heading">Welcome to the Dashboard</h1>
      <p className="dashboard-welcome">Hello, {user?.username || 'Guest'} 👋</p>

      {/* Feature Cards */}
      <div className="dashboard-cards">
        <div className="card">
          <h3>Your Posts</h3>
          <p>Check and manage your social posts here.</p>
        </div>
        <div className="card">
          <h3>Notifications</h3>
          <p>Stay updated with what's happening.</p>
        </div>
        <div className="card">
          <h3>Profile</h3>
          <p>Edit your profile and preferences.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;