import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './Components/App.jsx'
import { migrateData } from './utils/dataMigration'

migrateData();


const GOOGLE_CLIENT_ID = '94330046163-dv3qulqstsntu5fe1aarkpiq12slrqas.apps.googleusercontent.com';






createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)


