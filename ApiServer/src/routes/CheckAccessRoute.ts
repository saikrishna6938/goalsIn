import SessionManager, { ValidSession } from "../session/SessionManager";

// Create the middleware function to check the access token
export const checkAccessRoute = (req, res, next) => {
  const accessToken = req.headers["authorization"];
  if (!accessToken) {
    return res.status(401).json({ error: "Access token is missing" });
  }
  const check = SessionManager.checkAccessToken(accessToken);
  if (check == ValidSession.TokenNotValid) {
    return res.status(401).json({ error: "Invalid access token" });
  }

  // If the token is valid, you can proceed to the next middleware or route
  next();
};
