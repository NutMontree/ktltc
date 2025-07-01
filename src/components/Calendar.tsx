"use client"
import React from 'react';
import { Calendar, theme } from 'antd';
import type { CalendarProps } from 'antd';
import type { Dayjs } from 'dayjs';

const onPanelChange = (value: Dayjs, mode: CalendarProps<Dayjs>['mode']) => {
    console.log(value.format('YYYY-MM-DD'), mode);
};

export default function CalendarPage() {
    const { token } = theme.useToken();

    const wrapperStyle: React.CSSProperties = {
        width: 300,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
    };
    return (
        <>
            <div className="flex justify-center">
                <div style={wrapperStyle}>
                    <Calendar fullscreen={false} onPanelChange={onPanelChange} />
                </div>
            </div>
        </>
    )
}
