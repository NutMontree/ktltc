# Integration Examples

## วิธีใช้งาน Student Dashboard Components ในโครงการ

### 1️⃣ ใช้ Full Dashboard ในหน้า Student Dashboard

```tsx
// src/app/student/page.tsx
import { StudentDashboard, StudentDashboardSection } from "@/components/dashboard";

export default function StudentDashboardPage() {
  return (
    <div className="p-8">
      <h1>Dashboard นักศึกษา</h1>

      <StudentDashboardSection
        title="ระบบหลักของนักศึกษา"
        subtitle="เข้าใช้งานระบบสำคัญ"
        icon="📚"
      />

      <StudentDashboard className="mt-8" />
    </div>
  );
}
```

---

### 2️⃣ ใช้ Compact Dashboard ในหน้า Home

```tsx
// src/app/page.tsx
import { CompactStudentDashboard } from "@/components/dashboard";

export default function HomePage() {
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold mb-4">ลงทะเบียนอย่างรวดเร็ว</h2>
      <CompactStudentDashboard columns={1} />
    </div>
  );
}
```

---

### 3️⃣ ใช้ Nav Buttons ในหน้า Profile

```tsx
// src/app/dashboard/profile/page.tsx
import { StudentNavButton } from "@/components/dashboard";
import { CheckCircle2, MessageSquare } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="p-8">
      <h1>โปรไฟล์ของคุณ</h1>

      <div className="mt-8 flex gap-4">
        <StudentNavButton
          label="เช็คชื่อ"
          icon={CheckCircle2}
          href="/student/flagpole"
          variant="primary"
          size="md"
        />
        <StudentNavButton
          label="ข้อความ"
          icon={MessageSquare}
          href="/dashboard/chat"
          variant="secondary"
          size="md"
          badge="3"
        />
      </div>
    </div>
  );
}
```

---

### 4️⃣ ใช้ StudentDashboardCard สำหรับ Custom Layout

```tsx
// src/app/dashboard/custom/page.tsx
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
  const items = [
    {
      id: "flagpole",
      title: "เช็คชื่อเข้าแถว",
      description: "ระบบเช็คชื่อและแถวแปดริ้ว",
      icon: CheckCircle2,
      href: "/student/flagpole",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      id: "dve",
      title: "ศูนย์การศึกษา DVE",
      description: "DVE Portal สำหรับนักศึกษา",
      icon: BookOpen,
      href: "/dashboard/dve/student",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      id: "chat",
      title: "กล่องข้อความ",
      description: "ติดต่อและแชทกับอื่นๆ",
      icon: MessageSquare,
      href: "/dashboard/chat",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {items.map((item) => (
        <StudentDashboardCard key={item.id} {...item} />
      ))}
    </motion.div>
  );
}
```

---

### 5️⃣ ใช้ StudentDashboardSection สำหรับจัดระเบียบ

```tsx
// src/app/dashboard/organized/page.tsx
import { StudentDashboardSection, StudentNavButton } from "@/components/dashboard";
import { CheckCircle2, BookOpen, MessageSquare } from "lucide-react";

export default function OrganizedDashboard() {
  return (
    <div className="p-8 space-y-12">
      {/* Section 1 */}
      <div>
        <StudentDashboardSection title="ระบบหลัก" subtitle="ระบบที่ใช้บ่อย" icon="📌" />
        <div className="flex gap-4 mt-4">
          <StudentNavButton
            label="เช็คชื่อ"
            icon={CheckCircle2}
            href="/student/flagpole"
            variant="primary"
            size="md"
          />
          <StudentNavButton
            label="DVE"
            icon={BookOpen}
            href="/dashboard/dve/student"
            variant="primary"
            size="md"
          />
        </div>
      </div>

      {/* Section 2 */}
      <div>
        <StudentDashboardSection title="การสื่อสาร" subtitle="ติดต่อและแชท" icon="💬" />
        <div className="flex gap-4 mt-4">
          <StudentNavButton
            label="ข้อความ"
            icon={MessageSquare}
            href="/dashboard/chat"
            variant="secondary"
            size="md"
            badge="5"
          />
        </div>
      </div>
    </div>
  );
}
```

