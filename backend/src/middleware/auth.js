import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // standardize to req.user with id and email when available
    req.user = { id: payload.id || payload._id, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};
