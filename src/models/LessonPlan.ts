export interface LessonPlan {
  _id?: string;
  teacherName: string;
  subject: string;
  title: string;
  fileUrl: string;
  semester: string;
  academicYear: string;
  hasAfterClassNote?: boolean;
  status: "pending" | "approved" | "rejected";
  feedback: string;
  createdAt: Date;
  updatedAt: Date;
}
