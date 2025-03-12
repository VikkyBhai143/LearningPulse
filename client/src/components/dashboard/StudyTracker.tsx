import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface StudySession {
  id: number;
  subject: string;
  topic?: string;
  duration: string;
}

interface UserCourse {
  courseId: number;
  course: {
    name: string;
  };
}

export default function StudyTracker() {
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [topic, setTopic] = useState("");
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Fetch user courses for dropdown
  const { data: userCourses } = useQuery<UserCourse[]>({
    queryKey: ['/api/user/courses'],
  });

  // Fetch recent study sessions
  const { data: recentSessions, isLoading: isLoadingSessions } = useQuery<StudySession[]>({
    queryKey: ['/api/user/study-sessions/recent'],
    queryFn: async () => {
      const res = await fetch('/api/user/study-sessions/recent?limit=3');
      return res.json();
    }
  });

  // Create study session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/user/study-sessions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/study-sessions/recent'] });
      toast({
        title: "Study session saved",
        description: "Your study session has been recorded successfully.",
      });
      setSeconds(0);
      setTopic("");
      setSelectedCourse(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save study session.",
      });
    }
  });

  // Update timer display
  const formatTime = () => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = window.setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning]);

  // Handle timer controls
  const handleStart = () => {
    if (!selectedCourse) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a course before starting the timer.",
      });
      return;
    }
    setTimerRunning(true);
  };

  const handlePause = () => {
    setTimerRunning(false);
  };

  const handleStop = () => {
    if (seconds < 10) {
      toast({
        variant: "destructive",
        title: "Session too short",
        description: "Study session must be at least 10 seconds to be recorded.",
      });
      setTimerRunning(false);
      setSeconds(0);
      return;
    }
    
    if (!selectedCourse) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a course before saving the session.",
      });
      return;
    }
    
    setTimerRunning(false);
    
    createSessionMutation.mutate({
      userId: 1, // Assuming user ID 1
      courseId: selectedCourse,
      topic: topic || "General study",
      duration: seconds,
      startTime: new Date()
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 glass-effect card-hover">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
            <span className="inline-block mr-2 text-purple-500">
              <i className="fas fa-stopwatch"></i>
            </span>
            Study Tracker
          </h3>
          <p className="text-sm text-neutral-500">Track your study time</p>
        </div>
        <motion.button 
          className="text-purple-500 hover:text-purple-700 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <i className="fas fa-expand-alt"></i>
        </motion.button>
      </div>
      
      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1 flex items-center">
            <i className="fas fa-book mr-2 text-purple-500/70"></i>
            Subject
          </label>
          <select 
            className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition"
            value={selectedCourse || ""}
            onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}
            disabled={timerRunning}
          >
            <option value="">Select a subject</option>
            {userCourses?.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.course.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1 flex items-center">
            <i className="fas fa-tags mr-2 text-purple-500/70"></i>
            Topic (optional)
          </label>
          <input 
            type="text" 
            className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm transition"
            placeholder="What are you studying?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={timerRunning}
          />
        </div>
        
        <motion.div 
          className="flex flex-col items-center my-8"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full"
              animate={{ 
                opacity: timerRunning ? [0.5, 0.8, 0.5] : 0.3,
                scale: timerRunning ? [1, 1.15, 1] : 1,
                transition: { 
                  repeat: timerRunning ? Infinity : 0, 
                  duration: 2
                }
              }}
            />
            <motion.div 
              className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 tracking-wider relative p-6"
              animate={{ 
                scale: timerRunning ? [1, 1.02, 1] : 1,
                transition: { 
                  repeat: timerRunning ? Infinity : 0, 
                  duration: 2 
                }
              }}
            >
              {formatTime()}
            </motion.div>
          </div>
          <p className="text-sm text-neutral-600 mt-2">
            {timerRunning ? 'Timer running...' : 'Timer paused'}
          </p>
        </motion.div>
        
        <div className="flex justify-center space-x-4">
          <AnimatePresence mode="wait">
            {!timerRunning ? (
              <motion.button 
                key="start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md hover:shadow-md transition-all duration-300 flex items-center shadow"
                onClick={handleStart}
                whileHover={{ y: -2, boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)' }}
                whileTap={{ y: 0 }}
              >
                <i className="fas fa-play mr-2"></i> Start
              </motion.button>
            ) : (
              <>
                <motion.button 
                  key="pause"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-md hover:shadow-md transition-all duration-300 flex items-center shadow"
                  onClick={handlePause}
                  whileHover={{ y: -2, boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ y: 0 }}
                >
                  <i className="fas fa-pause mr-2"></i> Pause
                </motion.button>
                <motion.button 
                  key="stop"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:shadow-md transition-all duration-300 flex items-center shadow"
                  onClick={handleStop}
                  whileHover={{ y: -2, boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ y: 0 }}
                >
                  <i className="fas fa-stop mr-2"></i> Stop
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center">
          <i className="fas fa-history mr-2 text-purple-500/70"></i>
          Recent Sessions
        </h4>
        {isLoadingSessions ? (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex justify-between items-center p-2">
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                  <div className="h-3 w-16 bg-neutral-200 rounded"></div>
                </div>
                <div className="h-4 w-12 bg-neutral-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {recentSessions?.map((session, index) => (
              <motion.div 
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
                whileHover={{ x: 5, backgroundColor: 'rgba(147, 51, 234, 0.05)' }}
                className="flex justify-between items-center text-sm p-3 rounded-lg border border-neutral-100 shadow-sm transition-all duration-200"
              >
                <div>
                  <span className="font-medium text-neutral-900">{session.subject}</span>
                  {session.topic && (
                    <span className="text-neutral-500 text-xs"> • {session.topic}</span>
                  )}
                </div>
                <div className="text-neutral-600 bg-purple-50 px-2 py-1 rounded-full text-xs font-medium">
                  {session.duration}
                </div>
              </motion.div>
            ))}

            {!recentSessions || recentSessions.length === 0 && (
              <p className="text-neutral-500 text-sm text-center py-4">No recent study sessions</p>
            )}
          </div>
        )}
        
        <motion.button 
          className="w-full mt-3 text-center text-xs text-purple-600 hover:text-purple-800 py-2 transition-colors"
          whileHover={{ y: -1 }}
          whileTap={{ y: 0 }}
        >
          View all sessions <i className="fas fa-chevron-right ml-1"></i>
        </motion.button>
      </div>
    </div>
  );
}
