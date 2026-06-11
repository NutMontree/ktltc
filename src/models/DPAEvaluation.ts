export interface DPAEvaluation {
  _id?: string;
  teacherName: string;
  academicYear: string;
  goals: string;
  evidenceLinks: string[];
  status: "draft" | "submitted" | "evaluated";
  evaluatorScore: number;
  evaluatorFeedback: string;
  createdAt: Date;
  updatedAt: Date;
}
