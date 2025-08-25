'use client';

import { useState, useEffect, useRef, useCallback, JSX } from 'react';
import { motion } from 'framer-motion';

interface HistoryRecord {
  wpm: number;
  timestamp: string;
}

// ตัวอย่างข้อความภาษาไทยสำหรับฝึกพิมพ์
const paragraphs: string[] = [
  "สวัสดีครับ ยินดีต้อนรับสู่เกมทดสอบความเร็วการพิมพ์! เป้าหมายคือการพิมพ์ให้ได้เร็วและแม่นยำที่สุดเท่าที่จะทำได้",
  "การเขียนโปรแกรมไม่ใช่เรื่องยาก ถ้าเราเข้าใจหลักการและฝึกฝนอย่างสม่ำเสมอ มันเป็นทักษะที่สามารถเรียนรู้ได้ด้วยความอดทน",
  "วันหนึ่งในฤดูร้อนที่สดใส ดวงอาทิตย์สาดแสงลงมาบนพื้นดินที่แห้งแล้ง ทำให้เกิดภาพลวงตาที่งดงามบนถนนลาดยาง",
  "ประเทศไทยมีสถานที่ท่องเที่ยวที่หลากหลาย ตั้งแต่ทะเลสวยงามทางภาคใต้ ไปจนถึงภูเขาและธรรมชาติอันเขียวขจีในภาคเหนือ",
  "เทคโนโลยีปัญญาประดิษฐ์กำลังเข้ามามีบทบาทในชีวิตประจำวันของเรามากขึ้นเรื่อยๆ ไม่ว่าจะเป็นในด้านการทำงานหรือการใช้ชีวิตส่วนตัว",
  "การฝึกฝนเป็นประจำคือกุญแจสำคัญสู่ความสำเร็จ การเรียนรู้สิ่งใหม่ๆ ทุกวันจะช่วยพัฒนาตัวเองให้ดียิ่งขึ้นไปอีกขั้น",
  "การวางแผนที่ดีจะช่วยให้การทำงานราบรื่นและมีประสิทธิภาพมากขึ้น การจัดลำดับความสำคัญของงานเป็นสิ่งสำคัญที่ไม่ควรมองข้าม",
];

// ฟังก์ชันสำหรับคำนวณ WPM (Words Per Minute)
const calculateWPM = (typedCharacters: number, seconds: number): number => {
  if (seconds <= 0) return 0;
  const minutes = seconds / 60;
  // โดยทั่วไป 1 คำเท่ากับ 5 ตัวอักษร
  const words = typedCharacters / 5;
  return Math.round(words / minutes);
};

// ฟังก์ชันสำหรับจัดการประวัติการพิมพ์และเรียงลำดับ
const getHistory = (): HistoryRecord[] => {
  if (typeof window !== 'undefined') {
    const history = localStorage.getItem('typingHistory');
    const parsedHistory: HistoryRecord[] = history ? JSON.parse(history) : [];
    // เรียงลำดับจากคะแนนสูงสุดไปต่ำสุด
    return parsedHistory.sort((a, b) => b.wpm - a.wpm);
  }
  return [];
};

const saveHistory = (wpm: number): void => {
  const history: HistoryRecord[] = getHistory();
  history.push({ wpm, timestamp: new Date().toISOString() });
  // เก็บประวัติแค่ 10 ครั้งล่าสุด
  if (history.length > 10) {
    history.shift();
  }
  localStorage.setItem('typingHistory', JSON.stringify(history));
};

