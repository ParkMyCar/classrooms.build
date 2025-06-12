import { useState } from 'react'
import { Calendar } from './components/Calendar/Calendar'
import { SelectionMode, type SelectionMode as SelectionModeType } from './components/SelectionMode/SelectionMode'
import './App.css'

function App() {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [blockSizeMinutes, setBlockSizeMinutes] = useState(15);
  const [showSaturday, setShowSaturday] = useState(false);
  const [showSunday, setShowSunday] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<{ day: number; time: number; mode: SelectionModeType }[]>([]);
  const [selectionMode, setSelectionMode] = useState<SelectionModeType>('available');

  // Convert time string (HH:mm) to hour number
  const timeToHour = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + (minutes / 60);
  };

  const handleAvailabilityChange = (slots: { day: number; time: number; mode: SelectionModeType }[]) => {
    setSelectedSlots(slots);
  };

  const handleClearAll = () => {
    setSelectedSlots([]);
  };

  return (
    <div className="app">
      <h1>classrooms.build</h1>
      
      <div className="controls">
        <div className="time-input">
          <label htmlFor="startTime">Start Time:</label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="time-input">
          <label htmlFor="endTime">End Time:</label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <div className="time-input">
          <label htmlFor="blockSize">Block Size:</label>
          <select
            id="blockSize"
            value={blockSizeMinutes}
            onChange={(e) => setBlockSizeMinutes(Number(e.target.value))}
          >
            <option value="5">5 min</option>
            <option value="10">10 min</option>
            <option value="15">15 min</option>
            <option value="20">20 min</option>
            <option value="30">30 min</option>
            <option value="60">60 min</option>
          </select>
        </div>
        <div className="weekend-toggles">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showSunday}
              onChange={(e) => setShowSunday(e.target.checked)}
            />
            Sunday
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showSaturday}
              onChange={(e) => setShowSaturday(e.target.checked)}
            />
            Saturday
          </label>
        </div>
      </div>

      <SelectionMode
        currentMode={selectionMode}
        onModeChange={setSelectionMode}
        onClearAll={handleClearAll}
        clearDisabled={selectedSlots.length === 0}
      />

      <div className="calendar-container">
        <Calendar 
          onAvailabilityChange={handleAvailabilityChange}
          startHour={timeToHour(startTime)}
          endHour={timeToHour(endTime)}
          blockSizeMinutes={blockSizeMinutes}
          showSaturday={showSaturday}
          showSunday={showSunday}
          selectedSlots={selectedSlots}
          currentMode={selectionMode}
        />
      </div>
    </div>
  )
}

export default App
