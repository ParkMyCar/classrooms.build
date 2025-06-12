import { useState, useCallback } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
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
  disabled?: boolean;
}

export function Calendar({ 
  onAvailabilityChange,
  startHour = 8,  // Default to 8 AM
  endHour = 16,   // Default to 4 PM
  blockSizeMinutes = 15,  // Default to 15-minute blocks
  showSaturday = false,
  showSunday = false,
  selectedSlots = [],
  currentMode,
  disabled = false
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

  const getSlotMode = (day: number, time: number): SelectionMode | undefined => {
    const slot = selectedSlots.find(slot => slot.day === day && slot.time === time);
    return slot?.mode;
  };

  const handleMouseDown = useCallback((day: number, time: number) => {
    const slotIndex = selectedSlots.findIndex(slot => slot.day === day && slot.time === time);
    const slot = selectedSlots[slotIndex];

    if (slot) {
      if (slot.mode === currentMode) {
        // Deselect if same mode
        onAvailabilityChange?.(selectedSlots.filter(slot => !(slot.day === day && slot.time === time)));
        setIsSelecting(false);
        setIsDeselecting(true);
      } else {
        // Update to new mode and start selecting
        const updatedSlots = [...selectedSlots];
        updatedSlots[slotIndex] = { ...slot, mode: currentMode };
        onAvailabilityChange?.(updatedSlots);
        setIsSelecting(true);
        setIsDeselecting(false);
      }
    } else {
      // Add new slot and start selecting
      onAvailabilityChange?.([...selectedSlots, { day, time, mode: currentMode }]);
      setIsSelecting(true);
      setIsDeselecting(false);
    }
  }, [selectedSlots, onAvailabilityChange, currentMode]);

  const handleMouseEnter = useCallback((day: number, time: number) => {
    if (isSelecting) {
      const slotIndex = selectedSlots.findIndex(slot => slot.day === day && slot.time === time);
      const slot = selectedSlots[slotIndex];
      if (slot) {
        if (slot.mode !== currentMode) {
          const updatedSlots = [...selectedSlots];
          updatedSlots[slotIndex] = { ...slot, mode: currentMode };
          onAvailabilityChange?.(updatedSlots);
        }
      } else {
        onAvailabilityChange?.([...selectedSlots, { day, time, mode: currentMode }]);
      }
    } else if (isDeselecting) {
      onAvailabilityChange?.(selectedSlots.filter(slot => !(slot.day === day && slot.time === time)));
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
    <div className={styles.calendarWrapper} style={{ position: 'relative' }}>
      <div
        className={styles.calendar}
        onMouseUp={disabled ? undefined : handleMouseUp}
        onMouseLeave={disabled ? undefined : handleMouseUp}
        style={{
          gridTemplateColumns: `80px repeat(${days.length}, 1fr)`,
          pointerEvents: disabled ? 'none' : undefined,
          filter: disabled ? 'grayscale(0.7) opacity(0.7)' : undefined,
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
                    slotMode ? styles[slotMode] : styles.unselected
                  }`}
                  data-block-size={blockSizeMinutes}
                  onMouseDown={disabled ? undefined : () => handleMouseDown(dayIndex, time)}
                  onMouseEnter={disabled ? undefined : () => handleMouseEnter(dayIndex, time)}
                />
              );
            })}
          </>
        ))}
      </div>
      {disabled && (
        <div className={styles.disabledOverlay} />
      )}
    </div>
  );
} 