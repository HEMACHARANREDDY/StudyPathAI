# Google Login Setup Guide

## Overview
StudyPath AI now supports Google login in addition to email/password authentication. Users can:
- Sign in with Google account
- Sign up with Google (creates new profile)
- Link Google to existing email account

## Files Modified
- `frontend/src/pages/Login.jsx` - Added Google Sign-In button
- `backend/routes/auth.js` - Added Google OAuth endpoints

## Setup Instructions

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Select **Web application**
6. Add authorized origins:
   - `http://localhost:5173` (for development)
   - `http://localhost:3000` (if you use different port)
   - Your production domain
7. Add authorized redirect URIs:
   - `http://localhost:5173` 
   - Your production domain
8. Copy the **Client ID**

### Step 2: Configure Frontend

Replace `YOUR_GOOGLE_CLIENT_ID` in `frontend/src/pages/Login.jsx` with your actual Client ID:

```javascript
window.google.accounts.id.initialize({
  client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
  callback: handleGoogleLogin,
});
```

### Step 3: Backend Endpoints

The backend now provides these Google OAuth endpoints:

#### POST `/api/auth/google-login`
Authenticate with Google and create/retrieve user profile
```json
{
  "credential": "JWT_TOKEN_FROM_GOOGLE"
}
```

Response:
```json
{
  "success": true,
  "message": "Google login successful",
  "user": {
    "email": "user@gmail.com",
    "name": "User Name",
    "googleId": "123456789",
    "picture": "https://...",
    "authMethod": "google",
    ...allUserData
  }
}
```

#### POST `/api/auth/link-google`
Link Google account to existing email-based account
```json
{
  "email": "existing@email.com",
  "credential": "JWT_TOKEN_FROM_GOOGLE"
}
```

## Features

✅ **Google Sign-In** - Login with Google account  
✅ **Google Sign-Up** - Create new account with Google  
✅ **Account Linking** - Connect Google to email account  
✅ **User Profile** - Auto-fill name and picture from Google  
✅ **Persistent Login** - User data saved and retrieved on return  

## Login Methods
Users can now use either:
1. **Email & Password** - Traditional method
2. **Google Sign-In** - OAuth 2.0

## Testing Google Login (Without Setup)

For quick testing without configuring Google OAuth:

1. Comment out the Google button in Login.jsx temporarily
2. Or replace with a demo button that simulates Google login
3. Test the email/password method first

## Production Checklist

- [ ] Replace Client ID with production value
- [ ] Add production domain to Google Console
- [ ] Use environment variables for Client ID: `process.env.REACT_APP_GOOGLE_CLIENT_ID`
- [ ] Backend should verify Google JWT tokens using `google-auth-library`
- [ ] Store user data in MongoDB/PostgreSQL instead of memory
- [ ] Hash passwords with bcrypt
- [ ] Use JWT tokens for session management
- [ ] Enable HTTPS for all OAuth redirects

## Error Handling

The system handles:
- Invalid or expired Google tokens
- Users logging in for first time with Google
- Returning users logging in with Google
- Linking Google to existing email account

## Security Considerations

⚠️ **In Production:**
1. Use `google-auth-library` to verify JWT tokens properly
2. Never trust client-side token verification
3. Store Google ID securely in database
4. Use HTTPS for all OAuth flows
5. Implement CSRF protection
6. Add rate limiting to auth endpoints

## User Journey

### New User Signs Up with Google
```
1. Click "Sign in with Google"
2. Google authentication popup
3. Backend creates new user account
4. Auto-fills: email, name, picture
5. Redirects to onboarding
```

### Returning User Logs In with Google
```
1. Click "Sign in with Google"
2. Google authentication
3. Backend retrieves existing user profile
4. All previous data (universities, loans, etc.) loaded
5. Redirects to dashboard
```

## Support

For issues:
- Check Google Console configuration
- Verify Client ID is correct
- Ensure origin URLs are whitelisted
- Check browser console for errors

---

**Note:** Replace `YOUR_GOOGLE_CLIENT_ID` with your actual credential from Google Cloud Console to enable Google Sign-In.
