import { ObjectId } from 'mongodb';

export interface IBook {
  _id?: ObjectId;
  title: string;
  slug: string; // URL-friendly name, e.g., 'inventions-2569'
  description: string;
  coverImageUrl?: string;
  themeColor?: string; // e.g., 'blue', 'amber', etc.
  createdAt: Date;
  updatedAt: Date;
}
