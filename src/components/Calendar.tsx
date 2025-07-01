"use client"
import { Calendar } from "@heroui/calendar";
import { today, getLocalTimeZone } from "@internationalized/date";

export default function CalendarPage() {
    return (
        <>
            <div className="flex justify-center">
                <Calendar
                    isReadOnly
                    aria-label="Date (Read Only)"
                    value={today(getLocalTimeZone())}
                />
            </div>
        </>
    )
}
