// 📁 src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log('🆕 Register response:', data);

      if (!res.ok) {
        alert(data.message || 'Registration failed');
        return;
      }

      if (!data.token) {
        alert('No token received from server');
        return;
      }

      // ✅ Save token and username to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      console.log('✅ Token saved:', data.token);

      setUser({ username: data.username });
      navigate('/');
    } catch (err) {
      console.error('❌ Registration Error:', err);
      alert('Something went wrong');
    }
  };

  return (
    <div className="register-container">
      <h2>Create an Account</h2>
      <form onSubmit={handleRegister} className="register-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
      <p className="redirect-msg">
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default Register;