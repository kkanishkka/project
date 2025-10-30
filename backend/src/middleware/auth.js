import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.id || payload._id;
    
    // Ensure userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Invalid user ID in token" });
    }
    
    // standardize to req.user with id and email when available
    req.user = { 
      id: new mongoose.Types.ObjectId(userId), 
      email: payload.email 
    };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};
