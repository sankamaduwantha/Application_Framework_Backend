// ─── Auth Placeholder Middleware ──────────────────────────────────────────────
// This is a STUB. Replace the body with real JWT verification once
// the authController login + generateToken flow is fully wired.
//
// When ready, implement as:
//   const decoded = verifyJWT(token);
//   req.user = await User.findById(decoded.userId).select("-password");

export const protect = async (req, res, next) => {
  // TODO: extract Bearer token from req.headers.authorization
  // TODO: call verifyJWT(token) from utils/generateToken.js
  // TODO: attach decoded user to req.user
  next(); // pass-through until auth is implemented
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // TODO: Check req.user.role against allowed roles
    // if (!roles.includes(req.user.role)) {
    //   return res.status(403).json({ success: false, message: "Access denied" });
    // }
    next(); // pass-through until auth is implemented
  };
};
