export const notFound = (req, res, next) => {
  res.status(404).json({ error: "Route not found" });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const code = err.status || 500;
  res.status(code).json({ error: err.message || "Server error" });
};
