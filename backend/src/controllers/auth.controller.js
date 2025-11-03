import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res, next) => {
  try {
    const { name, email, password, timezone } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    // IMPORTANT: your model needs passwordHash, not password
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      tz_locked_at: new Date() // Lock timezone on registration
    });

    const token = signToken(user);
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    // Duplicate key fallback
    if (err?.code === 11000) return res.status(409).json({ error: "Email already registered" });
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    // Uses your schema method
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    // Set timezone if not locked (like registration)
    if (!user.tz_locked_at) {
      user.timezone = req.body.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      user.tz_locked_at = new Date();
      await user.save();
    }

    const token = signToken(user);
    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    // Prefer fetching fresh user data to ensure name/email are accurate
    const user = await User.findById(req.user.id).select("_id name email");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
};

export const logout = (_req, res) => {
  res.json({ message: "Logged out" });
};
