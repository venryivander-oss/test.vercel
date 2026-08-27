import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Users, Package, ShoppingCart, ShoppingBag, ClipboardList, FileText, Sun, Moon } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
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
    <div className={`flex h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
      {/* Sidebar */}
      <aside className={`w-64 flex flex-col border-r shadow-md transition-colors duration-200 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className={`p-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <h1 className="text-xl font-bold text-blue-500">POS System</h1>
          <span className={`text-xs px-2 py-0.5 rounded font-mono ${darkMode ? 'bg-gray-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
            {darkMode ? 'DARK' : 'LIGHT'}
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className={`shadow-sm p-4 flex justify-between items-center border-b transition-colors duration-200 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <h2 className="text-xl font-semibold capitalize">
            {navItems.find((item) => item.path === location.pathname)?.label || 'Page'}
          </h2>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700'
                : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            title="Ganti Mode Terang / Gelap"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>
        </header>

        <div className={`flex-1 p-6 overflow-y-auto ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
