import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function LearningProgress() {
  const [timeRange, setTimeRange] = useState("Last 30 days");
  
  // Fetch subject progress data
  const { data: subjectProgress, isLoading } = useQuery({
    queryKey: ['/api/user/subjects/progress'],
  });

  // Calculate overall progress
  const overallProgress = subjectProgress?.reduce((acc: number, curr: any) => acc + curr.progress, 0) / (subjectProgress?.length || 1);
  
  // Count completed topics (progress > 90%)
  const completedTopics = subjectProgress?.filter((subject: any) => subject.progress > 90).length || 0;
  
  // Count focus areas (progress < 70%)
  const focusAreas = subjectProgress?.filter((subject: any) => subject.progress < 70).length || 0;

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const chartVariants = {
    hidden: { height: 0 },
    visible: (height: number) => ({
      height: `${height}%`,
      transition: {
        duration: 1,
        ease: "easeOut"
      }
    })
  };

  if (isLoading) {
    return (
      <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm p-6 glass-effect">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-neutral-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-neutral-200 rounded mb-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-neutral-50 p-4 rounded-lg">
                <div className="h-8 w-24 bg-neutral-200 rounded mb-1"></div>
                <div className="h-4 w-32 bg-neutral-200 rounded"></div>
              </div>
            ))}
          </div>
          
          <div className="h-60">
            <div className="h-4 w-40 bg-neutral-200 rounded mb-2"></div>
            <div className="flex items-end h-40 space-x-6 px-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="w-full bg-neutral-200 rounded-t-md h-32"></div>
                  <div className="h-4 w-12 bg-neutral-200 rounded mt-2"></div>
                  <div className="h-3 w-8 bg-neutral-200 rounded mt-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 glass-effect card-hover">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
            <span className="inline-block mr-2 text-primary">
              <i className="fas fa-chart-line"></i>
            </span>
            Learning Progress
          </h3>
          <p className="text-sm text-neutral-500">Overall completion across all subjects</p>
        </div>
        <motion.div 
          className="flex space-x-2"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <select 
            className="text-sm border border-neutral-300 rounded-md px-3 py-1 shadow-sm focus:ring-2 focus:ring-primary/40 focus:outline-none transition-shadow duration-200"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option>Last 30 days</option>
            <option>Last 60 days</option>
            <option>All time</option>
          </select>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div 
          custom={0}
          initial="hidden"
          animate="visible"
          variants={variants}
          className="bg-gradient-to-br from-primary/10 to-primary/5 p-5 rounded-lg shadow-sm border border-primary/10"
          whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
        >
          <div className="text-3xl font-bold text-primary mb-1">{Math.round(overallProgress)}%</div>
          <div className="text-sm text-neutral-600 flex items-center">
            <i className="fas fa-arrow-trend-up mr-1 text-primary/70"></i>
            Overall Progress
          </div>
        </motion.div>
        
        <motion.div 
          custom={1}
          initial="hidden"
          animate="visible"
          variants={variants}
          className="bg-gradient-to-br from-green-50 to-green-100/30 p-5 rounded-lg shadow-sm border border-green-100"
          whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
        >
          <div className="text-3xl font-bold text-success mb-1">{completedTopics}</div>
          <div className="text-sm text-neutral-600 flex items-center">
            <i className="fas fa-check-circle mr-1 text-success/70"></i>
            Completed Topics
          </div>
        </motion.div>
        
        <motion.div 
          custom={2}
          initial="hidden"
          animate="visible"
          variants={variants}
          className="bg-gradient-to-br from-amber-50 to-amber-100/30 p-5 rounded-lg shadow-sm border border-amber-100"
          whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
        >
          <div className="text-3xl font-bold text-warning mb-1">{focusAreas}</div>
          <div className="text-sm text-neutral-600 flex items-center">
            <i className="fas fa-bullseye mr-1 text-warning/70"></i>
            Current Focus Areas
          </div>
        </motion.div>
      </div>
      
      <div className="h-60">
        <div className="flex justify-between text-sm text-neutral-600 mb-4">
          <span className="font-medium flex items-center">
            <i className="fas fa-book-open mr-2 text-primary/70"></i>
            Progress by Subject
          </span>
          <motion.button 
            className="text-xs text-primary hover:underline flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Details <i className="fas fa-chevron-right ml-1 text-xs"></i>
          </motion.button>
        </div>
        <div className="flex items-end h-40 space-x-6 px-4">
          {subjectProgress?.map((subject: any, index: number) => (
            <motion.div 
              key={subject.subject.id} 
              className="flex flex-col items-center flex-1"
              whileHover={{ y: -3 }}
            >
              <div className="w-full bg-neutral-100 rounded-lg overflow-hidden shadow-inner h-40 relative">
                <motion.div 
                  custom={subject.progress}
                  initial="hidden"
                  animate="visible"
                  variants={chartVariants}
                  className={`${getColorClass(index)} rounded-t-md absolute bottom-0 w-full`}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white font-bold text-xs py-1 px-2 rounded-full bg-black/30 backdrop-blur-sm">
                    {subject.progress}%
                  </div>
                </motion.div>
              </div>
              <div className="text-xs font-medium text-neutral-700 mt-3 text-center">{subject.subject.name}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getColorClass(index: number): string {
  const colors = [
    "bg-gradient-to-t from-primary to-primary/80",
    "bg-gradient-to-t from-purple-600 to-purple-500",
    "bg-gradient-to-t from-emerald-600 to-emerald-500",
    "bg-gradient-to-t from-amber-600 to-amber-500",
    "bg-gradient-to-t from-blue-600 to-blue-500"
  ];
  
  return colors[index % colors.length];
}
