export interface LessonPlan {
  _id?: string;
  teacherName: string;
  subject: string;
  title: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  feedback: string;
  createdAt: Date;
  updatedAt: Date;
}
