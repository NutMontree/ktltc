/**
 * User Structure Documentation (Native MongoDB)
 * 
 * Fields:
 * - name: string
 * - email: string (unique)
 * - password: string (hashed)
 * - role: enum ["super_admin", "director", "deputy_resource", "deputy_strategy", "deputy_academic", "deputy_student_affairs", "hr", "admin", "general", "editor", "user"]
 * - department: string
 * - position: string (Optional - e.g., หัวหน้าแผนกวิชา, ครู คศ.3)
 * - faction: string (Optional - e.g., งานวิทยบริการและห้องสมุด)
 * - description: string (Optional - e.g., พนักงานราชการ ครู)
 * - image: string
 * - coverImage: string
 * - deviceId: string
 * - isActive: boolean
 * - createdAt: Date
 * - updatedAt: Date
 * - username: string
 */

export const UserRoles = ["super_admin", "director", "deputy_resource", "deputy_strategy", "deputy_academic", "deputy_student_affairs", "hr", "admin", "general", "editor", "user"];
