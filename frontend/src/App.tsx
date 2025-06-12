import { useState } from 'react'
import { Calendar } from './components/Calendar/Calendar'
import './App.css'

function App() {
  const [startHour, setStartHour] = useState(8);
  const [endHour, setEndHour] = useState(16);

  const handleAvailabilityChange = (slots: { day: number; time: number }[]) => {
    console.log('Selected time slots:', slots);
  };

  return (
    <div className="app">
      <h1>Speech Therapy Schedule Builder</h1>
      
      <div className="time-controls">
        <div className="time-input">
          <label htmlFor="startHour">Start Time:</label>
          <input
            type="number"
            id="startHour"
            min="0"
            max="23"
            value={startHour}
            onChange={(e) => setStartHour(Number(e.target.value))}
          />
        </div>
        <div className="time-input">
          <label htmlFor="endHour">End Time:</label>
          <input
            type="number"
            id="endHour"
            min="0"
            max="23"
            value={endHour}
            onChange={(e) => setEndHour(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="calendar-container">
        <Calendar 
          onAvailabilityChange={handleAvailabilityChange}
          startHour={startHour}
          endHour={endHour}
        />
      </div>
    </div>
  )
}

export default App
