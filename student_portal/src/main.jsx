import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './assets/css/bootstrap.min.css';
import './assets/css/style.css';
import './assets/vendors/bootstrap-icons/bootstrap-icons.css';
import "boxicons/css/boxicons.min.css";
import './admin/assets/css/demo.css';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,  
)
