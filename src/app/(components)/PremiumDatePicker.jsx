"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Clock, ChevronUp, ChevronDown } from "lucide-react";

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

export default function PremiumDatePicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [amPm, setAmPm] = useState("AM");
  const popupRef = useRef(null);

  // Initialize selected date from value
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-").map(Number);
      const d = new Date(year, month - 1, day);
      setSelectedDate(d);
      setCurrentDate(d);
    } else {
      setSelectedDate(null);
      setCurrentDate(new Date());
    }
  }, [value]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handleSelectDate = (day) => {
    const newDate = new Date(year, month, day);
    setSelectedDate(newDate);
    // Don't close immediately, wait for Done button
  };

  const handleDone = () => {
    if (selectedDate) {
      const yy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(selectedDate.getDate()).padStart(2, "0");
      // Note: we are passing only the date back to the form, but keeping time in local state for UI
      onChange(`${yy}-${mm}-${dd}`);
    }
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(today);
    setHour(String(today.getHours() % 12 || 12).padStart(2, "0"));
    setMinute(String(today.getMinutes()).padStart(2, "0"));
    setAmPm(today.getHours() >= 12 ? "PM" : "AM");
  };

  const formatDateToThai = (dateObj) => {
    if (!dateObj) return "เลือกวันที่";
    const d = dateObj.getDate();
    const m = thaiMonths[dateObj.getMonth()];
    const y = dateObj.getFullYear() + (dateObj.getFullYear() < 2500 ? 543 : 0);
    return `${d} ${m} ${y}`;
  };

  const currentY = new Date().getFullYear();
  const yearsList = Array.from({ length: 16 }, (_, i) => currentY - 10 + i);

  // Time controls
  const incrementHour = () => setHour((h) => String((parseInt(h) % 12) + 1).padStart(2, "0"));
  const decrementHour = () =>
    setHour((h) => String(((parseInt(h) - 2 + 12) % 12) + 1).padStart(2, "0"));
  const incrementMinute = () => setMinute((m) => String((parseInt(m) + 1) % 60).padStart(2, "0"));
  const decrementMinute = () =>
    setMinute((m) => String((parseInt(m) - 1 + 60) % 60).padStart(2, "0"));
  const toggleAmPm = () => setAmPm((a) => (a === "AM" ? "PM" : "AM"));

  return (
    <div className="relative w-full" ref={popupRef}>
      {/* Premium Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-2xl border-[1.5px] border-primary/40 bg-white/50 px-5 py-3.5 text-base font-semibold text-gray-700 shadow-sm backdrop-blur-md outline-none transition hover:border-primary hover:shadow-md focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-strokedark dark:bg-meta-4/50 dark:text-gray-200"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Calendar className="w-5 h-5" />
            <span className="text-gray-700 dark:text-gray-200">
              {formatDateToThai(selectedDate)}
            </span>
          </div>
          <div className="h-5 w-px bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2 text-primary">
            <Clock className="w-5 h-5" />
            <span className="text-gray-700 dark:text-gray-200">
              {hour} : {minute} {amPm}
            </span>
          </div>
        </div>
        <Calendar className="w-5 h-5 text-gray-400" />
      </button>

      {/* Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-9999 mt-3 flex flex-col md:flex-row gap-6 rounded-4xl bg-white p-6 shadow-[0_20px_60px_-15px_rgba(100,116,139,0.2)] ring-1 ring-gray-100 dark:bg-boxdark dark:ring-white/10 dark:shadow-none min-w-[340px] md:min-w-[540px]"
          >
            {/* Left side: Calendar */}
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 bg-gray-50/80 dark:bg-meta-4/50 p-2 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm transition hover:bg-primary hover:text-white dark:bg-boxdark dark:text-gray-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex gap-2 font-bold text-gray-700 dark:text-gray-200">
                  <div className="relative flex items-center bg-white dark:bg-boxdark rounded-xl shadow-sm px-3 py-1.5 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                    <select
                      value={month}
                      onChange={(e) => setCurrentDate(new Date(year, parseInt(e.target.value), 1))}
                      className="appearance-none bg-transparent outline-none cursor-pointer text-sm pr-4 font-semibold"
                    >
                      {thaiMonths.map((m, i) => (
                        <option key={i} value={i} className="text-gray-800">
                          {m}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative flex items-center bg-white dark:bg-boxdark rounded-xl shadow-sm px-3 py-1.5 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                    <select
                      value={year}
                      onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), month, 1))}
                      className="appearance-none bg-transparent outline-none cursor-pointer text-sm pr-4 font-semibold"
                    >
                      {yearsList.map((y) => (
                        <option key={y} value={y} className="text-gray-800">
                          {y + 543}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm transition hover:bg-primary hover:text-white dark:bg-boxdark dark:text-gray-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 mb-3 gap-1">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[11px] font-bold uppercase text-gray-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5">
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
                      className={`flex h-9 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all
                        ${
                          isSelected
                            ? "bg-primary text-white shadow-lg shadow-primary/40 ring-2 ring-primary/20 scale-105"
                            : isToday
                              ? "bg-primary/10 text-primary hover:bg-primary/20"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-meta-4"
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: Time */}
            <div className="flex flex-col border-t border-gray-100 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6 dark:border-strokedark">
              <h4 className="text-sm font-black text-gray-800 dark:text-white mb-4">เวลา (Time)</h4>

              <div className="flex gap-3 mb-6">
                {/* Hour */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Hour
                  </span>
                  <button
                    type="button"
                    onClick={incrementHour}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 dark:hover:bg-meta-4 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-gray-100 bg-gray-50 text-lg font-bold text-gray-800 dark:bg-meta-4 dark:border-strokedark dark:text-white">
                    {hour}
                  </div>
                  <button
                    type="button"
                    onClick={decrementHour}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 dark:hover:bg-meta-4 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Minute */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Minute
                  </span>
                  <button
                    type="button"
                    onClick={incrementMinute}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 dark:hover:bg-meta-4 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-gray-100 bg-gray-50 text-lg font-bold text-gray-800 dark:bg-meta-4 dark:border-strokedark dark:text-white">
                    {minute}
                  </div>
                  <button
                    type="button"
                    onClick={decrementMinute}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 dark:hover:bg-meta-4 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* AM/PM */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    AM / PM
                  </span>
                  <button
                    type="button"
                    onClick={toggleAmPm}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 dark:hover:bg-meta-4 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-gray-100 bg-gray-50 text-lg font-bold text-gray-800 dark:bg-meta-4 dark:border-strokedark dark:text-white cursor-pointer select-none"
                    onClick={toggleAmPm}
                  >
                    {amPm}
                  </div>
                  <button
                    type="button"
                    onClick={toggleAmPm}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 dark:hover:bg-meta-4 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto flex gap-3">
                <button
                  type="button"
                  onClick={handleToday}
                  className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-200 hover:text-gray-900 dark:bg-meta-4 dark:text-gray-300 dark:hover:bg-strokedark"
                >
                  วันนี้
                </button>
                <button
                  type="button"
                  onClick={handleDone}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-opacity-90 active:scale-95"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
