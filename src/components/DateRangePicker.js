'use client';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

function isSameDay(d1, d2) {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

function isDateBefore(d1, d2) {
    if (!d1 || !d2) return false;
    const a = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const b = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return a < b;
}

function isDateBetween(date, start, end) {
    if (!date || !start || !end) return false;
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    return d > s && d < e;
}

function formatDateID(date) {
    if (!date) return '';
    return `${date.getDate()} ${MONTHS_ID[date.getMonth()]} ${date.getFullYear()}`;
}

export default function DateRangePicker({ startDate, endDate, onDateChange, minDate, isDark = true, singleDate = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selecting, setSelecting] = useState('start'); // 'start' or 'end'
    const [tempStart, setTempStart] = useState(startDate ? new Date(startDate) : null);
    const [tempEnd, setTempEnd] = useState(endDate ? new Date(endDate) : null);
    const [hoverDate, setHoverDate] = useState(null);

    const today = minDate ? new Date(minDate) : new Date();
    today.setHours(0, 0, 0, 0);

    const [currentMonth1, setCurrentMonth1] = useState(today.getMonth());
    const [currentYear1, setCurrentYear1] = useState(today.getFullYear());

    // Second calendar is always next month
    const getMonth2 = () => {
        if (currentMonth1 === 11) return 0;
        return currentMonth1 + 1;
    };
    const getYear2 = () => {
        if (currentMonth1 === 11) return currentYear1 + 1;
        return currentYear1;
    };

    const goToPrevMonth = () => {
        if (currentMonth1 === 0) {
            setCurrentMonth1(11);
            setCurrentYear1(currentYear1 - 1);
        } else {
            setCurrentMonth1(currentMonth1 - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth1 === 11) {
            setCurrentMonth1(0);
            setCurrentYear1(currentYear1 + 1);
        } else {
            setCurrentMonth1(currentMonth1 + 1);
        }
    };

    // Can't go before current month of today
    const canGoPrev = () => {
        const minY = today.getFullYear();
        const minM = today.getMonth();
        return currentYear1 > minY || (currentYear1 === minY && currentMonth1 > minM);
    };

    const handleDayClick = (day, month, year) => {
        const clickedDate = new Date(year, month, day);
        clickedDate.setHours(0, 0, 0, 0);

        if (isDateBefore(clickedDate, today)) return;

        if (singleDate) {
            setTempStart(clickedDate);
            setTempEnd(clickedDate);
            const startStr = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`;
            onDateChange(startStr, startStr);
            setIsOpen(false);
            return;
        }

        if (selecting === 'start') {
            setTempStart(clickedDate);
            setTempEnd(null);
            setSelecting('end');
        } else {
            if (isDateBefore(clickedDate, tempStart)) {
                // If clicked date is before start, reset
                setTempStart(clickedDate);
                setTempEnd(null);
                setSelecting('end');
            } else {
                setTempEnd(clickedDate);
                setSelecting('start');
            }
        }
    };

    const handleConfirm = () => {
        if (tempStart && tempEnd) {
            const startStr = `${tempStart.getFullYear()}-${String(tempStart.getMonth() + 1).padStart(2, '0')}-${String(tempStart.getDate()).padStart(2, '0')}`;
            const endStr = `${tempEnd.getFullYear()}-${String(tempEnd.getMonth() + 1).padStart(2, '0')}-${String(tempEnd.getDate()).padStart(2, '0')}`;
            onDateChange(startStr, endStr);
            setIsOpen(false);
        }
    };

    const handleReset = () => {
        setTempStart(null);
        setTempEnd(null);
        setSelecting('start');
        setHoverDate(null);
    };

    // Sync external state when opening
    useEffect(() => {
        if (isOpen) {
            setTempStart(startDate ? new Date(startDate + 'T00:00:00') : null);
            setTempEnd(endDate ? new Date(endDate + 'T00:00:00') : null);
            setSelecting(startDate && !endDate ? 'end' : 'start');
        }
    }, [isOpen]);

    const renderCalendar = (month, year) => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const cells = [];

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="drp-cell drp-cell-empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cellDate = new Date(year, month, day);
            cellDate.setHours(0, 0, 0, 0);

            const isPast = isDateBefore(cellDate, today);
            const isStart = isSameDay(cellDate, tempStart);
            const isEnd = isSameDay(cellDate, tempEnd);
            const isInRange = tempStart && tempEnd && isDateBetween(cellDate, tempStart, tempEnd);
            const isToday = isSameDay(cellDate, new Date());

            // Hover preview: show range preview when selecting end
            const isHoverRange = selecting === 'end' && tempStart && !tempEnd && hoverDate
                && !isDateBefore(hoverDate, tempStart)
                && isDateBetween(cellDate, tempStart, hoverDate);
            const isHoverEnd = selecting === 'end' && tempStart && !tempEnd && hoverDate && isSameDay(cellDate, hoverDate) && !isDateBefore(hoverDate, tempStart);

            let cellClassName = 'drp-cell drp-day';
            if (isPast) cellClassName += ' drp-past';
            if (isStart) cellClassName += ' drp-selected drp-range-start';
            if (isEnd) cellClassName += ' drp-selected drp-range-end';
            if (isInRange) cellClassName += ' drp-in-range';
            if (isHoverRange) cellClassName += ' drp-hover-range';
            if (isHoverEnd) cellClassName += ' drp-hover-end';
            if (isToday && !isStart && !isEnd) cellClassName += ' drp-today';

            cells.push(
                <div
                    key={day}
                    className={cellClassName}
                    onClick={() => !isPast && handleDayClick(day, month, year)}
                    onMouseEnter={() => !isPast && setHoverDate(cellDate)}
                    onMouseLeave={() => setHoverDate(null)}
                >
                    <span className="drp-day-num">{day}</span>
                </div>
            );
        }

        return cells;
    };

    const displayText = startDate
        ? (singleDate ? formatDateID(new Date(startDate + 'T00:00:00')) : (endDate ? `${formatDateID(new Date(startDate + 'T00:00:00'))} — ${formatDateID(new Date(endDate + 'T00:00:00'))}` : 'Pilih Tanggal Sewa'))
        : 'Pilih Tanggal Sewa';

    return (
        <div className={`drp-wrapper${isDark ? '' : ' drp-light'}`}>
            {/* Trigger Button */}
            <div className="drp-field-wrapper">
                <label className="drp-label">{singleDate ? 'Pilih Tanggal Mulai Sewa' : 'Rentang Tanggal Penyewaan'}</label>
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={`drp-trigger ${startDate && endDate ? 'drp-trigger-active' : ''}`}
                >
                    <Calendar className="drp-trigger-icon" />
                    <span className="drp-trigger-text">{displayText}</span>
                    <ChevronRight className="drp-trigger-arrow" />
                </button>
            </div>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="drp-overlay" onClick={() => setIsOpen(false)}>
                    <div
                        className="drp-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="drp-header">
                            <h4 className="drp-header-title">{singleDate ? 'Pilih Tanggal Sewa' : 'Pilih Rentang Tanggal'}</h4>
                            <button
                                type="button"
                                className="drp-close-btn"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Selection Indicator */}
                        <div className="drp-indicator">
                            <div className={`drp-indicator-item ${selecting === 'start' || singleDate ? 'drp-indicator-active' : ''}`}>
                                <span className="drp-indicator-label">Mulai Sewa</span>
                                <span className="drp-indicator-value">
                                    {tempStart ? formatDateID(tempStart) : '—'}
                                </span>
                            </div>
                            {!singleDate && (
                                <>
                                    <div className="drp-indicator-divider">
                                        <ChevronRight className="w-4 h-4 text-[#C5A059]" />
                                    </div>
                                    <div className={`drp-indicator-item ${selecting === 'end' ? 'drp-indicator-active' : ''}`}>
                                        <span className="drp-indicator-label">Selesai Sewa</span>
                                        <span className="drp-indicator-value">
                                            {tempEnd ? formatDateID(tempEnd) : '—'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Calendars Container */}
                        <div className="drp-calendars">
                            {/* Calendar 1 */}
                            <div className="drp-calendar">
                                <div className="drp-month-nav">
                                    <button
                                        type="button"
                                        className="drp-nav-btn"
                                        onClick={goToPrevMonth}
                                        disabled={!canGoPrev()}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="drp-month-label">
                                        {MONTHS_ID[currentMonth1]} {currentYear1}
                                    </span>
                                    <div className="w-8"></div> {/* spacer */}
                                </div>

                                <div className="drp-day-headers">
                                    {DAYS_ID.map(d => (
                                        <div key={d} className="drp-day-header">{d}</div>
                                    ))}
                                </div>

                                <div className="drp-grid">
                                    {renderCalendar(currentMonth1, currentYear1)}
                                </div>
                            </div>

                            {/* Calendar 2 */}
                            <div className="drp-calendar">
                                <div className="drp-month-nav">
                                    <div className="w-8"></div> {/* spacer */}
                                    <span className="drp-month-label">
                                        {MONTHS_ID[getMonth2()]} {getYear2()}
                                    </span>
                                    <button
                                        type="button"
                                        className="drp-nav-btn"
                                        onClick={goToNextMonth}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="drp-day-headers">
                                    {DAYS_ID.map(d => (
                                        <div key={d} className="drp-day-header">{d}</div>
                                    ))}
                                </div>

                                <div className="drp-grid">
                                    {renderCalendar(getMonth2(), getYear2())}
                                </div>
                            </div>
                        </div>

                        {/* Summary & Confirm */}
                        {!singleDate && (
                            <div className="drp-footer">
                                {tempStart && tempEnd && (
                                    <p className="drp-summary">
                                        {formatDateID(tempStart)} — {formatDateID(tempEnd)}
                                    </p>
                                )}
                                <div className="drp-footer-actions">
                                    <button
                                        type="button"
                                        className="drp-reset-btn"
                                        onClick={handleReset}
                                    >
                                        Reset
                                    </button>
                                    <button
                                        type="button"
                                        className={`drp-confirm-btn ${tempStart && tempEnd ? '' : 'drp-confirm-disabled'}`}
                                        onClick={handleConfirm}
                                        disabled={!tempStart || !tempEnd}
                                    >
                                        Selesai
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
