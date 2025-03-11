import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  avatarUrl: true,
});

// Course model
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  instructor: text("instructor").notNull(),
  description: text("description"),
  iconName: text("icon_name").notNull(),
  iconColor: text("icon_color").notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  name: true,
  code: true,
  instructor: true,
  description: true,
  iconName: true,
  iconColor: true,
});

// UserCourse model - to track enrollment and progress
export const userCourses = pgTable("user_courses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  progress: integer("progress").notNull().default(0),
  grade: text("grade"),
});

export const insertUserCourseSchema = createInsertSchema(userCourses).pick({
  userId: true,
  courseId: true,
  progress: true,
  grade: true,
});

// Study sessions
export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  topic: text("topic"),
  duration: integer("duration").notNull(), // in seconds
  startTime: timestamp("start_time").notNull(),
});

export const insertStudySessionSchema = createInsertSchema(studySessions).pick({
  userId: true,
  courseId: true,
  topic: true,
  duration: true,
  startTime: true,
});

// Notes
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const insertNoteSchema = createInsertSchema(notes).pick({
  userId: true,
  courseId: true,
  title: true,
  content: true,
  createdAt: true,
});

// StudyMaterial
export const studyMaterials = pgTable("study_materials", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // book, video, assignment, etc.
  priority: text("priority").notNull(), // high, medium, low
  progress: integer("progress").default(0),
  iconName: text("icon_name").notNull(),
});

export const insertStudyMaterialSchema = createInsertSchema(studyMaterials).pick({
  courseId: true,
  title: true,
  description: true,
  type: true,
  priority: true,
  progress: true,
  iconName: true,
});

// UserMaterialProgress
export const userMaterialProgress = pgTable("user_material_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  materialId: integer("material_id").notNull(),
  progress: integer("progress").notNull().default(0),
});

export const insertUserMaterialProgressSchema = createInsertSchema(userMaterialProgress).pick({
  userId: true,
  materialId: true,
  progress: true,
});

// Subject - for progress tracking across subjects
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const insertSubjectSchema = createInsertSchema(subjects).pick({
  name: true,
});

// UserSubjectProgress
export const userSubjectProgress = pgTable("user_subject_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  progress: integer("progress").notNull().default(0),
});

export const insertUserSubjectProgressSchema = createInsertSchema(userSubjectProgress).pick({
  userId: true,
  subjectId: true,
  progress: true,
});

// Notification
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // success, warning, info
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
  read: true,
  createdAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type UserCourse = typeof userCourses.$inferSelect;
export type InsertUserCourse = z.infer<typeof insertUserCourseSchema>;

export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;

export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type StudyMaterial = typeof studyMaterials.$inferSelect;
export type InsertStudyMaterial = z.infer<typeof insertStudyMaterialSchema>;

export type UserMaterialProgress = typeof userMaterialProgress.$inferSelect;
export type InsertUserMaterialProgress = z.infer<typeof insertUserMaterialProgressSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type UserSubjectProgress = typeof userSubjectProgress.$inferSelect;
export type InsertUserSubjectProgress = z.infer<typeof insertUserSubjectProgressSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
