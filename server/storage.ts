import {
  users, User, InsertUser,
  courses, Course, InsertCourse,
  userCourses, UserCourse, InsertUserCourse,
  studySessions, StudySession, InsertStudySession,
  notes, Note, InsertNote,
  studyMaterials, StudyMaterial, InsertStudyMaterial,
  userMaterialProgress, UserMaterialProgress, InsertUserMaterialProgress,
  subjects, Subject, InsertSubject,
  userSubjectProgress, UserSubjectProgress, InsertUserSubjectProgress,
  notifications, Notification, InsertNotification
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Course methods
  getCourse(id: number): Promise<Course | undefined>;
  getCourses(): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  
  // UserCourse methods
  getUserCourses(userId: number): Promise<(UserCourse & { course: Course })[]>;
  createUserCourse(userCourse: InsertUserCourse): Promise<UserCourse>;
  updateUserCourseProgress(id: number, progress: number): Promise<UserCourse>;
  updateUserCourseGrade(id: number, grade: string): Promise<UserCourse>;
  
  // StudySession methods
  getStudySessions(userId: number): Promise<(StudySession & { course: Course })[]>;
  getRecentStudySessions(userId: number, limit: number): Promise<(StudySession & { course: Course })[]>;
  createStudySession(session: InsertStudySession): Promise<StudySession>;
  
  // Note methods
  getNotes(userId: number): Promise<(Note & { course: Course })[]>;
  getRecentNotes(userId: number, limit: number): Promise<(Note & { course: Course })[]>;
  createNote(note: InsertNote): Promise<Note>;
  getNote(id: number): Promise<(Note & { course: Course }) | undefined>;
  
  // StudyMaterial methods
  getStudyMaterials(courseId: number): Promise<StudyMaterial[]>;
  getRecommendedMaterials(userId: number): Promise<(StudyMaterial & { course: Course })[]>;
  createStudyMaterial(material: InsertStudyMaterial): Promise<StudyMaterial>;
  
  // UserMaterialProgress methods
  getUserMaterialProgress(userId: number, materialId: number): Promise<UserMaterialProgress | undefined>;
  updateUserMaterialProgress(id: number, progress: number): Promise<UserMaterialProgress>;
  createUserMaterialProgress(progress: InsertUserMaterialProgress): Promise<UserMaterialProgress>;
  
  // Subject methods
  getSubjects(): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  // UserSubjectProgress methods
  getUserSubjectProgress(userId: number): Promise<(UserSubjectProgress & { subject: Subject })[]>;
  updateUserSubjectProgress(id: number, progress: number): Promise<UserSubjectProgress>;
  createUserSubjectProgress(progress: InsertUserSubjectProgress): Promise<UserSubjectProgress>;
  
  // Notification methods
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: number): Promise<number>;
  markNotificationAsRead(id: number): Promise<Notification>;
  createNotification(notification: InsertNotification): Promise<Notification>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private userCourses: Map<number, UserCourse>;
  private studySessions: Map<number, StudySession>;
  private notes: Map<number, Note>;
  private studyMaterials: Map<number, StudyMaterial>;
  private userMaterialProgress: Map<number, UserMaterialProgress>;
  private subjects: Map<number, Subject>;
  private userSubjectProgress: Map<number, UserSubjectProgress>;
  private notifications: Map<number, Notification>;
  
  private currentUserId: number;
  private currentCourseId: number;
  private currentUserCourseId: number;
  private currentSessionId: number;
  private currentNoteId: number;
  private currentMaterialId: number;
  private currentUserMaterialProgressId: number;
  private currentSubjectId: number;
  private currentUserSubjectProgressId: number;
  private currentNotificationId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.userCourses = new Map();
    this.studySessions = new Map();
    this.notes = new Map();
    this.studyMaterials = new Map();
    this.userMaterialProgress = new Map();
    this.subjects = new Map();
    this.userSubjectProgress = new Map();
    this.notifications = new Map();
    
    this.currentUserId = 1;
    this.currentCourseId = 1;
    this.currentUserCourseId = 1;
    this.currentSessionId = 1;
    this.currentNoteId = 1;
    this.currentMaterialId = 1;
    this.currentUserMaterialProgressId = 1;
    this.currentSubjectId = 1;
    this.currentUserSubjectProgressId = 1;
    this.currentNotificationId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // Initialize with sample data for demonstration
  private async initializeSampleData() {
    // Create a sample user
    const user: InsertUser = {
      username: "alexj",
      password: "password123",
      fullName: "Alex Johnson",
      email: "alex.j@university.edu",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    };
    const createdUser = await this.createUser(user);
    
    // Create subjects
    const subjects: InsertSubject[] = [
      { name: "Math" },
      { name: "Science" },
      { name: "History" },
      { name: "English" },
      { name: "Computer Science" }
    ];
    
    const createdSubjects: Subject[] = [];
    for (const subject of subjects) {
      createdSubjects.push(await this.createSubject(subject));
    }
    
    // Create user subject progress
    const subjectProgress: [number, number][] = [
      [1, 85], // Math - 85%
      [2, 72], // Science - 72%
      [3, 91], // History - 91%
      [4, 64], // English - 64%
      [5, 78]  // Computer Science - 78%
    ];
    
    for (const [subjectId, progress] of subjectProgress) {
      await this.createUserSubjectProgress({
        userId: createdUser.id,
        subjectId,
        progress
      });
    }
    
    // Create courses
    const coursesData: InsertCourse[] = [
      { 
        name: "Advanced Mathematics", 
        code: "MATH 301", 
        instructor: "Dr. Sarah Johnson",
        description: "Advanced topics in calculus and linear algebra",
        iconName: "square-root-alt",
        iconColor: "primary"
      },
      { 
        name: "Physics II", 
        code: "PHYS 202", 
        instructor: "Prof. Michael Chen",
        description: "Electricity, magnetism, and modern physics",
        iconName: "atom",
        iconColor: "warning"
      },
      { 
        name: "Data Structures & Algorithms", 
        code: "CS 315", 
        instructor: "Dr. Robert Park",
        description: "Advanced data structures and algorithm design",
        iconName: "laptop-code",
        iconColor: "secondary"
      }
    ];
    
    const createdCourses: Course[] = [];
    for (const course of coursesData) {
      createdCourses.push(await this.createCourse(course));
    }
    
    // Create user courses (enrollments)
    const userCoursesData: [number, number, string][] = [
      [1, 75, "A-"],  // Math - 75% progress, A- grade
      [2, 60, "B+"],  // Physics - 60% progress, B+ grade
      [3, 85, "A"]    // CS - 85% progress, A grade
    ];
    
    for (let i = 0; i < userCoursesData.length; i++) {
      const [courseId, progress, grade] = userCoursesData[i];
      await this.createUserCourse({
        userId: createdUser.id,
        courseId,
        progress,
        grade
      });
    }
    
    // Create study sessions
    const sessionData: [number, string, number][] = [
      [1, "Calculus", 80 * 60],    // Math - Calculus - 1h 20m
      [2, "Mechanics", 45 * 60],   // Physics - Mechanics - 45m
      [3, "Algorithms", 125 * 60]  // CS - Algorithms - 2h 05m
    ];
    
    for (const [courseId, topic, duration] of sessionData) {
      await this.createStudySession({
        userId: createdUser.id,
        courseId,
        topic,
        duration,
        startTime: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 3600 * 1000)) // Random time in the last week
      });
    }
    
    // Create notes
    const notesData: [number, string, string][] = [
      [1, "Calculus Integration Techniques", "Remember the special cases for u-substitution and when to use integration by parts..."],
      [2, "Physics Formulas", "F=ma, E=mc², p=mv, KE=½mv², PE=mgh, ..."]
    ];
    
    for (const [courseId, title, content] of notesData) {
      await this.createNote({
        userId: createdUser.id,
        courseId,
        title,
        content,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 3600 * 1000)) // Random time in the last week
      });
    }
    
    // Create study materials
    const materialsData: InsertStudyMaterial[] = [
      {
        courseId: 1,
        title: "Complete Calculus Chapter 6",
        description: "You're 80% through this chapter. Finishing it will help with upcoming assignments.",
        type: "book",
        priority: "High Priority",
        progress: 80,
        iconName: "book"
      },
      {
        courseId: 2,
        title: "Physics Lab Report",
        description: "Start your lab report early to ensure you have time for revisions.",
        type: "assignment",
        priority: "Due in 3 days",
        progress: 15,
        iconName: "tasks"
      },
      {
        courseId: 3,
        title: "Watch Computer Science Lecture",
        description: "A new lecture on Data Structures has been uploaded to help with your next assignment.",
        type: "video",
        priority: "New Content",
        progress: 0,
        iconName: "video"
      }
    ];
    
    for (const material of materialsData) {
      await this.createStudyMaterial(material);
    }
    
    // Create notifications
    const notificationData: [string, string, string][] = [
      ["Assignment Graded", "Your Physics Lab Report was graded: A", "success"],
      ["Deadline Reminder", "Math Assignment due in 24 hours", "warning"],
      ["New Course Material", "Biology 101: New lecture notes available", "info"]
    ];
    
    const timeDifferences = [10 * 60 * 1000, 60 * 60 * 1000, 24 * 60 * 60 * 1000]; // 10 minutes, 1 hour, 1 day
    
    for (let i = 0; i < notificationData.length; i++) {
      const [title, message, type] = notificationData[i];
      await this.createNotification({
        userId: createdUser.id,
        title,
        message,
        type,
        read: false,
        createdAt: new Date(Date.now() - timeDifferences[i])
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Course methods
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }
  
  async createCourse(course: InsertCourse): Promise<Course> {
    const id = this.currentCourseId++;
    const newCourse: Course = { ...course, id };
    this.courses.set(id, newCourse);
    return newCourse;
  }
  
  // UserCourse methods
  async getUserCourses(userId: number): Promise<(UserCourse & { course: Course })[]> {
    const userCourses = Array.from(this.userCourses.values()).filter(
      (userCourse) => userCourse.userId === userId
    );
    
    return userCourses.map(userCourse => {
      const course = this.courses.get(userCourse.courseId)!;
      return { ...userCourse, course };
    });
  }
  
  async createUserCourse(userCourse: InsertUserCourse): Promise<UserCourse> {
    const id = this.currentUserCourseId++;
    const newUserCourse: UserCourse = { ...userCourse, id };
    this.userCourses.set(id, newUserCourse);
    return newUserCourse;
  }
  
  async updateUserCourseProgress(id: number, progress: number): Promise<UserCourse> {
    const userCourse = this.userCourses.get(id);
    if (!userCourse) throw new Error(`UserCourse with id ${id} not found`);
    
    const updatedUserCourse = { ...userCourse, progress };
    this.userCourses.set(id, updatedUserCourse);
    return updatedUserCourse;
  }
  
  async updateUserCourseGrade(id: number, grade: string): Promise<UserCourse> {
    const userCourse = this.userCourses.get(id);
    if (!userCourse) throw new Error(`UserCourse with id ${id} not found`);
    
    const updatedUserCourse = { ...userCourse, grade };
    this.userCourses.set(id, updatedUserCourse);
    return updatedUserCourse;
  }
  
  // StudySession methods
  async getStudySessions(userId: number): Promise<(StudySession & { course: Course })[]> {
    const sessions = Array.from(this.studySessions.values()).filter(
      (session) => session.userId === userId
    );
    
    return sessions.map(session => {
      const course = this.courses.get(session.courseId)!;
      return { ...session, course };
    });
  }
  
  async getRecentStudySessions(userId: number, limit: number): Promise<(StudySession & { course: Course })[]> {
    const sessions = Array.from(this.studySessions.values())
      .filter((session) => session.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
    
    return sessions.map(session => {
      const course = this.courses.get(session.courseId)!;
      return { ...session, course };
    });
  }
  
  async createStudySession(session: InsertStudySession): Promise<StudySession> {
    const id = this.currentSessionId++;
    const newSession: StudySession = { ...session, id };
    this.studySessions.set(id, newSession);
    return newSession;
  }
  
  // Note methods
  async getNotes(userId: number): Promise<(Note & { course: Course })[]> {
    const notes = Array.from(this.notes.values()).filter(
      (note) => note.userId === userId
    );
    
    return notes.map(note => {
      const course = this.courses.get(note.courseId)!;
      return { ...note, course };
    });
  }
  
  async getRecentNotes(userId: number, limit: number): Promise<(Note & { course: Course })[]> {
    const notes = Array.from(this.notes.values())
      .filter((note) => note.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    
    return notes.map(note => {
      const course = this.courses.get(note.courseId)!;
      return { ...note, course };
    });
  }
  
  async createNote(note: InsertNote): Promise<Note> {
    const id = this.currentNoteId++;
    const newNote: Note = { ...note, id };
    this.notes.set(id, newNote);
    return newNote;
  }
  
  async getNote(id: number): Promise<(Note & { course: Course }) | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const course = this.courses.get(note.courseId)!;
    return { ...note, course };
  }
  
  // StudyMaterial methods
  async getStudyMaterials(courseId: number): Promise<StudyMaterial[]> {
    return Array.from(this.studyMaterials.values()).filter(
      (material) => material.courseId === courseId
    );
  }
  
  async getRecommendedMaterials(userId: number): Promise<(StudyMaterial & { course: Course })[]> {
    // Get user courses
    const userCourseIds = Array.from(this.userCourses.values())
      .filter(uc => uc.userId === userId)
      .map(uc => uc.courseId);
    
    // Get materials for those courses
    const materials = Array.from(this.studyMaterials.values())
      .filter(material => userCourseIds.includes(material.courseId));
    
    // Sort by priority (assuming higher progress needs more attention)
    materials.sort((a, b) => {
      // First by progress (lower progress first)
      if (a.progress !== b.progress) {
        return a.progress - b.progress;
      }
      
      // If progress is the same, prioritize by type
      const typePriority: Record<string, number> = {
        'assignment': 1,
        'book': 2,
        'video': 3
      };
      
      return (typePriority[a.type] || 999) - (typePriority[b.type] || 999);
    });
    
    return materials.map(material => {
      const course = this.courses.get(material.courseId)!;
      return { ...material, course };
    });
  }
  
  async createStudyMaterial(material: InsertStudyMaterial): Promise<StudyMaterial> {
    const id = this.currentMaterialId++;
    const newMaterial: StudyMaterial = { ...material, id };
    this.studyMaterials.set(id, newMaterial);
    return newMaterial;
  }
  
  // UserMaterialProgress methods
  async getUserMaterialProgress(userId: number, materialId: number): Promise<UserMaterialProgress | undefined> {
    return Array.from(this.userMaterialProgress.values()).find(
      (progress) => progress.userId === userId && progress.materialId === materialId
    );
  }
  
  async updateUserMaterialProgress(id: number, progress: number): Promise<UserMaterialProgress> {
    const userProgress = this.userMaterialProgress.get(id);
    if (!userProgress) throw new Error(`UserMaterialProgress with id ${id} not found`);
    
    const updatedProgress = { ...userProgress, progress };
    this.userMaterialProgress.set(id, updatedProgress);
    return updatedProgress;
  }
  
  async createUserMaterialProgress(progress: InsertUserMaterialProgress): Promise<UserMaterialProgress> {
    const id = this.currentUserMaterialProgressId++;
    const newProgress: UserMaterialProgress = { ...progress, id };
    this.userMaterialProgress.set(id, newProgress);
    return newProgress;
  }
  
  // Subject methods
  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }
  
  async createSubject(subject: InsertSubject): Promise<Subject> {
    const id = this.currentSubjectId++;
    const newSubject: Subject = { ...subject, id };
    this.subjects.set(id, newSubject);
    return newSubject;
  }
  
  // UserSubjectProgress methods
  async getUserSubjectProgress(userId: number): Promise<(UserSubjectProgress & { subject: Subject })[]> {
    const progresses = Array.from(this.userSubjectProgress.values()).filter(
      (progress) => progress.userId === userId
    );
    
    return progresses.map(progress => {
      const subject = this.subjects.get(progress.subjectId)!;
      return { ...progress, subject };
    });
  }
  
  async updateUserSubjectProgress(id: number, progress: number): Promise<UserSubjectProgress> {
    const userProgress = this.userSubjectProgress.get(id);
    if (!userProgress) throw new Error(`UserSubjectProgress with id ${id} not found`);
    
    const updatedProgress = { ...userProgress, progress };
    this.userSubjectProgress.set(id, updatedProgress);
    return updatedProgress;
  }
  
  async createUserSubjectProgress(progress: InsertUserSubjectProgress): Promise<UserSubjectProgress> {
    const id = this.currentUserSubjectProgressId++;
    const newProgress: UserSubjectProgress = { ...progress, id };
    this.userSubjectProgress.set(id, newProgress);
    return newProgress;
  }
  
  // Notification methods
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getUnreadNotificationsCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId && !notification.read
    ).length;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) throw new Error(`Notification with id ${id} not found`);
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const newNotification: Notification = { ...notification, id };
    this.notifications.set(id, newNotification);
    return newNotification;
  }
}

export const storage = new MemStorage();
