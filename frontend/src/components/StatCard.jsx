import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, colorClass = "from-purple-500 to-cyan-500" }) {
  return (
    <div className="relative group rounded-2xl p-6 bg-[#111111]/80 border border-white/10 flex flex-col justify-between">
       <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} bg-opacity-20`}>
            <Icon size={20} />
          </div>
        </div>
    </div>
  );
}