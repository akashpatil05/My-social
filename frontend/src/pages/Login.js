import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Auth.css'; // optional styling

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${process.env.REACT_APP_API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      // Store token & user
      localStorage.setItem('token', data.token);
      const userObj = { username: data.user.username, _id: data.user.id };
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);

      navigate('/'); // redirect to feed or dashboard
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong during login');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login to MySocial</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {error && <div className="error-msg">{error}</div>}

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;