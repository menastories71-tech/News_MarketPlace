import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global error handler for ResizeObserver errors
const resizeObserverErrHandler = (error) => {
  if (error.message && error.message.includes('ResizeObserver')) {
    // Ignore ResizeObserver errors as they are harmless
    return;
  }
  // Re-throw other errors
  throw error;
};

// Add global error handler
window.addEventListener('error', (event) => {
  resizeObserverErrHandler(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('ResizeObserver')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
