import { useState } from 'react';
import { 
  LayoutDashboard, 
  Sliders, 
  FlaskConical, 
  Sparkles, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Fingerprint,
  TrendingUp,
  Layers,
  Scale,
  Database
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'selection', name: 'Material Selection', icon: Sliders },
    { id: 'analysis', name: 'Material Analysis', icon: FlaskConical },
    { id: 'fingerprint', name: 'Material Fingerprint', icon: Fingerprint },
    { id: 'sensitivity', name: 'Sensitivity Analysis', icon: TrendingUp },
    { id: 'comparison', name: 'Comparison Lab', icon: Layers },
    { id: 'benchmarks', name: 'Benchmarks', icon: Scale },
    { id: 'analytics', name: 'Dataset Analytics', icon: Database },
    { id: 'xai', name: 'Explainable AI', icon: Sparkles },
    { id: 'insights', name: 'Project Insights', icon: BookOpen },
  ];

  return (
    <motion.aside 
      id="main-sidebar"
      className="sticky top-0 h-screen z-30 flex flex-col justify-between border-r border-blue-900/30 bg-[#0B0F19] backdrop-blur-md transition-all duration-300"
      animate={{ width: isCollapsed ? '72px' : '260px' }}
    >
      <div className="flex flex-col flex-1 py-6 px-3">
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-3 mb-8 h-12 overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-600 shadow-md shadow-blue-500/30 flex-shrink-0 font-bold text-white">
            A
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col whitespace-nowrap"
            >
              <h1 className="font-sans font-bold text-sm tracking-widest text-blue-400 uppercase">AutoMat AI</h1>
              <span className="text-[10px] font-mono opacity-50">v4.2.0 RESEARCH GRADE</span>
            </motion.div>
          )}
        </div>

        {/* Navigation Items */}
        <nav id="sidebar-nav" className="space-y-1.5 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`btn-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded cursor-pointer transition-all duration-200 group text-left ${
                  isActive 
                    ? 'bg-blue-600/10 border-l-2 border-blue-500 text-blue-400' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400 animate-pulse' : 'text-slate-400 group-hover:text-white'}`} />
                {!isCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-sans text-xs font-semibold whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-blue-900/30 flex justify-between items-center text-[10px] opacity-40 uppercase tracking-tighter px-6">
        {!isCollapsed && <span>IEEE 2024.9</span>}
        <button
          id="btn-sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
