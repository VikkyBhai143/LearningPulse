import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CreateNoteModal from "@/components/CreateNoteModal";
import { motion, AnimatePresence } from "framer-motion";

export default function NoteTaking() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [note, setNote] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch user courses for dropdown
  const { data: userCourses } = useQuery({
    queryKey: ['/api/user/courses'],
  });

  // Fetch recent notes
  const { data: recentNotes, isLoading: isLoadingNotes } = useQuery({
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
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Quick Notes</h3>
            <p className="text-sm text-neutral-500">Capture your thoughts</p>
          </div>
          <div className="flex space-x-2">
            <button 
              className="text-primary hover:text-primary-dark"
              onClick={() => setIsModalOpen(true)}
            >
              <i className="fas fa-plus"></i>
            </button>
            <button className="text-primary hover:text-primary-dark">
              <i className="fas fa-expand-alt"></i>
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <textarea 
            className="w-full border border-neutral-200 rounded-md p-3 h-32 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Start typing your notes here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>
        </div>
        
        <div className="flex space-x-2 mb-6">
          <select 
            className="text-sm border border-neutral-300 rounded-md px-2 py-1 flex-grow"
            value={selectedCourse || ""}
            onChange={(e) => setSelectedCourse(Number(e.target.value) || null)}
          >
            <option value="">Select a subject</option>
            {userCourses?.map((course: any) => (
              <option key={course.courseId} value={course.courseId}>
                {course.course.name}
              </option>
            ))}
          </select>
          <button 
            className="px-4 py-1 bg-primary text-white text-sm rounded-md hover:bg-primary-dark transition"
            onClick={handleSaveNote}
            disabled={createNoteMutation.isPending}
          >
            {createNoteMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-neutral-700 mb-3">Recent Notes</h4>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {isLoadingNotes ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse p-2">
                  <div className="flex justify-between items-start">
                    <div className="h-5 w-40 bg-neutral-200 rounded"></div>
                    <div className="h-4 w-12 bg-neutral-200 rounded"></div>
                  </div>
                  <div className="h-4 w-full bg-neutral-200 rounded mt-2"></div>
                </div>
              ))
            ) : (
              <AnimatePresence>
                {recentNotes?.map((note: any, index: number) => (
                  <motion.div 
                    key={note.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                      opacity: 1, 
                      height: 'auto',
                      transition: { delay: index * 0.1 }
                    }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2 hover:bg-neutral-50 rounded cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="font-medium text-neutral-900 text-sm">{note.title}</h5>
                      <span className="text-xs text-neutral-500">{note.date}</span>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-2 mt-1">
                      {note.preview}
                    </p>
                  </motion.div>
                ))}

                {recentNotes?.length === 0 && (
                  <p className="text-neutral-500 text-sm text-center py-2">No notes yet</p>
                )}
              </AnimatePresence>
            )}
          </div>
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
