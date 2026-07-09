import { ObjectId } from 'mongodb';

export interface IInvention {
  _id?: ObjectId;
  id?: number; // For backward compatibility with the flipbook array, we can use an integer ID, or just use string _id
  title: string;
  creator: string;
  department: string;
  year: string;
  description: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
