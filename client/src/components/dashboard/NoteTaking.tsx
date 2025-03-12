import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CreateNoteModal from "@/components/CreateNoteModal";
import { motion, AnimatePresence } from "framer-motion";

interface Note {
  id: number;
  title: string;
  date: string;
  preview: string;
}

interface UserCourse {
  courseId: number;
  course: {
    name: string;
  };
}

export default function NoteTaking() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [note, setNote] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch user courses for dropdown
  const { data: userCourses } = useQuery<UserCourse[]>({
    queryKey: ['/api/user/courses'],
  });

  // Fetch recent notes
  const { data: recentNotes, isLoading: isLoadingNotes } = useQuery<Note[]>({
    queryKey: ['/api/user/notes/recent'],
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/user/notes', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/notes/recent'] });
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully.",
      });
      setNote("");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save note.",
      });
    }
  });

  const handleSaveNote = () => {
    if (!note.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Note content cannot be empty.",
      });
      return;
    }

    if (!selectedCourse) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a subject.",
      });
      return;
    }

    createNoteMutation.mutate({
      userId: 1, // Assuming user ID 1
      courseId: selectedCourse,
      title: `Quick Note - ${new Date().toLocaleDateString()}`,
      content: note,
      createdAt: new Date()
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 glass-effect card-hover">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
              <span className="inline-block mr-2 text-amber-500">
                <i className="fas fa-sticky-note"></i>
              </span>
              Quick Notes
            </h3>
            <p className="text-sm text-neutral-500">Capture your thoughts</p>
          </div>
          <div className="flex space-x-2">
            <motion.button 
              className="text-amber-500 hover:text-amber-600 transition-colors"
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className="fas fa-plus"></i>
            </motion.button>
            <motion.button 
              className="text-amber-500 hover:text-amber-600 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className="fas fa-expand-alt"></i>
            </motion.button>
          </div>
        </div>
        
        <div className="mb-4">
          <motion.textarea 
            className="w-full border border-neutral-200 rounded-lg p-4 h-32 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-sm"
            placeholder="Start typing your notes here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            initial={{ height: "32px" }}
            animate={{ height: note.length > 0 ? "100px" : "32px" }}
            transition={{ type: "spring", stiffness: 100 }}
          ></motion.textarea>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-6">
          <select 
            className="text-sm border border-neutral-300 rounded-md px-3 py-2 flex-grow shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            value={selectedCourse || ""}
            onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}
          >
            <option value="">Select a subject</option>
            {userCourses && userCourses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.course.name}
              </option>
            ))}
          </select>
          <motion.button 
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm rounded-md flex items-center justify-center shadow"
            onClick={handleSaveNote}
            disabled={createNoteMutation.isPending}
            whileHover={{ y: -2, boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)' }}
            whileTap={{ y: 0 }}
          >
            {createNoteMutation.isPending ? (
              <>
                <span className="animate-spin mr-2">
                  <i className="fas fa-spinner"></i>
                </span>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i> Save Note
              </>
            )}
          </motion.button>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center">
            <i className="fas fa-history mr-2 text-amber-500/70"></i>
            Recent Notes
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {isLoadingNotes ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse p-3 border border-neutral-100 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="h-5 w-40 bg-neutral-200 rounded"></div>
                    <div className="h-4 w-12 bg-neutral-200 rounded"></div>
                  </div>
                  <div className="h-4 w-full bg-neutral-200 rounded mt-2"></div>
                </div>
              ))
            ) : (
              <AnimatePresence>
                {recentNotes && recentNotes.length > 0 ? (
                  recentNotes.map((note, index) => (
                    <motion.div 
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: index * 0.1 }
                      }}
                      exit={{ opacity: 0, height: 0 }}
                      whileHover={{ x: 5, backgroundColor: 'rgba(245, 158, 11, 0.05)' }}
                      className="p-3 rounded-lg cursor-pointer border border-neutral-100 shadow-sm transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium text-neutral-900 text-sm">{note.title}</h5>
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{note.date}</span>
                      </div>
                      <p className="text-xs text-neutral-600 line-clamp-2 mt-1">
                        {note.preview}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-500 text-sm text-center py-6 border border-dashed border-neutral-200 rounded-lg"
                  >
                    <i className="fas fa-file-alt text-amber-300 text-2xl mb-2 block"></i>
                    <p>No notes yet. Start taking notes!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
          
          <motion.button 
            className="w-full mt-3 text-center text-xs text-amber-600 hover:text-amber-800 py-2 transition-colors"
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
          >
            View all notes <i className="fas fa-chevron-right ml-1"></i>
          </motion.button>
        </div>
      </div>

      <CreateNoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userCourses={userCourses || []}
      />
    </>
  );
}
