import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/ui/sidebar";
import LearningProgress from "@/components/dashboard/LearningProgress";
import StudyTracker from "@/components/dashboard/StudyTracker";
import RecommendedMaterials from "@/components/dashboard/RecommendedMaterials";
import NoteTaking from "@/components/dashboard/NoteTaking";
import CoursesOverview from "@/components/dashboard/CoursesOverview";
import NotificationPopup from "@/components/NotificationPopup";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { toast } = useToast();

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  // Fetch notification count
  const { data: notificationData } = useQuery({
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
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                className="md:hidden text-neutral-500 mr-4"
                onClick={() => setSidebarOpen(true)}
              >
                <i className="fas fa-bars"></i>
              </button>
              <h2 className="text-xl font-semibold text-neutral-900">My Learning Dashboard</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search materials..." 
                  className="py-2 pl-10 pr-4 w-60 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <i className="fas fa-search absolute left-3 top-3 text-neutral-400"></i>
              </div>
              <button 
                className="relative text-neutral-500 hover:text-neutral-700"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <i className="fas fa-bell text-xl"></i>
                {notificationData?.count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                    {notificationData.count}
                  </span>
                )}
              </button>
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
        <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8 bg-neutral-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <LearningProgress />
            <StudyTracker />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <RecommendedMaterials />
            <NoteTaking />
          </div>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <CoursesOverview />
          </div>
        </main>
      </div>
    </div>
  );
}
