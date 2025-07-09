// 📁 backend/server.js

require('dotenv').config(); // Load .env first

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON body

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connected to MongoDB");
  // Start server only after DB connects
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log("🚀 Server running on http://localhost:${PORT}");
  });
})
.catch(err => {
  console.error("❌ MongoDB connection failed:", err);
});