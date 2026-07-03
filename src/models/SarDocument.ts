import { ObjectId } from 'mongodb';

export interface ISarDocument {
  _id?: ObjectId;
  year: string;
  title: string;
  file: string; // URL path of the uploaded file
  createdAt: Date;
  updatedAt: Date;
}
