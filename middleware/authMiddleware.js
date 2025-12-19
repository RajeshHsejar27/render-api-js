const jwt = require("jsonwebtoken");

// For demo: decode only. For production: verify signature with Entra JWKS.
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.decode(token, { complete: true });
    req.user = decoded?.payload || {};
    req.token = token; // make raw token available to routes
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token", detail: err.message });
  }
}

module.exports = { authMiddleware };
