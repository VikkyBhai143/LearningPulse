import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function RecommendedMaterials() {
  const { toast } = useToast();

  // Fetch recommended materials
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['/api/user/materials/recommended'],
  });

  // Update material progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ materialId, progress }: { materialId: number, progress: number }) => {
      return apiRequest('PATCH', `/api/user/materials/${materialId}/progress`, { progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/materials/recommended'] });
      toast({
        title: "Progress updated",
        description: "Your learning progress has been updated.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update progress.",
      });
    }
  });

  const handleContinue = (materialId: number, currentProgress: number) => {
    // Simulate progress update (10% increment)
    const newProgress = Math.min(100, currentProgress + 10);
    updateProgressMutation.mutate({ materialId, progress: newProgress });
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: (progress: number) => ({
      width: `${progress}%`,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.3
      }
    })
  };

  if (isLoading) {
    return (
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-neutral-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-neutral-200 rounded mb-6"></div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-neutral-200 mr-4"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="h-5 w-32 bg-neutral-200 rounded"></div>
                      <div className="h-5 w-20 bg-neutral-200 rounded"></div>
                    </div>
                    <div className="h-4 w-full bg-neutral-200 rounded mt-2"></div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="w-48 h-2 bg-neutral-200 rounded-full"></div>
                      <div className="h-4 w-16 bg-neutral-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 glass-effect card-hover">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
            <span className="inline-block mr-2 text-blue-500">
              <i className="fas fa-book-reader"></i>
            </span>
            Recommended Next Steps
          </h3>
          <p className="text-sm text-neutral-500">Based on your learning patterns</p>
        </div>
        <motion.button 
          className="text-blue-500 hover:text-blue-700 transition-colors rounded-full w-8 h-8 flex items-center justify-center"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/user/materials/recommended'] })}
          whileHover={{ rotate: 180, scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <i className="fas fa-sync-alt"></i>
        </motion.button>
      </div>
      
      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {recommendations && recommendations.length > 0 ? (
          recommendations.map((rec: any) => (
            <motion.div 
              key={rec.id}
              variants={itemVariants}
              className="p-4 border border-neutral-100 rounded-lg shadow-sm hover:shadow transition-all duration-300 cursor-pointer flex items-start"
              whileHover={{ 
                y: -5, 
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                borderColor: `var(--${getPriorityColor(rec.priority)})` 
              }}
            >
              <div className={`w-12 h-12 rounded-full bg-${getPriorityColor(rec.priority)} bg-opacity-10 flex items-center justify-center text-${getPriorityColor(rec.priority)} flex-shrink-0 mr-4 shadow-sm`}>
                <i className={`fas fa-${rec.iconName || 'book'} text-lg`}></i>
              </div>
              <div className="flex-1">
                <div className="flex justify-between flex-wrap sm:flex-nowrap">
                  <h4 className="font-medium text-neutral-900">{rec.title}</h4>
                  <span className={`text-xs bg-${getPriorityColor(rec.priority)} bg-opacity-10 text-${getPriorityColor(rec.priority)} px-2 py-1 rounded-full font-medium`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mt-1">{rec.description}</p>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex-1 mr-4">
                    <div className="flex justify-between mb-1 text-xs">
                      <span className="text-neutral-600">Progress</span>
                      <span className="font-medium">{rec.progress}%</span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full bg-gradient-to-r from-${getPriorityColor(rec.priority)} to-${getPriorityColor(rec.priority)}/70 rounded-full`}
                        custom={rec.progress}
                        variants={progressVariants}
                        initial="hidden"
                        animate="visible"
                      ></motion.div>
                    </div>
                  </div>
                  <motion.button 
                    className={`text-xs bg-${getPriorityColor(rec.priority)} text-white py-2 px-3 rounded-md shadow-sm font-medium`}
                    onClick={() => handleContinue(rec.id, rec.progress)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={rec.progress >= 100}
                  >
                    {getActionText(rec.progress)}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="text-center py-10 border border-dashed border-blue-200 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-blue-400 mb-3">
              <i className="fas fa-check-circle text-4xl"></i>
            </div>
            <h4 className="text-neutral-700 font-medium text-lg">All caught up!</h4>
            <p className="text-neutral-500 text-sm mt-1 max-w-xs mx-auto">
              You have no pending recommendations. Check back later for new materials.
            </p>
            <motion.button
              className="mt-4 text-xs text-blue-600 hover:text-blue-800 py-2 px-4 border border-blue-200 rounded-md"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              Browse all materials <i className="fas fa-arrow-right ml-1"></i>
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function getPriorityColor(priority: string): string {
  if (priority.includes('High')) return 'secondary';
  if (priority.includes('Due')) return 'warning';
  if (priority.includes('New')) return 'success';
  return 'primary';
}

function getActionText(progress: number): string {
  if (progress === 0) return 'Start Now';
  if (progress >= 100) return 'Completed';
  return 'Continue';
}
