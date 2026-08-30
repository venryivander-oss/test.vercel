import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Users, Package, ShoppingCart, ShoppingBag, ClipboardList, FileText, Sun, Moon, Menu, X } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/suppliers', icon: <Users size={20} />, label: 'Suppliers' },
    { path: '/products', icon: <Package size={20} />, label: 'Products' },
    { path: '/purchases', icon: <ShoppingCart size={20} />, label: 'Restock' },
    { path: '/pos', icon: <ShoppingBag size={20} />, label: 'POS (Kasir)' },
    { path: '/opnames', icon: <ClipboardList size={20} />, label: 'Stock Opname' },
    { path: '/reports', icon: <FileText size={20} />, label: 'Laporan' },
  ];

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-200 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
      
      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar (Desktop static, Mobile drawer) */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 flex flex-col border-r shadow-md transition-transform duration-300 transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        
        <div className={`p-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <h1 className="text-xl font-bold text-blue-500">POS System</h1>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded font-mono ${darkMode ? 'bg-gray-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              {darkMode ? 'DARK' : 'LIGHT'}
            </span>
            <button 
              onClick={() => setMobileMenuOpen(false)} 
              className="md:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors font-medium ${
                  isActive
                    ? darkMode 
                      ? 'bg-blue-900/50 text-blue-400 border border-blue-800' 
                      : 'bg-blue-50 text-blue-600'
                    : darkMode
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        {/* Header */}
        <header className={`shadow-sm p-3 md:p-4 flex justify-between items-center border-b transition-colors duration-200 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3">
            {/* Hamburger Toggle Button for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              title="Buka Menu Navigation"
            >
              <Menu size={22} />
            </button>

            <h2 className="text-lg md:text-xl font-semibold capitalize text-gray-800 dark:text-gray-100">
              {navItems.find((item) => item.path === location.pathname)?.label || 'Page'}
            </h2>
          </div>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className={`flex items-center space-x-2 px-3 py-1.5 md:py-2 rounded-lg border text-xs md:text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700'
                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            title="Ganti Mode Terang / Gelap"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>
        </header>

        {/* Dynamic Page Content */}
        <div className={`flex-1 p-3 md:p-6 overflow-y-auto ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
