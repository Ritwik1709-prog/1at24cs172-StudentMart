import React from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './styles.css'
import './theme.css'

const app = <React.StrictMode><App /></React.StrictMode>
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
createRoot(document.getElementById('root')).render(googleClientId
  ? <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
  : app)
