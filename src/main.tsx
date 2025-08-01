import React from 'react';
import { createRoot } from 'react-dom/client'
import Page from './Page';
import './index.css'
import { AuthProvider } from './AuthContext';

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AuthProvider>
            <Page/>
        </AuthProvider>
    </React.StrictMode>
);
