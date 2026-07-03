import { ObjectId } from 'mongodb';

export interface ISarLog {
  _id?: ObjectId;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  details: string;
  timestamp: Date;
}
