import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistance } from "date-fns";

interface NotificationPopupProps {
  open: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationPopup({ open, onClose, onMarkAllAsRead }: NotificationPopupProps) {
  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/user/notifications'],
    enabled: open,
  });

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PATCH', `/api/user/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/notifications/unread/count'] });
    }
  });

  const handleNotificationClick = (id: number, read: boolean) => {
    if (!read) {
      markAsReadMutation.mutate(id);
    }
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'warning':
        return 'fas fa-exclamation-circle';
      case 'info':
      default:
        return 'fas fa-book';
    }
  };

  const getColorByType = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'primary';
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          className="fixed right-4 top-16 w-80 bg-white shadow-lg rounded-lg z-40 overflow-hidden"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-4 bg-primary text-white font-medium flex justify-between items-center">
            <span>Notifications</span>
            <button 
              className="text-white hover:text-neutral-200"
              onClick={onClose}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-3 animate-pulse">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className="w-8 h-8 rounded-full bg-neutral-200"></div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="h-5 w-32 bg-neutral-200 rounded"></div>
                      <div className="h-4 w-48 bg-neutral-200 rounded mt-1"></div>
                      <div className="h-3 w-24 bg-neutral-200 rounded mt-2"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : notifications?.length > 0 ? (
              notifications.map((notification: any) => (
                <motion.div 
                  key={notification.id}
                  className={`p-3 hover:bg-neutral-50 cursor-pointer ${notification.read ? 'opacity-60' : ''}`}
                  onClick={() => handleNotificationClick(notification.id, notification.read)}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <div className={`w-8 h-8 rounded-full bg-${getColorByType(notification.type)} bg-opacity-20 flex items-center justify-center text-${getColorByType(notification.type)}`}>
                        <i className={getIconByType(notification.type)}></i>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-neutral-900">{notification.title}</p>
                      <p className="text-xs text-neutral-500">{notification.message}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {formatDistance(new Date(notification.createdAt), new Date(), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-neutral-500">No notifications</p>
              </div>
            )}
          </div>
          {notifications?.length > 0 && (
            <div className="p-3 text-center border-t">
              <button 
                className="text-sm text-primary hover:text-primary-dark"
                onClick={onMarkAllAsRead}
              >
                Mark all as read
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
