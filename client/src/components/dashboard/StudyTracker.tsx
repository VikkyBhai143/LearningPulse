import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function StudyTracker() {
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [topic, setTopic] = useState("");
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Fetch user courses for dropdown
  const { data: userCourses } = useQuery({
    queryKey: ['/api/user/courses'],
  });

  // Fetch recent study sessions
  const { data: recentSessions, isLoading: isLoadingSessions } = useQuery({
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
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Study Tracker</h3>
          <p className="text-sm text-neutral-500">Track your study time</p>
        </div>
        <button className="text-primary hover:text-primary-dark">
          <i className="fas fa-expand-alt"></i>
        </button>
      </div>
      
      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Subject</label>
          <select 
            className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={selectedCourse || ""}
            onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}
            disabled={timerRunning}
          >
            <option value="">Select a subject</option>
            {userCourses?.map((course: any) => (
              <option key={course.courseId} value={course.courseId}>
                {course.course.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Topic (optional)</label>
          <input 
            type="text" 
            className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="What are you studying?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={timerRunning}
          />
        </div>
        
        <motion.div 
          className="text-5xl font-bold text-neutral-900 tracking-wider my-6 text-center"
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
        
        <div className="flex justify-center space-x-4">
          <AnimatePresence mode="wait">
            {!timerRunning ? (
              <motion.button 
                key="start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="px-6 py-2 bg-success text-white rounded-md hover:bg-opacity-90 transition flex items-center"
                onClick={handleStart}
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
                  className="px-6 py-2 bg-warning text-white rounded-md hover:bg-opacity-90 transition flex items-center"
                  onClick={handlePause}
                >
                  <i className="fas fa-pause mr-2"></i> Pause
                </motion.button>
                <motion.button 
                  key="stop"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="px-6 py-2 bg-danger text-white rounded-md hover:bg-opacity-90 transition flex items-center"
                  onClick={handleStop}
                >
                  <i className="fas fa-stop mr-2"></i> Stop
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold text-neutral-700 mb-3">Recent Sessions</h4>
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
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {recentSessions?.map((session: any, index: number) => (
              <motion.div 
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
                className="flex justify-between items-center text-sm p-2 hover:bg-neutral-50 rounded"
              >
                <div>
                  <span className="font-medium text-neutral-900">{session.subject}</span>
                  {session.topic && (
                    <span className="text-neutral-500 text-xs"> • {session.topic}</span>
                  )}
                </div>
                <div className="text-neutral-600">{session.duration}</div>
              </motion.div>
            ))}

            {recentSessions?.length === 0 && (
              <p className="text-neutral-500 text-sm text-center py-2">No recent study sessions</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
