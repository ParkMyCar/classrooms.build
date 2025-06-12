import { useState } from 'react'
import { Calendar } from './components/Calendar/Calendar'
import { SelectionMode, type SelectionMode as SelectionModeType } from './components/SelectionMode/SelectionMode'
import { StudentList } from './components/StudentList/StudentList'
import './App.css'

interface Student {
  id: string;
  name: string;
  attributes: Record<string, string>;
  schedule: { day: number; time: number; mode: SelectionModeType }[];
}

function App() {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [blockSizeMinutes, setBlockSizeMinutes] = useState(15);
  const [showSaturday, setShowSaturday] = useState(false);
  const [showSunday, setShowSunday] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionModeType>('available');

  // Student state
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAttributes, setNewStudentAttributes] = useState<{ key: string; value: string }[]>([]);

  // Calendar state for selected student
  const selectedStudent = students.find(s => s.id === selectedStudentId) || null;

  // Add a new student
  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const attributes: Record<string, string> = {};
    newStudentAttributes.forEach(attr => {
      if (attr.key.trim()) attributes[attr.key] = attr.value;
    });
    const newStudent: Student = {
      id: `${Date.now()}-${Math.random()}`,
      name: newStudentName,
      attributes,
      schedule: [],
    };
    setStudents(prev => [...prev, newStudent]);
    setSelectedStudentId(newStudent.id);
    setNewStudentName('');
    setNewStudentAttributes([]);
  };

  // Update a student's schedule
  const handleAvailabilityChange = (slots: { day: number; time: number; mode: SelectionModeType }[]) => {
    if (!selectedStudent) return;
    setStudents(students =>
      students.map(s =>
        s.id === selectedStudent.id ? { ...s, schedule: slots } : s
      )
    );
  };

  const handleClearAll = () => {
    handleAvailabilityChange([]);
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

      <div className="two-col-layout">
        <div className="left-col">
          <StudentList
            students={students}
            selectedStudentId={selectedStudentId}
            newStudentName={newStudentName}
            setNewStudentName={setNewStudentName}
            onAddStudent={handleAddStudent}
            onSelectStudent={setSelectedStudentId}
            onDeleteStudent={(id) => {
              setStudents(students => students.filter(s => s.id !== id));
              if (selectedStudentId === id) setSelectedStudentId(null);
            }}
            onUpdateStudentAttribute={(studentIdx, attrIdx, key, value) => {
              setStudents(students => students.map((s, i) => {
                if (i !== studentIdx) return s;
                const entries = Object.entries(s.attributes);
                entries[attrIdx][0] = key;
                entries[attrIdx][1] = value;
                const newAttrs: Record<string, string> = {};
                entries.forEach(([k, v]) => { newAttrs[k] = v; });
                return { ...s, attributes: newAttrs };
              }));
            }}
            onRemoveStudentAttribute={(studentIdx, attrIdx) => {
              setStudents(students => students.map((s, i) => {
                if (i !== studentIdx) return s;
                const newAttrs: Record<string, string> = {};
                Object.entries(s.attributes).forEach(([k, v], idx) => {
                  if (idx !== attrIdx) newAttrs[k] = v;
                });
                return { ...s, attributes: newAttrs };
              }));
            }}
            onAddStudentAttribute={(studentIdx) => {
              setStudents(students => students.map((s, i) => {
                if (i !== studentIdx) return s;
                return {
                  ...s,
                  attributes: { ...s.attributes, [""]: "" }
                };
              }));
            }}
          />
        </div>
        <div className="right-col">
          <h2>
            {selectedStudent ? `Schedule for ${selectedStudent.name}` : 'Schedule'}
          </h2>
          {selectedStudent && (
            <>
              <div className="student-attributes-view">
                {Object.entries(selectedStudent.attributes).length === 0 && <div>No attributes.</div>}
                <ul>
                  {Object.entries(selectedStudent.attributes).map(([key, value]) => (
                    <li key={key}><strong>{key}:</strong> {value}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
          <SelectionMode
                currentMode={selectionMode}
                onModeChange={setSelectionMode}
                onClearAll={handleClearAll}
                clearDisabled={students.length === 0 || !selectedStudentId || (selectedStudent ? selectedStudent.schedule.length === 0 : false)}
              />
          <div className="calendar-container">
            <Calendar
              onAvailabilityChange={handleAvailabilityChange}
              startHour={parseInt(startTime.split(':')[0], 10) + parseInt(startTime.split(':')[1], 10) / 60}
              endHour={parseInt(endTime.split(':')[0], 10) + parseInt(endTime.split(':')[1], 10) / 60}
              blockSizeMinutes={blockSizeMinutes}
              showSaturday={showSaturday}
              showSunday={showSunday}
              selectedSlots={selectedStudent ? selectedStudent.schedule : []}
              currentMode={selectionMode}
              disabled={!selectedStudent}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
