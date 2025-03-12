import { useEffect, useState } from "react";
import { useQuery, QueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/ui/sidebar";
import LearningProgress from "@/components/dashboard/LearningProgress";
import StudyTracker from "@/components/dashboard/StudyTracker";
import RecommendedMaterials from "@/components/dashboard/RecommendedMaterials";
import NoteTaking from "@/components/dashboard/NoteTaking";
import CoursesOverview from "@/components/dashboard/CoursesOverview";
import NotificationPopup from "@/components/NotificationPopup";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// Import queryClient
import { queryClient } from "@/lib/queryClient";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { toast } = useToast();

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  // Fetch notification count
  const { data: notificationData } = useQuery<{ count: number }>({
    queryKey: ['/api/user/notifications/unread/count'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const notifications = await apiRequest('GET', '/api/user/notifications');
      const notificationsJson = await notifications.json();
      
      for (const notification of notificationsJson) {
        if (!notification.read) {
          await apiRequest('PATCH', `/api/user/notifications/${notification.id}/read`);
        }
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/user/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/notifications/unread/count'] });
      
      toast({
        title: "Notifications",
        description: "All notifications marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-neutral-900 bg-opacity-50 backdrop-blur-md z-20 ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user}
      />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 animate-gradient"></div>
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between relative">
            <div className="flex items-center">
              <button 
                className="md:hidden text-neutral-500 mr-4 hover:text-primary transition-colors duration-200"
                onClick={() => setSidebarOpen(true)}
              >
                <i className="fas fa-bars"></i>
              </button>
              <h2 className="text-xl font-semibold text-neutral-900">
                <span className="text-primary">My</span> Learning Dashboard
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search materials..." 
                  className="py-2 pl-10 pr-4 w-60 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
                />
                <i className="fas fa-search absolute left-3 top-3 text-neutral-400"></i>
              </div>
              <motion.button 
                className="relative text-neutral-500 hover:text-primary transition-colors duration-200"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fas fa-bell text-xl"></i>
                {notificationData && notificationData.count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center animate-pulse">
                    {notificationData.count}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </header>
        
        {/* Notification popup */}
        <NotificationPopup 
          open={notificationsOpen} 
          onClose={() => setNotificationsOpen(false)} 
          onMarkAllAsRead={markAllNotificationsAsRead}
        />
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              variants={itemVariants} 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
            >
              <LearningProgress />
              <StudyTracker />
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
            >
              <RecommendedMaterials />
              <NoteTaking />
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 gap-6 mb-6"
            >
              <CoursesOverview />
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
