"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Clock, ChevronUp, ChevronDown, X } from "lucide-react";

const thaiMonths = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const daysOfWeek = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export interface PremiumDatePickerProps {
  value?: string;
  onChange?: (val: string) => void;
  showTime?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function PremiumDatePicker({
  value,
  onChange,
  showTime = false,
  placeholder = "เลือกวันที่",
  className,
  disabled = false,
}: PremiumDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [amPm, setAmPm] = useState("AM");
  const popupRef = useRef<HTMLDivElement>(null);

  // Initialize date & time from value
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const parts = value.split("T");
      const [year, month, day] = parts[0].split("-").map(Number);
      const d = new Date(year, month - 1, day);
      setSelectedDate(d);
      setCurrentDate(d);

      if (parts[1]) {
        const [h, m] = parts[1].split(":").map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          const h12 = h % 12 || 12;
          setHour(String(h12).padStart(2, "0"));
          setMinute(String(m).padStart(2, "0"));
          setAmPm(h >= 12 ? "PM" : "AM");
        }
      }
    } else {
      setSelectedDate(null);
      setCurrentDate(new Date());
    }
  }, [value]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handleSelectDate = (day: number) => {
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);

    if (!showTime) {
      const yy = newDate.getFullYear();
      const mm = String(newDate.getMonth() + 1).padStart(2, "0");
      const dd = String(newDate.getDate()).padStart(2, "0");
      if (onChange) onChange(`${yy}-${mm}-${dd}`);
      setIsOpen(false);
    }
  };

  const handleDone = () => {
    if (selectedDate && onChange) {
      const yy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");

      if (showTime) {
        let h24 = parseInt(hour, 10);
        if (amPm === "PM" && h24 < 12) h24 += 12;
        if (amPm === "AM" && h24 === 12) h24 = 0;
        const hh = String(h24).padStart(2, "0");
        onChange(`${yy}-${mm}-${dd}T${hh}:${minute}`);
      } else {
        onChange(`${yy}-${mm}-${dd}`);
      }
    }
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
    const curH = today.getHours();
    const curM = today.getMinutes();
    setHour(String(curH % 12 || 12).padStart(2, "0"));
    setMinute(String(curM).padStart(2, "0"));
    setAmPm(curH >= 12 ? "PM" : "AM");

    if (!showTime && onChange) {
      const yy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      onChange(`${yy}-${mm}-${dd}`);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(null);
    if (onChange) onChange("");
  };

  const formatDateToThai = (dateObj: Date | null) => {
    if (!dateObj) return placeholder;
    const d = dateObj.getDate();
    const m = thaiMonths[dateObj.getMonth()];
    const y = dateObj.getFullYear() + (dateObj.getFullYear() < 2500 ? 543 : 0);
    return `${d} ${m} ${y}`;
  };

  const currentY = new Date().getFullYear();
  const yearsList = Array.from({ length: 25 }, (_, i) => currentY - 10 + i);

  // Time controls
  const incrementHour = () => setHour((h) => String((parseInt(h, 10) % 12) + 1).padStart(2, "0"));
  const decrementHour = () =>
    setHour((h) => String(((parseInt(h, 10) - 2 + 12) % 12) + 1).padStart(2, "0"));
  const incrementMinute = () => setMinute((m) => String((parseInt(m, 10) + 1) % 60).padStart(2, "0"));
  const decrementMinute = () =>
    setMinute((m) => String((parseInt(m, 10) - 1 + 60) % 60).padStart(2, "0"));
  const toggleAmPm = () => setAmPm((a) => (a === "AM" ? "PM" : "AM"));

  return (
    <div className="relative w-full" ref={popupRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={
          className ||
          "w-full flex items-center justify-between rounded-2xl border-[1.5px] border-emerald-500/40 bg-white/70 px-4 py-3 text-sm font-bold text-gray-700 shadow-xs backdrop-blur-md outline-none transition hover:border-emerald-500 hover:shadow-md focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-gray-200"
        }
      >
        <div className="flex items-center gap-3 overflow-hidden text-left">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <span className={`truncate ${selectedDate ? "text-zinc-800 dark:text-zinc-100 font-bold" : "text-zinc-400 dark:text-zinc-500 font-medium"}`}>
            {formatDateToThai(selectedDate)}
          </span>
          {showTime && selectedDate && (
            <>
              <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 shrink-0"></div>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 shrink-0 text-xs font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {hour}:{minute} {amPm}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {selectedDate && (
            <span
              role="button"
              onClick={handleClear}
              className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              title="ล้างวันที่"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <Calendar className="w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
      </button>

      {/* Popup Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={`absolute z-[9999] mt-2 flex flex-col ${
              showTime ? "md:flex-row min-w-[320px] md:min-w-[540px]" : "min-w-[310px] max-w-[340px]"
            } gap-5 rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800`}
            style={{ left: 0 }}
          >
            {/* Left side: Calendar */}
            <div className="flex-1">
              {/* Header: Month & Year Selector */}
              <div className="flex items-center justify-between mb-4 bg-zinc-50 dark:bg-zinc-800/60 p-1.5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 shadow-xs hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex gap-1.5 font-bold text-zinc-700 dark:text-zinc-200">
                  {/* Month */}
                  <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-xl shadow-xs px-2.5 py-1 hover:ring-2 hover:ring-emerald-500/20 transition-all border border-zinc-200/60 dark:border-zinc-800">
                    <select
                      value={month}
                      onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value, 10), 1))}
                      className="appearance-none bg-transparent outline-none cursor-pointer text-xs font-bold pr-4"
                    >
                      {thaiMonths.map((m, i) => (
                        <option key={i} value={i} className="text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                          {m}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-1.5 text-zinc-400 pointer-events-none" />
                  </div>

                  {/* Year (พ.ศ.) */}
                  <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-xl shadow-xs px-2.5 py-1 hover:ring-2 hover:ring-emerald-500/20 transition-all border border-zinc-200/60 dark:border-zinc-800">
                    <select
                      value={year}
                      onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value, 10), month, 1))}
                      className="appearance-none bg-transparent outline-none cursor-pointer text-xs font-bold pr-4"
                    >
                      {yearsList.map((y) => (
                        <option key={y} value={y} className="text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                          {y + 543}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-1.5 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 shadow-xs hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 mb-2 gap-1 text-center text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase">
                {daysOfWeek.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected =
                    selectedDate?.getDate() === day &&
                    selectedDate?.getMonth() === month &&
                    selectedDate?.getFullYear() === year;
                  const isToday =
                    new Date().getDate() === day &&
                    new Date().getMonth() === month &&
                    new Date().getFullYear() === year;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDate(day)}
                      className={`flex h-8 w-full items-center justify-center rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105"
                          : isToday
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 font-black"
                            : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons for Date-Only */}
              {!showTime && (
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                  <button
                    type="button"
                    onClick={handleToday}
                    className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition"
                  >
                    วันนี้
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                  >
                    ตกลง
                  </button>
                </div>
              )}
            </div>

            {/* Right side: Time Picker (when showTime is true) */}
            {showTime && (
              <div className="flex flex-col border-t border-zinc-100 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-5 dark:border-zinc-800">
                <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  เวลา (Time)
                </h4>

                <div className="flex gap-2.5 mb-5">
                  {/* Hour */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">ชั่วโมง</span>
                    <button
                      type="button"
                      onClick={incrementHour}
                      className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-base font-bold text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
                      {hour}
                    </div>
                    <button
                      type="button"
                      onClick={decrementHour}
                      className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Minute */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">นาที</span>
                    <button
                      type="button"
                      onClick={incrementMinute}
                      className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-base font-bold text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100">
                      {minute}
                    </div>
                    <button
                      type="button"
                      onClick={decrementMinute}
                      className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* AM/PM */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">AM/PM</span>
                    <button
                      type="button"
                      onClick={toggleAmPm}
                      className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100 cursor-pointer select-none"
                      onClick={toggleAmPm}
                    >
                      {amPm}
                    </div>
                    <button
                      type="button"
                      onClick={toggleAmPm}
                      className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2">
                  <button
                    type="button"
                    onClick={handleToday}
                    className="flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition"
                  >
                    วันนี้
                  </button>
                  <button
                    type="button"
                    onClick={handleDone}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition active:scale-95"
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
