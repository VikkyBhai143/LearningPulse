import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  user: any;
}

export default function Sidebar({ open, onClose, user }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { name: "Dashboard", icon: "fas fa-tachometer-alt", path: "/" },
    { name: "My Courses", icon: "fas fa-book", path: "/courses" },
    { name: "Assignments", icon: "fas fa-tasks", path: "/assignments" },
    { name: "Schedule", icon: "fas fa-calendar", path: "/schedule" },
    { name: "My Notes", icon: "fas fa-sticky-note", path: "/notes" },
    { name: "Progress", icon: "fas fa-chart-line", path: "/progress" },
    { name: "Settings", icon: "fas fa-cog", path: "/settings" }
  ];

  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    closed: { 
      x: "-100%",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    }
  };

  return (
    <motion.aside
      initial="closed"
      animate={open ? "open" : "closed"}
      variants={sidebarVariants}
      className="w-64 bg-white shadow-lg fixed md:static h-full z-30 md:transform-none transition-transform duration-300"
    >
      <div className="flex flex-col h-full">
        {/* Logo and close button */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-white bg-opacity-20 flex items-center justify-center backdrop-blur-sm">
              <i className="fas fa-graduation-cap text-white"></i>
            </div>
            <h1 className="text-xl font-semibold text-white">LearnTrack</h1>
          </div>
          <button 
            className="md:hidden text-white hover:text-neutral-200"
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-grow py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.name} onClick={onClose}>
              <Link href={item.path}>
                <div className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 cursor-pointer ${
                  location === item.path
                    ? "bg-primary bg-opacity-10 text-primary font-medium shadow-sm"
                    : "text-neutral-700 hover:bg-neutral-100 hover:translate-x-1"
                }`}>
                  <i className={`${item.icon} w-5`}></i>
                  <span>{item.name}</span>
                </div>
              </Link>
            </div>
          ))}
        </nav>
        
        {/* User profile */}
        <div className="border-t p-4 bg-neutral-50">
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <motion.img 
                  src={user.avatarUrl || "https://via.placeholder.com/40"} 
                  alt="User avatar" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary shadow-md"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{user.fullName}</p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-neutral-200"></div>
                <div>
                  <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                  <div className="h-3 w-32 bg-neutral-200 rounded mt-2"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
