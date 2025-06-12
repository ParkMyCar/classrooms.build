import { Calendar } from './components/Calendar/Calendar'
import './App.css'

function App() {
  const handleAvailabilityChange = (slots: { day: number; time: number }[]) => {
    console.log('Selected time slots:', slots);
  };

  return (
    <div className="app">
      <h1>Speech Therapy Schedule Builder</h1>
      <div className="calendar-container">
        <Calendar onAvailabilityChange={handleAvailabilityChange} />
      </div>
    </div>
  )
}

export default App
