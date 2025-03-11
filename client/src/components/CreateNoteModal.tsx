import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCourses: any[];
}

export default function CreateNoteModal({ isOpen, onClose, userCourses }: CreateNoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [courseId, setCourseId] = useState<number | null>(null);
  const { toast } = useToast();

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/user/notes', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/notes/recent'] });
      toast({
        title: "Note created",
        description: "Your note has been created successfully.",
      });
      resetForm();
      onClose();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create note.",
      });
    }
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCourseId(null);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleCreateNote = () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Note title cannot be empty.",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Note content cannot be empty.",
      });
      return;
    }

    if (!courseId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a subject.",
      });
      return;
    }

    createNoteMutation.mutate({
      userId: 1, // Assuming user ID 1
      courseId,
      title,
      content,
      createdAt: new Date()
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <motion.div 
            className="absolute inset-0 bg-neutral-900 bg-opacity-50 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          ></motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 md:mx-auto z-10"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">Create New Note</h3>
                <button 
                  className="text-neutral-500 hover:text-neutral-700"
                  onClick={onClose}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Note Title</label>
                <input 
                  type="text" 
                  className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter a title for your note"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Content</label>
                <textarea 
                  className="w-full border border-neutral-300 rounded-md p-2 h-40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Write your note here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Subject</label>
                <select 
                  className="w-full border border-neutral-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={courseId || ""}
                  onChange={(e) => setCourseId(Number(e.target.value) || null)}
                >
                  <option value="">Select a subject</option>
                  {userCourses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.course.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                  onClick={handleCreateNote}
                  disabled={createNoteMutation.isPending}
                >
                  {createNoteMutation.isPending ? 'Creating...' : 'Create Note'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
