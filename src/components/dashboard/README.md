# Student Dashboard Components

นี่คือชุดของ React Components สำหรับสร้างหน้า Dashboard ของนักศึกษา ที่ใช้ Next.js, Framer Motion, และ Tailwind CSS

## Components

### 1. **StudentDashboard**

หลัก Dashboard Component ที่แสดงปุ่ม 3 ปุ่มหลัก

```tsx
import { StudentDashboard } from "@/components/dashboard";

export default function Page() {
  return <StudentDashboard />;
}
```

**Features:**

- 3 ปุ่มหลัก: เช็คชื่อเข้าแถว, DVE Portal, กล่องข้อความ
- Animation แบบ stagger
- Hover effects ที่ดี
- Responsive design (mobile, tablet, desktop)
- Icon และ colors ที่สวยงาม

**Props:**

- `className?: string` - CSS classes เพิ่มเติม

---

### 2. **CompactStudentDashboard**

Version compact ของ Dashboard ที่เหมาะสำหรับ embedding ในหน้าอื่น

```tsx
import { CompactStudentDashboard } from "@/components/dashboard";

export default function Page() {
  return <CompactStudentDashboard columns={2} />;
}
```

**Features:**

- ขนาดเล็กกว่า StudentDashboard
- Customizable columns
- เร็วและ lightweight
- เหมาะสำหรับ sidebar หรือ widget

**Props:**

- `className?: string` - CSS classes เพิ่มเติม
- `columns?: 1 | 2 | 3` - จำนวน columns (default: 3)

---

### 3. **StudentDashboardCard**

ปุ่มเดียว ที่สามารถ custom ได้ทั้งหมด

```tsx
import { StudentDashboardCard } from "@/components/dashboard";
import { CheckCircle2 } from "lucide-react";

export default function Page() {
  return (
    <StudentDashboardCard
      id="flagpole"
      title="เช็คชื่อเข้าแถว"
      description="ระบบเช็คชื่อและแถวแปดริ้ว"
      icon={CheckCircle2}
      href="/student/flagpole"
      color="from-blue-500 to-blue-600"
      bgColor="bg-blue-50"
      iconColor="text-blue-600"
    />
  );
}
```

**Props:**

- `id: string` - Unique identifier
- `title: string` - ชื่อปุ่ม
- `description: string` - รายละเอียด
- `icon: LucideIcon` - Lucide icon
- `href: string` - Link path
- `color: string` - Gradient color (e.g., "from-blue-500 to-blue-600")
- `bgColor: string` - Background color (e.g., "bg-blue-50")
- `iconColor: string` - Icon color (e.g., "text-blue-600")
- `badge?: ReactNode` - Optional badge
- `onClick?: () => void` - Optional click handler
- `isExternal?: boolean` - Open in new tab

---

### 4. **StudentDashboardSection**

Section title component สำหรับ organize content

```tsx
import { StudentDashboardSection } from "@/components/dashboard";

export default function Page() {
  return (
    <StudentDashboardSection
      title="ระบบหลักของนักศึกษา"
      subtitle="เข้าใช้งานระบบสำคัญของสถาบัน"
      icon="📚"
    />
  );
}
```

**Props:**

- `title: string` - ชื่อ section
- `subtitle?: string` - รายละเอียดเพิ่มเติม
- `icon?: ReactNode` - Icon หรือ emoji
- `className?: string` - CSS classes เพิ่มเติม

---

### 5. **StudentNavButton**

ปุ่ม navigation ที่เล็กและสามารถใช้ได้ทั่วไป

```tsx
import { StudentNavButton } from "@/components/dashboard";
import { MessageSquare } from "lucide-react";

export default function Page() {
  return (
    <StudentNavButton
      label="ส่งข้อความ"
      icon={MessageSquare}
      href="/dashboard/chat"
      variant="primary"
      size="md"
    />
  );
}
```

**Props:**