export default function TypingTestApp(): JSX.Element {
  const [textToType, setTextToType] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');
  const [status, setStatus] = useState<'ready' | 'countdown' | 'typing' | 'finished'>('ready');
  const [timer, setTimer] = useState<number>(60);
  const [countdown, setCountdown] = useState<number>(3);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerId = useRef<NodeJS.Timeout | null>(null);

  const startTest = (): void => {
    // สุ่มเลือกข้อความ
    const newText = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    setTextToType(newText);
    setTypedText('');
    setTimer(60);
    setWpm(0);
    setAccuracy(0);
    setCountdown(3);
    setStatus('ready');
  };

  const handleStartCountdown = (): void => {
    setStatus('countdown');
    const countdownId = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownId);
          setStatus('typing');
          inputRef.current?.focus();
          startTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startTimer = (): void => {
    if (timerId.current) {
      clearInterval(timerId.current);
    }
    timerId.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerId.current!);
          setStatus('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;

    // จำกัดความยาวของข้อความที่พิมพ์ไม่ให้เกินข้อความต้นฉบับ
    if (value.length > textToType.length) {
      return;
    }

    setTypedText(value);

    let correctCharacters = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === textToType[i]) {
        correctCharacters++;
      }
    }
    const elapsedTime = 60 - timer;
    const currentWPM = calculateWPM(correctCharacters, elapsedTime);
    setWpm(currentWPM);
    setAccuracy(Math.round((correctCharacters / value.length) * 100) || 0);

    // แก้ไข: ตรวจสอบว่าข้อความที่พิมพ์ตรงกับต้นฉบับแบบไม่มีช่องว่างเกิน
    if (value.trim() === textToType) {
      clearInterval(timerId.current!);
      setStatus('finished');
    }

  };

  // ใช้ useEffect เพื่อบันทึกประวัติเมื่อสถานะเกมเปลี่ยนเป็น 'finished'
  useEffect(() => {
    if (status === 'finished') {
      saveHistory(wpm);
      setHistory(getHistory());
    }
  }, [status, wpm]);

  useEffect(() => {
    startTest();
    setHistory(getHistory());

    // Cleanup function: เคลียร์ timer เมื่อ component unmount
    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
      }
    };
  }, []);

  const getCharClassName = (char: string, index: number): string => {
    if (index >= typedText.length) {
      return 'text-gray-400';
    }
    return typedText[index] === char ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 font-mono">
      <div className="container max-w-4xl mx-auto p-8 rounded-lg shadow-2xl bg-gray-800">
        <h1 className="text-4xl font-bold mb-6 text-center text-teal-400">เกมทดสอบความเร็วการพิมพ์</h1>

        {/* ส่วนแสดงผลข้อมูล WPM, ความแม่นยำ และเวลา */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-center">
          <div className="p-4 bg-gray-700 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-400">เวลา</h2>
            <p className="text-3xl font-bold text-yellow-400">{timer}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-400">ความเร็ว (WPM)</h2>
            <p className="text-3xl font-bold text-yellow-400">{wpm}</p>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-400">ความแม่นยำ</h2>
            <p className="text-3xl font-bold text-yellow-400">{accuracy}%</p>
          </div>
        </div>

        {/* ส่วนตัวอย่างข้อความ */}
        <div className="relative text-2xl mb-8 p-6 bg-gray-700 rounded-lg shadow-inner min-h-[150px] overflow-hidden">
          {status === 'countdown' && (
            <motion.div
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center text-8xl font-black text-white bg-gray-900 bg-opacity-70"
            >
              {countdown}
            </motion.div>
          )}
          {textToType.split('').map((char, index) => (
            <span key={index} className={getCharClassName(char, index)}>
              {char}
            </span>
          ))}
        </div>

        {/* ส่วนช่องพิมพ์ */}
        <input
          ref={inputRef}
          type="text"
          value={typedText}
          onChange={handleInputChange}
          disabled={status !== 'typing'}
          className="w-full text-2xl p-4 mb-8 bg-gray-900 text-white rounded-lg border-2 border-gray-600 focus:outline-none focus:border-teal-400"
          placeholder={status === 'typing' ? 'เริ่มพิมพ์ที่นี่...' : 'กด "เริ่ม" เพื่อเริ่ม'}
        />

        {/* ส่วนปุ่มควบคุม */}
        <div className="flex justify-center">
          {status === 'ready' && (
            <button
              onClick={handleStartCountdown}
              className="px-8 py-4 bg-teal-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-teal-600 transition-all duration-300 transform hover:scale-105"
            >
              เริ่ม
            </button>
          )}
          {status === 'finished' && (
            <button
              onClick={startTest}
              className="px-8 py-4 bg-purple-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105"
            >
              ลองอีกครั้ง
            </button>
          )}
        </div>

        {/* ส่วนกราฟประวัติย้อนหลัง */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 text-center text-teal-400">ประวัติความเร็ว (WPM)</h2>
          <div className="flex items-end justify-center h-48 bg-gray-700 rounded-lg p-4 shadow-inner">
            {history.length === 0 && (
              <p className="text-gray-400 text-lg">ยังไม่มีประวัติการพิมพ์</p>
            )}
            {history.map((record, index) => (
              <div
                key={index}
                className="relative mx-1 w-8 bg-teal-500 rounded-t-lg transition-all duration-300"
                style={{ height: `${Math.min(record.wpm, 100) * 1.5 + 20}px` }}
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full text-sm font-semibold text-white">
                  {record.wpm}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
