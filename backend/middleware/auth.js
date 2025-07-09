const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔐 Token decoded:", decoded); // ✅ Check what’s inside
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid Token' });
  }
};