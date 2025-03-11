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
      <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm p-6">
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
    <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Learning Progress</h3>
          <p className="text-sm text-neutral-500">Overall completion across all subjects</p>
        </div>
        <div className="flex space-x-2">
          <select 
            className="text-sm border border-neutral-300 rounded-md px-2 py-1"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option>Last 30 days</option>
            <option>Last 60 days</option>
            <option>All time</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div 
          custom={0}
          initial="hidden"
          animate="visible"
          variants={variants}
          className="bg-neutral-50 p-4 rounded-lg"
        >
          <div className="text-3xl font-bold text-primary mb-1">{Math.round(overallProgress)}%</div>
          <div className="text-sm text-neutral-600">Overall Progress</div>
        </motion.div>
        
        <motion.div 
          custom={1}
          initial="hidden"
          animate="visible"
          variants={variants}
          className="bg-neutral-50 p-4 rounded-lg"
        >
          <div className="text-3xl font-bold text-success mb-1">{completedTopics}</div>
          <div className="text-sm text-neutral-600">Completed Topics</div>
        </motion.div>
        
        <motion.div 
          custom={2}
          initial="hidden"
          animate="visible"
          variants={variants}
          className="bg-neutral-50 p-4 rounded-lg"
        >
          <div className="text-3xl font-bold text-warning mb-1">{focusAreas}</div>
          <div className="text-sm text-neutral-600">Current Focus Areas</div>
        </motion.div>
      </div>
      
      <div className="h-60">
        <div className="flex justify-between text-sm text-neutral-600 mb-2">
          <span>Progress by Subject</span>
        </div>
        <div className="flex items-end h-40 space-x-6 px-4">
          {subjectProgress?.map((subject: any, index: number) => (
            <div key={subject.subject.id} className="flex flex-col items-center flex-1">
              <div className="w-full bg-neutral-100 rounded-t-md overflow-hidden">
                <motion.div 
                  custom={subject.progress}
                  initial="hidden"
                  animate="visible"
                  variants={chartVariants}
                  className={`${getColorClass(index)} rounded-t-md`}
                ></motion.div>
              </div>
              <div className="text-xs font-medium text-neutral-600 mt-2 text-center">{subject.subject.name}</div>
              <div className="text-xs text-neutral-500">{subject.progress}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getColorClass(index: number): string {
  const colors = [
    "bg-primary",
    "bg-secondary",
    "bg-success",
    "bg-warning",
    "bg-primary bg-opacity-70"
  ];
  
  return colors[index % colors.length];
}
