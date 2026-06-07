import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Truck, Package, Map as MapIcon, Bell, Search, Menu, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const sidebarItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Truck, label: 'Fleet', path: '/vehicles' },
  { icon: Package, label: 'Orders', path: '/orders' },
  { icon: MapIcon, label: 'Live Map', path: '/map' },
  { icon: Zap, label: 'Health', path: '/health' },
];

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <motion.aside initial={{ width: 260 }} animate={{ width: isSidebarOpen ? 260 : 80 }} className="relative z-20 h-screen hidden md:flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Truck size={18} className="text-white" />
          </div>
          {isSidebarOpen && <span className="font-bold text-lg tracking-tight whitespace-nowrap">Nexus Logistics</span>}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <div className={`flex items-center px-3 py-3 rounded-xl transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                  <item.icon size={20} />
                  {isSidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden">
        <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold">Logistics Command</h2>
        </header>
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </main>
    </div>
  );
}