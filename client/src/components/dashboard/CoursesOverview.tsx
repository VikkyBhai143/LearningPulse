import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function CoursesOverview() {
  // Fetch user courses
  const { data: userCourses, isLoading } = useQuery({
    queryKey: ['/api/user/courses'],
  });

  const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    })
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
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-neutral-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-neutral-200 rounded mb-6"></div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left">
                    <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-md bg-neutral-200 mr-3"></div>
                        <div>
                          <div className="h-5 w-32 bg-neutral-200 rounded"></div>
                          <div className="h-4 w-20 bg-neutral-200 rounded mt-1"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 w-32 bg-neutral-200 rounded"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-32 h-2 bg-neutral-200 rounded-full"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 w-12 bg-neutral-200 rounded"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-5 w-16 bg-neutral-200 rounded"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Current Courses</h3>
          <p className="text-sm text-neutral-500">Track your enrolled courses</p>
        </div>
        <a href="#" className="text-sm font-medium text-primary hover:text-primary-dark">
          View All
        </a>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Course</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Instructor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Grade</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {userCourses?.map((course: any, index: number) => (
              <motion.tr 
                key={course.id}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={tableRowVariants}
                className="hover:bg-neutral-50"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-md bg-${course.course.iconColor} bg-opacity-10 flex items-center justify-center text-${course.course.iconColor} mr-3`}>
                      <i className={`fas fa-${course.course.iconName}`}></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-900">{course.course.name}</div>
                      <div className="text-xs text-neutral-500">{course.course.code}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-neutral-900">{course.course.instructor}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-neutral-100 rounded-full mr-2 overflow-hidden">
                      <motion.div 
                        className={`h-full bg-${course.course.iconColor} rounded-full`}
                        custom={course.progress}
                        variants={progressVariants}
                        initial="hidden"
                        animate="visible"
                      ></motion.div>
                    </div>
                    <span className="text-xs text-neutral-500">{course.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full bg-${getGradeColor(course.grade)} bg-opacity-10 text-${getGradeColor(course.grade)}`}>
                    {course.grade || 'N/A'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <a href="#" className="text-primary hover:text-primary-dark">Resume</a>
                </td>
              </motion.tr>
            ))}

            {userCourses?.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-neutral-500">
                  No courses enrolled
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getGradeColor(grade: string): string {
  if (!grade) return 'neutral';
  if (grade.startsWith('A')) return 'success';
  if (grade.startsWith('B')) return 'primary';
  if (grade.startsWith('C')) return 'warning';
  return 'danger';
}
