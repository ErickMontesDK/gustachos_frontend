import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import '../styles/layout.css';

interface LayoutVars {
    children: React.ReactNode;
    role: string;
    name: string;
}

export default function Layout({ children, role, name }: LayoutVars) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="d-flex bg-light min-vh-100 flex-column flex-md-row">
            {/* Mobile Top Bar */}
            <header className="mobile-top-bar px-3">
                <button
                    className="btn btn-link text-dark p-0 me-3"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu size={24} />
                </button>
                <h5 className="mb-0 fw-bold">EchoRoute</h5>
            </header>

            {/* Backdrop Overlay for Mobile */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            <Sidebar
                role={role}
                name={name}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            <main className="main-content">
                <div className="container-fluid">
                    {children}
                </div>
            </main>
        </div>
    );
};



