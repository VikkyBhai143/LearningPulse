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
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Recommended Next Steps</h3>
          <p className="text-sm text-neutral-500">Based on your learning patterns</p>
        </div>
        <button 
          className="text-neutral-500 hover:text-neutral-700"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/user/materials/recommended'] })}
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>
      
      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {recommendations?.map((rec: any) => (
          <motion.div 
            key={rec.id}
            variants={itemVariants}
            className="p-4 border border-neutral-200 rounded-lg hover:border-primary transition cursor-pointer flex items-start"
          >
            <div className={`w-10 h-10 rounded-full bg-${rec.iconColor || 'primary'} bg-opacity-10 flex items-center justify-center text-${rec.iconColor || 'primary'} flex-shrink-0 mr-4`}>
              <i className={`fas fa-${rec.iconName}`}></i>
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-medium text-neutral-900">{rec.title}</h4>
                <span className={`text-xs bg-${getPriorityColor(rec.priority)} bg-opacity-10 text-${getPriorityColor(rec.priority)} px-2 py-1 rounded-full`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-sm text-neutral-600 mt-1">{rec.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <div className="w-48 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full bg-${getPriorityColor(rec.priority)} rounded-full`}
                    custom={rec.progress}
                    variants={progressVariants}
                    initial="hidden"
                    animate="visible"
                  ></motion.div>
                </div>
                <button 
                  className="text-xs text-primary font-medium hover:text-primary-dark"
                  onClick={() => handleContinue(rec.id, rec.progress)}
                >
                  {getActionText(rec.progress)}
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {recommendations?.length === 0 && (
          <div className="text-center py-8">
            <div className="text-neutral-400 text-lg mb-2">
              <i className="fas fa-check-circle text-3xl"></i>
            </div>
            <h4 className="text-neutral-600 font-medium">All caught up!</h4>
            <p className="text-neutral-500 text-sm mt-1">You have no pending recommendations.</p>
          </div>
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
