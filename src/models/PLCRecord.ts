export interface PLCRecord {
  _id?: string;
  topic: string;
  participants: string[];
  meetingDate: Date;
  durationHours: number;
  summary: string;
  status: "pending" | "approved";
  createdAt: Date;
  updatedAt: Date;
}
