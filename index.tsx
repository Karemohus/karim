import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DataProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </DataProvider>
  </React.StrictMode>
);
