// my-projext/src/lib/models/Task.js

import mongoose, { Schema } from 'mongoose';

// กำหนด Schema
const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true, // เพิ่ม createdAt และ updatedAt โดยอัตโนมัติ
    }
);

// ตรวจสอบว่ามี Model อยู่แล้วหรือไม่
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

export default Task;