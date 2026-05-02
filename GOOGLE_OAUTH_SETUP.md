# Google OAuth Setup Guide for StudyPath AI

## Problem
Google OAuth returns `redirect_uri_mismatch` error when trying to sign in.

## Root Cause
The OAuth credentials (Client ID & Secret) in `.env` don't match the configuration in Google Cloud Console, OR the redirect URIs aren't properly registered.

## Solution: Step-by-Step Setup

### 1. Create/Access Google Cloud Project
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing one for StudyPath AI
- Enable the Google+ API

### 2. Create OAuth 2.0 Credentials
- Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
- Application type: **Web application**
- Name: StudyPath AI

### 3. Add Authorized Redirect URIs
Under "Authorized redirect URIs", add these:
```
http://localhost:5000/auth/google/callback
http://127.0.0.1:5000/auth/google/callback
http://localhost:5000/api/auth/google-callback
```

### 4. Copy Your Credentials
- Copy the **Client ID** and **Client Secret**
- Update `.env` file in backend:
  ```
  GOOGLE_CLIENT_ID=<your-client-id>
  GOOGLE_CLIENT_SECRET=<your-client-secret>
  GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
  ```

### 5. Save & Restart
- Save the `.env` file
- Backend will auto-restart with nodemon
- Try Google login again

## Current Status
- ✅ Backend server running on `localhost:5000`
- ✅ Frontend server running on `localhost:5173`  
- ✅ Demo login working (fallback)
- ❌ Google OAuth needs credentials configuration

## For Now: Use Demo Login
Click "Or use demo login for testing" on the login page to test the app without Google OAuth setup.

## Temporary Fix
If Google OAuth continues to fail, the app automatically falls back to demo login mode to let you test all features.
