import { ObjectId } from 'mongodb';

export interface IPage {
  _id?: ObjectId;
  bookId: string | ObjectId;
  pageNumber: number;
  title: string;
  imageUrl?: string;
  content: string; // Rich text or long description
  // Optional meta fields that can be used flexibly
  meta?: {
    creator?: string;
    department?: string;
    year?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
