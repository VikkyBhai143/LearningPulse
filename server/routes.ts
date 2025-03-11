import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { formatDistance } from 'date-fns';
import {
  insertNoteSchema,
  insertStudySessionSchema,
  insertUserMaterialProgressSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // Get user data (assuming we have a logged in user with ID 1)
  app.get('/api/user', async (req, res) => {
    const user = await storage.getUser(1);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't send password
    const { password, ...userData } = user;
    res.json(userData);
  });
  
  // Get user subject progress
  app.get('/api/user/subjects/progress', async (req, res) => {
    const subjectProgress = await storage.getUserSubjectProgress(1);
    res.json(subjectProgress);
  });
  
  // Get user courses
  app.get('/api/user/courses', async (req, res) => {
    const userCourses = await storage.getUserCourses(1);
    res.json(userCourses);
  });
  
  // Get recent study sessions
  app.get('/api/user/study-sessions/recent', async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const sessions = await storage.getRecentStudySessions(1, limit);
    
    // Format sessions for the frontend
    const formattedSessions = sessions.map(session => {
      const hours = Math.floor(session.duration / 3600);
      const minutes = Math.floor((session.duration % 3600) / 60);
      const formattedDuration = hours > 0 
        ? `${hours}h ${minutes}m` 
        : `${minutes}m`;
      
      return {
        id: session.id,
        subject: session.course.name,
        topic: session.topic,
        duration: formattedDuration
      };
    });
    
    res.json(formattedSessions);
  });
  
  // Create study session
  app.post('/api/user/study-sessions', async (req, res) => {
    try {
      const validatedData = insertStudySessionSchema.parse(req.body);
      const newSession = await storage.createStudySession(validatedData);
      res.status(201).json(newSession);
    } catch (error) {
      res.status(400).json({ message: 'Invalid session data', error });
    }
  });
  
  // Get recent notes
  app.get('/api/user/notes/recent', async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const notes = await storage.getRecentNotes(1, limit);
    
    // Format notes for the frontend
    const formattedNotes = notes.map(note => {
      return {
        id: note.id,
        title: note.title,
        preview: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
        date: formatDistance(note.createdAt, new Date(), { addSuffix: true })
      };
    });
    
    res.json(formattedNotes);
  });
  
  // Create note
  app.post('/api/user/notes', async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const newNote = await storage.createNote(validatedData);
      res.status(201).json(newNote);
    } catch (error) {
      res.status(400).json({ message: 'Invalid note data', error });
    }
  });
  
  // Get recommended study materials
  app.get('/api/user/materials/recommended', async (req, res) => {
    const materials = await storage.getRecommendedMaterials(1);
    res.json(materials);
  });
  
  // Update user material progress
  app.patch('/api/user/materials/:materialId/progress', async (req, res) => {
    const materialId = parseInt(req.params.materialId);
    const { progress } = req.body;
    
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Invalid progress value' });
    }
    
    try {
      // Check if progress entry exists
      let userProgress = await storage.getUserMaterialProgress(1, materialId);
      
      if (userProgress) {
        // Update existing progress
        userProgress = await storage.updateUserMaterialProgress(userProgress.id, progress);
      } else {
        // Create new progress entry
        const newProgressData = {
          userId: 1,
          materialId,
          progress
        };
        
        const validatedData = insertUserMaterialProgressSchema.parse(newProgressData);
        userProgress = await storage.createUserMaterialProgress(validatedData);
      }
      
      res.json(userProgress);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update progress', error });
    }
  });
  
  // Get notifications
  app.get('/api/user/notifications', async (req, res) => {
    const notifications = await storage.getNotifications(1);
    res.json(notifications);
  });
  
  // Get unread notifications count
  app.get('/api/user/notifications/unread/count', async (req, res) => {
    const count = await storage.getUnreadNotificationsCount(1);
    res.json({ count });
  });
  
  // Mark notification as read
  app.patch('/api/user/notifications/:id/read', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const updatedNotification = await storage.markNotificationAsRead(id);
      res.json(updatedNotification);
    } catch (error) {
      res.status(404).json({ message: 'Notification not found', error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