- `label: string` - ข้อความปุ่ม
- `icon: LucideIcon` - Lucide icon
- `href: string` - Link path
- `variant?: "primary" | "secondary" | "outline"` - ปลายแบบ (default: "primary")
- `size?: "sm" | "md" | "lg"` - ขนาด (default: "md")
- `isExternal?: boolean` - Open in new tab
- `onClick?: () => void` - Click handler
- `badge?: ReactNode` - Notification badge
- `className?: string` - CSS classes เพิ่มเติม

---

## Usage Examples

### Full Page Dashboard

```tsx
import { StudentDashboard, StudentDashboardSection } from "@/components/dashboard";

export default function StudentDashboardPage() {
  return (
    <div className="p-8">
      <StudentDashboardSection
        title="ระบบหลักของนักศึกษา"
        subtitle="เข้าใช้งานระบบสำคัญของสถาบัน"
      />
      <StudentDashboard />
    </div>
  );
}
```

### Embedded Widget

```tsx
import { CompactStudentDashboard } from "@/components/dashboard";

export default function HomePage() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">ลงทะเบียนอย่างรวดเร็ว</h2>
      <CompactStudentDashboard columns={1} />
    </div>
  );
}
```

### Custom Cards Grid

```tsx
import { StudentDashboardCard } from "@/components/dashboard";
import { motion, Variants } from "framer-motion";
import { CheckCircle2, BookOpen, MessageSquare } from "lucide-react";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function CustomDashboard() {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <StudentDashboardCard
        id="flagpole"
        title="เช็คชื่อเข้าแถว"
        description="ระบบเช็คชื่อและแถวแปดริ้ว"
        icon={CheckCircle2}
        href="/student/flagpole"
        color="from-blue-500 to-blue-600"
        bgColor="bg-blue-50"
        iconColor="text-blue-600"
      />
      {/* More cards */}
    </motion.div>
  );
}
```

---

## URL Paths

Components link ไปยัง:

1. **เช็คชื่อเข้าแถว** → `/student/flagpole`
2. **ศูนย์การศึกษา DVE** → `/dashboard/dve/student`
3. **กล่องข้อความ** → `/dashboard/chat`

---

## Features

✅ **Responsive Design** - Mobile, tablet, desktop
✅ **Animations** - Framer Motion for smooth transitions
✅ **Dark Mode Ready** - Using Tailwind utilities
✅ **Accessible** - Semantic HTML and keyboard navigation
✅ **TypeScript** - Full type safety
✅ **Customizable** - Props-based configuration
✅ **Icons** - Using lucide-react icons

---

## Customization

### เปลี่ยน Colors

```tsx
// ใช้ Tailwind gradient colors
const dashboardItems = [
  {
    color: "from-red-500 to-red-600", // Primary color
    bgColor: "bg-red-50", // Background
    iconColor: "text-red-600", // Icon
  },
];
```

### เปลี่ยน Icons

```tsx
import { Star, Heart, Zap } from "lucide-react";

// Replace any icon
icon: Star;
```

### เพิ่ม/ลด Items

```tsx
const dashboardItems = [
  // Modify array to add or remove items
];
```

---

## File Structure

```
src/components/dashboard/
├── StudentDashboard.tsx              # Main dashboard
├── CompactStudentDashboard.tsx       # Compact version
├── StudentDashboardCard.tsx          # Single card
├── StudentDashboardSection.tsx       # Section title
├── StudentNavButton.tsx              # Nav button
├── DashboardHeader.tsx               # Existing header
└── index.ts                          # Exports
```

---

## Dependencies

- **Next.js** - React framework
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **lucide-react** - Icons
- **next-auth** - Authentication

---

## Notes

- All components use `"use client"` directive for client-side rendering
- Components are fully responsive
- Animation timing is optimized for UX
- Color scheme follows the existing design system
- Icons from lucide-react are used throughout

---

## Contact

สำหรับคำถามหรือข้อเสนอแนะ โปรดติดต่อทีมพัฒนา
