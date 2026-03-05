import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarCollapsed(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
            <Sidebar />
            <main
                className="sidebar-content transition-[margin] duration-300 ease-in-out"
                style={{ minHeight: '100vh' }}
            >
                <div
                    style={{
                        padding: '2rem 2.5rem',
                        maxWidth: '1400px',
                    }}
                >
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