---

### 6️⃣ ใช้กับ Sidebar Navigation

```tsx
// src/components/Sidebar.tsx
import { StudentNavButton, CompactStudentDashboard } from "@/components/dashboard";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white p-4 shadow-lg">
      <h2 className="font-bold text-lg mb-6">Quick Access</h2>

      <CompactStudentDashboard columns={1} className="mb-8" />

      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold mb-3">More</h3>
        <nav className="space-y-2">{/* Other nav items */}</nav>
      </div>
    </aside>
  );
}
```

---

### 7️⃣ Responsive Layout Example

```tsx
// src/app/dashboard/responsive/page.tsx
import {
  StudentDashboard,
  CompactStudentDashboard,
  StudentDashboardSection,
} from "@/components/dashboard";

export default function ResponsiveExample() {
  return (
    <div className="p-4 md:p-8">
      <StudentDashboardSection title="Dashboard นักศึกษา" subtitle="เลือกระบบที่ต้องการ" />

      {/* Desktop: Full Dashboard */}
      <div className="hidden lg:block">
        <StudentDashboard />
      </div>

      {/* Tablet: Compact 2 columns */}
      <div className="hidden md:block lg:hidden">
        <CompactStudentDashboard columns={2} />
      </div>

      {/* Mobile: Compact 1 column */}
      <div className="md:hidden">
        <CompactStudentDashboard columns={1} />
      </div>
    </div>
  );
}
```

---

### 8️⃣ ใช้กับ Loading State

```tsx
// src/app/dashboard/with-loader/page.tsx
"use client";

import { useState, useEffect } from "react";
import { StudentDashboard, StudentDashboardSection } from "@/components/dashboard";
import { Loader2 } from "lucide-react";

export default function DashboardWithLoader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <StudentDashboardSection title="Dashboard นักศึกษา" subtitle="เลือกระบบ" />
      <StudentDashboard className="mt-8" />
    </div>
  );
}
```

---

### 9️⃣ ใช้กับ Authentication Guard

```tsx
// src/app/student-only/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { StudentDashboard, StudentDashboardSection } from "@/components/dashboard";

export default function StudentOnlyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="p-8">
      <StudentDashboardSection
        title={`ยินดีต้อนรับ, ${session?.user?.name}`}
        subtitle="Dashboard ของคุณ"
      />
      <StudentDashboard className="mt-8" />
    </div>
  );
}
```

---

### 🔟 ใช้กับ Toast Notifications

```tsx
// src/app/dashboard/with-toast/page.tsx
"use client";

import { StudentNavButton } from "@/components/dashboard";
import { toast } from "react-hot-toast";
import { MessageSquare } from "lucide-react";

export default function DashboardWithToast() {
  const handleClick = () => {
    toast.success("ข้อความถูกส่งแล้ว!");
  };

  return (
    <StudentNavButton
      label="ส่งข้อความ"
      icon={MessageSquare}
      href="/dashboard/chat"
      variant="primary"
      onClick={handleClick}
    />
  );
}
```

---

## 📝 Import Patterns

### แบบ Individual Import

```tsx
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import CompactStudentDashboard from "@/components/dashboard/CompactStudentDashboard";
```

### แบบ Index Import (Recommended)

```tsx
import {
  StudentDashboard,
  CompactStudentDashboard,
  StudentDashboardCard,
  StudentDashboardSection,
  StudentNavButton,
} from "@/components/dashboard";
```

---

## 🎨 Tailwind Classes Used

- `grid`, `gap`, `grid-cols-*` - Layout
- `p-*` - Padding
- `rounded-*` - Border radius
- `shadow-*` - Shadows
- `hover:*` - Hover states
- `transition-*` - Animations
- `bg-*`, `text-*` - Colors
- `animate-*` - Keyframe animations

---

## ✅ Ready to Use

ทั้งหมด components สามารถนำไปใช้งานได้ทันที โดยไม่ต้องติดตั้ง dependencies เพิ่มเติม เพราะว่าทั้งหมดมีอยู่แล้วในโครงการ!
