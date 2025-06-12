import { useState, useCallback } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import styles from './Calendar.module.css';

interface TimeSlot {
  day: number;
  time: number;
}

interface CalendarProps {
  onAvailabilityChange?: (slots: TimeSlot[]) => void;
}

export function Calendar({ onAvailabilityChange }: CalendarProps) {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  // Generate time slots from 8 AM to 4 PM
  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 8);
  
  // Generate days of the week
  const today = new Date();
  const weekStart = startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleMouseDown = useCallback((day: number, time: number) => {
    setIsSelecting(true);
    setSelectedSlots([{ day, time }]);
  }, []);

  const handleMouseEnter = useCallback((day: number, time: number) => {
    if (isSelecting) {
      setSelectedSlots(prev => {
        const newSlots = [...prev, { day, time }];
        onAvailabilityChange?.(newSlots);
        return newSlots;
      });
    }
  }, [isSelecting, onAvailabilityChange]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);

  return (
    <div 
      className={styles.calendar}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Empty corner cell */}
      <div className={`${styles.timeSlot} ${styles.timeLabel}`}></div>
      
      {/* Day headers */}
      {days.map(day => (
        <div key={day.toString()} className={styles.dayHeader}>
          {format(day, 'EEE')}
        </div>
      ))}

      {/* Time slots */}
      {timeSlots.map(time => (
        <>
          <div key={`time-${time}`} className={`${styles.timeSlot} ${styles.timeLabel}`}>
            {format(new Date().setHours(time, 0), 'h a')}
          </div>
          {days.map((_, dayIndex) => (
            <div
              key={`${dayIndex}-${time}`}
              className={`${styles.timeSlot} ${styles.available}`}
              onMouseDown={() => handleMouseDown(dayIndex, time)}
              onMouseEnter={() => handleMouseEnter(dayIndex, time)}
            />
          ))}
        </>
      ))}
    </div>
  );
} 