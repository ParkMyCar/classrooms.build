import { useState, useCallback } from 'react';
import { format, addDays, startOfWeek, addMinutes } from 'date-fns';
import styles from './Calendar.module.css';
import { type SelectionMode } from '../SelectionMode/SelectionMode';

interface TimeSlot {
  day: number;
  time: number;  // Now represents minutes since start of day
  mode: SelectionMode;
}

interface CalendarProps {
  onAvailabilityChange?: (slots: TimeSlot[]) => void;
  startHour?: number;  // 24-hour format (0-23)
  endHour?: number;    // 24-hour format (0-23)
  blockSizeMinutes?: number;  // Size of each time block in minutes
  showSaturday?: boolean;
  showSunday?: boolean;
  selectedSlots?: TimeSlot[];
  currentMode: SelectionMode;
}

export function Calendar({ 
  onAvailabilityChange,
  startHour = 8,  // Default to 8 AM
  endHour = 16,   // Default to 4 PM
  blockSizeMinutes = 15,  // Default to 15-minute blocks
  showSaturday = false,
  showSunday = false,
  selectedSlots = [],
  currentMode
}: CalendarProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDeselecting, setIsDeselecting] = useState(false);

  // Validate and adjust time range
  const validStartHour = Math.max(0, Math.min(23, startHour));
  const validEndHour = Math.max(0, Math.min(23, endHour));
  const adjustedEndHour = validEndHour <= validStartHour ? validStartHour + 8 : validEndHour;
  
  // Calculate total minutes in the day range
  const startMinutes = validStartHour * 60;
  const endMinutes = adjustedEndHour * 60;
  const totalMinutes = endMinutes - startMinutes;
  
  // Generate time slots based on block size
  const timeSlots = Array.from(
    { length: Math.ceil(totalMinutes / blockSizeMinutes) },
    (_, i) => startMinutes + (i * blockSizeMinutes)
  );
  
  // Generate days of the week
  const today = new Date();
  const weekStart = startOfWeek(today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    .filter((_, index) => {
      if (index === 0) return showSunday;  // Sunday
      if (index === 6) return showSaturday;  // Saturday
      return true;  // Monday through Friday
    });

  const isSlotSelected = (day: number, time: number) => {
    return selectedSlots.some(slot => slot.day === day && slot.time === time);
  };

  const getSlotMode = (day: number, time: number): SelectionMode | undefined => {
    const slot = selectedSlots.find(slot => slot.day === day && slot.time === time);
    return slot?.mode;
  };

  const handleMouseDown = useCallback((day: number, time: number) => {
    const isSelected = isSlotSelected(day, time);
    setIsSelecting(!isSelected);
    setIsDeselecting(isSelected);
    
    if (isSelected) {
      onAvailabilityChange?.(selectedSlots.filter(slot => !(slot.day === day && slot.time === time)));
    } else {
      onAvailabilityChange?.([...selectedSlots, { day, time, mode: currentMode }]);
    }
  }, [selectedSlots, onAvailabilityChange, currentMode]);

  const handleMouseEnter = useCallback((day: number, time: number) => {
    if (isSelecting || isDeselecting) {
      if (isDeselecting) {
        onAvailabilityChange?.(selectedSlots.filter(slot => !(slot.day === day && slot.time === time)));
      } else {
        if (!isSlotSelected(day, time)) {
          onAvailabilityChange?.([...selectedSlots, { day, time, mode: currentMode }]);
        }
      }
    }
  }, [isSelecting, isDeselecting, selectedSlots, onAvailabilityChange, currentMode]);

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    setIsDeselecting(false);
  }, []);

  // Format time for display
  const formatTime = (minutes: number) => {
    const date = new Date();
    date.setHours(Math.floor(minutes / 60), minutes % 60);
    return format(date, 'h:mm a');
  };

  return (
    <div 
      className={styles.calendar}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        gridTemplateColumns: `80px repeat(${days.length}, 1fr)`
      }}
    >
      {/* Empty corner cell */}
      <div className={`${styles.timeSlot} ${styles.timeLabel}`} data-block-size={blockSizeMinutes}></div>
      
      {/* Day headers */}
      {days.map(day => (
        <div key={day.toString()} className={styles.dayHeader}>
          {format(day, 'EEE')}
        </div>
      ))}

      {/* Time slots */}
      {timeSlots.map(time => (
        <>
          <div 
            key={`time-${time}`} 
            className={`${styles.timeSlot} ${styles.timeLabel}`}
            data-block-size={blockSizeMinutes}
          >
            {formatTime(time)}
          </div>
          {days.map((_, dayIndex) => {
            const slotMode = getSlotMode(dayIndex, time);
            return (
              <div
                key={`${dayIndex}-${time}`}
                className={`${styles.timeSlot} ${
                  slotMode ? styles[slotMode] : styles.available
                }`}
                data-block-size={blockSizeMinutes}
                onMouseDown={() => handleMouseDown(dayIndex, time)}
                onMouseEnter={() => handleMouseEnter(dayIndex, time)}
              />
            );
          })}
        </>
      ))}
    </div>
  );
} 