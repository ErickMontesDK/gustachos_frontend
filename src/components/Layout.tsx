import React, { useState } from 'react';
import Sidebar from './Sidebar';
import '../styles/layout.css';

interface LayoutVars {
    children: React.ReactNode;
    role: string;
    name: string;
}

export default function Layout({ children, role, name }: LayoutVars) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="d-flex bg-light min-vh-100">
            <Sidebar role={role} name={name} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className="main-content">
                <div className="container-fluid">
                    {children}
                </div>
            </main>
        </div>
    );
};



