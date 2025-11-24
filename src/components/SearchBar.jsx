"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce"; // 💡 แนะนำให้ลง npm i use-debounce เพื่อลดการ Request ถี่ๆ

// ถ้าไม่อยากลง library เพิ่ม สามารถใช้ setTimeout ปกติได้ แต่ use-debounce สะดวกกว่า
// หากไม่มี use-debounce ให้ลบ import และใช้ onChange ปกติ

export default function SearchBar({ placeholder }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // ฟังก์ชันค้นหา (Update URL)
  const handleSearch = (term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    // Replace URL โดยไม่ refresh หน้า
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        ค้นหา
      </label>
      <input
        className="peer block w-full rounded-xl border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 focus:border-orange-500 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get("q")?.toString()}
      />
      <Search className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-orange-500 dark:text-gray-400" />
    </div>
  );
}
