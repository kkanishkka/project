import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Ensure HashRouter has a hash; avoid blank screen when opening without '#/'
// Only replace if there's no hash and no pathname (to avoid interfering with direct links)
if (!window.location.hash && window.location.pathname === '/') {
  window.location.replace('#/');
}

createRoot(document.getElementById('root')).render(
  <App />
);
