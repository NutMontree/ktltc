export interface SupervisionRecord {
  _id?: string;
  teacherName: string;
  supervisorName: string;
  subject: string;
  supervisionDate: Date;
  score: number;
  maxScore: number;
  feedback: string;
  createdAt: Date;
  updatedAt: Date;
}
