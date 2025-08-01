import React from 'react';

const Loading: React.FC = () => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f5f6fa'
    }}>
        <div style={{
            width: 60,
            height: 60,
            border: '6px solid #e0e0e0',
            borderTop: '6px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: 24, color: '#555', fontSize: 18 }}>Loading...</p>
        <style>
            {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}
        </style>
    </div>
);

export default Loading;