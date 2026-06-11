export interface StudentCare {
  _id?: string;
  teacherName: string;
  classroom: string;
  studentName: string;
  visitDate: Date;
  sdqType: "normal" | "risk" | "problem";
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
