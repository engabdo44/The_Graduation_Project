
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Intercept all fetch requests to always include credentials (cookies)
const originalFetch = window.fetch;
window.fetch = function (input, init) {
    if (typeof input === 'string' || input instanceof URL) {
        init = init || {};
        init.credentials = 'include';
    } else if (input && typeof input === 'object') {
        try {
            input = new Request(input, { credentials: 'include', ...init });
        } catch (e) {
            init = init || {};
            init.credentials = 'include';
        }
    }
    return originalFetch(input, init);
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
