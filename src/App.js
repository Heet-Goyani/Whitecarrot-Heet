import React, { useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import CalendarEvents from './CalendarEvents';
import './App.css'; // Import the CSS file

function AppContent() {
  const [user, setUser] = useState(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        setUser({
          accessToken: tokenResponse.access_token,
          profile: userInfo.data,
        });
      } catch (error) {
        console.error('Login Error:', error);
      }
    },
    onError: () => console.log('Login Failed'),
    scope: 'openid profile email https://www.googleapis.com/auth/calendar.readonly',
  });

  if (!user) {
    return (
      <div className="login-container">
        <div className="left-half">Google Calendar</div>
        <div className="right-half">
          <button onClick={login} className="login-button">
            <img src="https://freelogopng.com/images/all_img/1657952440google-logo-png-transparent.png" alt="Google Logo" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return <CalendarEvents user={user} />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}

export default App;
