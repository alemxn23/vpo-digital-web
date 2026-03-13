import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global error tracking to help debug "white screen" issues on Vercel
window.onerror = function (message, source, lineno, colno, error) {
  console.error("Global Error Caught:", message, "at", source, ":", lineno);
  alert("Error Detectado: " + message + "\nEn: " + source + ":" + lineno);
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);