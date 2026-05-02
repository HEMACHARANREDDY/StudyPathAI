const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");

// In-memory user database (in production, use MongoDB/PostgreSQL)
const userDatabase = {};
const FRONTEND_URL_RAW = process.env.FRONTEND_URL || "http://localhost:5173";
// Extract just the first URL if multiple are provided
const FRONTEND_URL = FRONTEND_URL_RAW.split(",")[0].trim();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/auth/google/callback";

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function createOrUpdateUserFromGoogle(googleProfile) {
  const email = googleProfile.email;

  if (!userDatabase[email]) {
    userDatabase[email] = {
      email,
      name: googleProfile.name || "",
      googleId: googleProfile.sub,
      picture: googleProfile.picture || "",
      authMethod: "google",
      createdAt: new Date().toISOString(),
      profile: {
        gpa: "",
        gre: "",
        ielts: "",
        budget: "",
        targetCountry: "",
        preferredField: "",
        workExperience: "",
      },
      dreamScore: null,
      matchedUniversities: [],
      journeyPlan: [],
      loanEligibility: null,
      loanApplication: null,
      admitData: null,
    };
  } else {
    if (!userDatabase[email].googleId) {
      userDatabase[email].googleId = googleProfile.sub;
      userDatabase[email].picture = googleProfile.picture || userDatabase[email].picture || "";
      userDatabase[email].authMethod = userDatabase[email].authMethod === "email" ? "both" : "google";
    }
  }

  return userDatabase[email];
}

function buildGoogleAuthUrl(flow = "login", redirectUri = GOOGLE_REDIRECT_URI, state = null) {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state: state || JSON.stringify({ flow }),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function exchangeGoogleCode(code, redirectUri = GOOGLE_REDIRECT_URI) {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    throw new Error(tokenData.error_description || tokenData.error || "Google token exchange failed");
  }

  return tokenData;
}

