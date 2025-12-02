import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api/api';


export default function Dashboard() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };

    const handleMockLogin = () => {
        // Redirect to mock OAuth endpoint
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/mock-airtable`;
    };

    if (!isLoggedIn) {
        return (
            <div className="container">
                <h2>Dashboard</h2>
                <p>You need to log in to create and manage forms.</p>
                <div style={{ marginBottom: 12 }}>
                    <button onClick={() => api.startOAuth()}>Log in with Airtable</button>
                </div>
                <div style={{ marginTop: 12, padding: 12, border: '1px solid #fbbf24', background: '#fef3c7' }}>
                    <strong>For testing without Airtable credentials:</strong>
                    <button onClick={handleMockLogin} style={{ marginLeft: 12, background: '#3b82f6' }}>Mock Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <h2>Dashboard</h2>
            <div style={{ marginBottom: 12 }}>
                <button onClick={handleLogout} style={{ background: '#ef4444' }}>Log out</button>
            </div>
            <div className="row">
                <Link to="/builder"><button>Create a form</button></Link>
                <Link to="/forms"><button style={{ background: '#10b981' }}>My forms</button></Link>
            </div>
        </div>
    );
}