// Store user profile on signup/login
router.post("/register", async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    if (userDatabase[email]) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    userDatabase[email] = {
      email,
      name: name || "",
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      profile: {
        gpa: "",
        gre: "",
        ielts: "",
        budget: "",
        targetCountry: "",
        preferredField: "",
        workExperience: "",
      },
      dreamScore: null,
      matchedUniversities: [],
      journeyPlan: [],
      loanEligibility: null,
      loanApplication: null,
      admitData: null,
    };

    res.json({
      success: true,
      message: "User registered successfully",
      user: {
        email,
        name,
        createdAt: userDatabase[email].createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch existing user profile
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = userDatabase[email];

    if (!user) {
      return res.status(401).json({ error: "User not found. Please sign up first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        ...user,
        password: undefined,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.post("/update-profile", async (req, res) => {
  try {
    const { email, updates } = req.body;

    if (!userDatabase[email]) {
      return res.status(404).json({ error: "User not found" });
    }

    userDatabase[email] = {
      ...userDatabase[email],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: userDatabase[email],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by email
router.post("/get-user", async (req, res) => {
  try {
    const { email } = req.body;

    // Auto-create user if doesn't exist (for demo mode)
    if (!userDatabase[email]) {
      userDatabase[email] = {
        email,
        name: email.split("@")[0],
        authMethod: "demo",
        createdAt: new Date().toISOString(),
        profile: {
          gpa: "",
          gre: "",
          ielts: "",
          budget: "",
          targetCountry: "",
          preferredField: "",
          workExperience: "",
        },
        dreamScore: null,
        matchedUniversities: [],
        journeyPlan: [],
        loanEligibility: null,
        loanApplication: null,
        admitData: null,
      };
    }

    res.json({
      success: true,
      user: {
        ...userDatabase[email],
        password: undefined,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/google-start", (req, res) => {
  console.log("=== Google OAuth Start ===");
  console.log("GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID);
  console.log("GOOGLE_REDIRECT_URI:", GOOGLE_REDIRECT_URI);
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).send("Google OAuth is not configured on the server");
  }

  const requestedOrigin = req.query.origin || req.get("origin") || FRONTEND_URL;
  const allowedOrigins = [
    FRONTEND_URL,
    FRONTEND_URL.replace(/:\d+$/, ":5173"),
    FRONTEND_URL.replace(/:\d+$/, ":5174"),
  ].filter(Boolean);
  const safeOrigin = allowedOrigins.includes(requestedOrigin) ? requestedOrigin : FRONTEND_URL;

  const state = JSON.stringify({ flow: req.query.flow || "login", origin: safeOrigin });
  const authUrl = buildGoogleAuthUrl("login", GOOGLE_REDIRECT_URI, state);
  console.log("Auth URL:", authUrl.substring(0, 100) + "...");
  res.redirect(authUrl);
});

router.post("/google-code-login", async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Google authorization code is required" });
    }

    const requestOrigin = req.get("origin") || FRONTEND_URL;
    const allowedRedirects = [requestOrigin, `${requestOrigin}/login`, FRONTEND_URL, `${FRONTEND_URL}/login`, GOOGLE_REDIRECT_URI].filter(Boolean);
    const safeRedirectUri = allowedRedirects.includes(redirectUri) ? redirectUri : FRONTEND_URL;

    const tokenData = await exchangeGoogleCode(String(code), safeRedirectUri);

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleProfile = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
      return res.status(401).json({ error: googleProfile.error || "Failed to read Google profile" });
    }

    const user = createOrUpdateUserFromGoogle(googleProfile);

    return res.json({
      success: true,
      message: "Google login successful",
      user: {
        ...user,
        password: undefined,
        lastLogin: new Date().toISOString(),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/google/callback", async (req, res) => {
  try {
    const { code, error } = req.query;
    console.log("=== Google OAuth Callback ===");
    console.log("Code:", code ? "present" : "missing");
    console.log("Error:", error);

    if (error) {
      console.error("Google OAuth Error:", error);
      return res.redirect(`${FRONTEND_URL}/login?google=error&message=${encodeURIComponent(String(error))}`);
    }

    if (!code) {
      return res.redirect(`${FRONTEND_URL}/login?google=error&message=${encodeURIComponent("Missing Google authorization code")}`);
    }

    const tokenData = await exchangeGoogleCode(String(code), GOOGLE_REDIRECT_URI);

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleProfile = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
      return res.redirect(`${FRONTEND_URL}/login?google=error&message=${encodeURIComponent(googleProfile.error || "Failed to read Google profile")}`);
    }

    const user = createOrUpdateUserFromGoogle(googleProfile);

    return res.redirect(`${FRONTEND_URL}/login?google=success&email=${encodeURIComponent(user.email)}`);
  } catch (err) {
    return res.redirect(`${FRONTEND_URL}/login?google=error&message=${encodeURIComponent(err.message)}`);
  }
});

router.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: "Google credential required" });
    }

    let googleProfile;

    if (credential.includes("@")) {
      googleProfile = {
        email: credential,
        name: credential.split("@")[0],
        sub: "demo_" + Math.random().toString(36).substr(2, 9),
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(credential.split("@")[0])}&background=0D8ABC&color=fff`,
      };
    } else {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        googleProfile = ticket.getPayload();
      } catch (err) {
        return res.status(401).json({ error: "Invalid Google token format or signature" });
      }
    }

    const user = createOrUpdateUserFromGoogle(googleProfile);

    res.json({
      success: true,
      message: "Google login successful",
      user: {
        ...user,
        password: undefined,
        lastLogin: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/link-google", async (req, res) => {
  try {
    const { email, credential } = req.body;

    if (!email || !credential) {
      return res.status(400).json({ error: "Email and credential required" });
    }

    if (!userDatabase[email]) {
      return res.status(404).json({ error: "User not found" });
    }

    let googleProfile;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      googleProfile = ticket.getPayload();
    } catch (err) {
      return res.status(401).json({ error: "Invalid Google token" });
    }

    userDatabase[email].googleId = googleProfile.sub;
    userDatabase[email].picture = googleProfile.picture || "";
    userDatabase[email].authMethod = "both";

    res.json({
      success: true,
      message: "Google account linked successfully",
      user: {
        ...userDatabase[email],
        password: undefined,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
