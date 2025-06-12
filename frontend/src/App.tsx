import { useState } from 'react'
import { Calendar } from './components/Calendar/Calendar'
import { SelectionMode, type SelectionMode as SelectionModeType } from './components/SelectionMode/SelectionMode'
import { PeopleList } from './components/PeopleList/PeopleList'
import './App.css'

interface Student {
  id: string;
  name: string;
  attributes: Record<string, string>;
  schedule: { day: number; time: number; mode: SelectionModeType }[];
}

interface Educator {
  id: string;
  name: string;
  attributes: Record<string, string>;
  schedule: { day: number; time: number; mode: SelectionModeType }[];
  subjects: string[];
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
  
  interface RequiredAttribute {
    name: string;
    values: string[] | null; // null means free-form text
  }
  const [requiredStudentAttributes, setRequiredStudentAttributes] = useState<RequiredAttribute[]>([]);

  // Educator state
  const [educators, setEducators] = useState<Educator[]>([]);
  const [selectedEducatorId, setSelectedEducatorId] = useState<string | null>(null);
  const [newEducatorName, setNewEducatorName] = useState('');
  const [newEducatorAttributes, setNewEducatorAttributes] = useState<{ key: string; value: string }[]>([]);

  // Calendar state for selected student/educator
  const selectedStudent = students.find(s => s.id === selectedStudentId) || null;
  const selectedEducator = educators.find(e => e.id === selectedEducatorId) || null;
  const selectedEntity = selectedStudent || selectedEducator;

  const handleAddRequiredAttribute = (name: string, values: string[] | null) => {
    if (!requiredStudentAttributes.some(attr => attr.name === name)) {
      setRequiredStudentAttributes(prev => [...prev, { name, values }]);
    }
  };

  const handleRemoveRequiredAttribute = (name: string) => {
    setRequiredStudentAttributes(prev => prev.filter(attr => attr.name !== name));
  };

  const handleUpdateRequiredAttributeValues = (name: string, values: string[] | null) => {
    setRequiredStudentAttributes(prev => 
      prev.map(attr => attr.name === name ? { ...attr, values } : attr)
    );
  };

  // Add a new student
  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const attributes: Record<string, string> = {};
    newStudentAttributes.forEach(attr => {
      if (attr.key.trim()) attributes[attr.key] = attr.value;
    });
    
    // Check if all required attributes are present and valid
    const missingRequired = requiredStudentAttributes.filter(required => {
      const value = attributes[required.name];
      if (!value) return true;
      if (required.values && !required.values.includes(value)) return true;
      return false;
    });
    
    if (missingRequired.length > 0) {
      const missingNames = missingRequired.map(r => r.name).join(', ');
      const invalidValues = missingRequired
        .filter(r => r.values && attributes[r.name] && !r.values.includes(attributes[r.name]))
        .map(r => `${r.name} (must be one of: ${r.values?.join(', ')})`)
        .join(', ');
      
      let message = `Please fill in all required attributes: ${missingNames}`;
      if (invalidValues) {
        message += `\nInvalid values for: ${invalidValues}`;
      }
      alert(message);
      return;
    }

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

  // Add a new educator
  const handleAddEducator = () => {
    if (!newEducatorName.trim()) return;
    const attributes: Record<string, string> = {};
    newEducatorAttributes.forEach(attr => {
      if (attr.key.trim()) attributes[attr.key] = attr.value;
    });
    const newEducator: Educator = {
      id: `${Date.now()}-${Math.random()}`,
      name: newEducatorName,
      attributes,
      schedule: [],
      subjects: [],
    };
    setEducators(prev => [...prev, newEducator]);
    setSelectedEducatorId(newEducator.id);
    setNewEducatorName('');
    setNewEducatorAttributes([]);
  };

  // Update schedule
  const handleAvailabilityChange = (slots: { day: number; time: number; mode: SelectionModeType }[]) => {
    if (!selectedEntity) return;
    if (selectedStudent) {
      setStudents(students =>
        students.map(s =>
          s.id === selectedStudent.id ? { ...s, schedule: slots } : s
        )
      );
    } else if (selectedEducator) {
      setEducators(educators =>
        educators.map(e =>
          e.id === selectedEducator.id ? { ...e, schedule: slots } : e
        )
      );
    }
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
          <PeopleList
            students={{
              list: students,
              requiredAttributes: requiredStudentAttributes,
              selectedId: selectedStudentId,
              newName: newStudentName,
              setNewName: setNewStudentName,
              onAdd: handleAddStudent,
              onSelect: setSelectedStudentId,
              onDelete: (id) => {
                setStudents(students => students.filter(s => s.id !== id));
                if (selectedStudentId === id) setSelectedStudentId(null);
              },
              onUpdateAttribute: (studentIdx, attrIdx, key, value) => {
                setStudents(students => students.map((s, i) => {
                  if (i !== studentIdx) return s;
                  const entries = Object.entries(s.attributes);
                  entries[attrIdx][0] = key;
                  entries[attrIdx][1] = value;
                  const newAttrs: Record<string, string> = {};
                  entries.forEach(([k, v]) => { newAttrs[k] = v; });
                  return { ...s, attributes: newAttrs };
                }));
              },
              onRemoveAttribute: (studentIdx, attrIdx) => {
                setStudents(students => students.map((s, i) => {
                  if (i !== studentIdx) return s;
                  const newAttrs: Record<string, string> = {};
                  Object.entries(s.attributes).forEach(([k, v], idx) => {
                    if (idx !== attrIdx) newAttrs[k] = v;
                  });
                  return { ...s, attributes: newAttrs };
                }));
              },
              onAddAttribute: (studentIdx) => {
                setStudents(students => students.map((s, i) => {
                  if (i !== studentIdx) return s;
                  return {
                    ...s,
                    attributes: { ...s.attributes, [""]: "" }
                  };
                }));
              },
              onAddRequiredAttribute: handleAddRequiredAttribute,
              onRemoveRequiredAttribute: handleRemoveRequiredAttribute,
              onUpdateRequiredAttributeValues: handleUpdateRequiredAttributeValues,
            }}
            educators={{
              list: educators,
              selectedId: selectedEducatorId,
              newName: newEducatorName,
              setNewName: setNewEducatorName,
              onAdd: handleAddEducator,
              onSelect: setSelectedEducatorId,
              onDelete: (id) => {
                setEducators(educators => educators.filter(e => e.id !== id));
                if (selectedEducatorId === id) setSelectedEducatorId(null);
              },
              onUpdateAttribute: (educatorIdx, attrIdx, key, value) => {
                setEducators(educators => educators.map((e, i) => {
                  if (i !== educatorIdx) return e;
                  const entries = Object.entries(e.attributes);
                  entries[attrIdx][0] = key;
                  entries[attrIdx][1] = value;
                  const newAttrs: Record<string, string> = {};
                  entries.forEach(([k, v]) => { newAttrs[k] = v; });
                  return { ...e, attributes: newAttrs };
                }));
              },
              onRemoveAttribute: (educatorIdx, attrIdx) => {
                setEducators(educators => educators.map((e, i) => {
                  if (i !== educatorIdx) return e;
                  const newAttrs: Record<string, string> = {};
                  Object.entries(e.attributes).forEach(([k, v], idx) => {
                    if (idx !== attrIdx) newAttrs[k] = v;
                  });
                  return { ...e, attributes: newAttrs };
                }));
              },
              onAddAttribute: (educatorIdx) => {
                setEducators(educators => educators.map((e, i) => {
                  if (i !== educatorIdx) return e;
                  return {
                    ...e,
                    attributes: { ...e.attributes, [""]: "" }
                  };
                }));
              },
            }}
          />
        </div>
        <div className="right-col">
          <h2>
            {selectedEntity ? `Schedule for ${selectedEntity.name}` : 'Schedule'}
          </h2>
          {selectedEntity && (
            <>
              <div className="student-attributes-view">
                {Object.entries(selectedEntity.attributes).length === 0 && <div>No attributes.</div>}
                <ul>
                  {Object.entries(selectedEntity.attributes).map(([key, value]) => (
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
            clearDisabled={!selectedEntity || selectedEntity.schedule.length === 0}
          />
          <div className="calendar-container">
            <Calendar
              onAvailabilityChange={handleAvailabilityChange}
              startHour={parseInt(startTime.split(':')[0], 10) + parseInt(startTime.split(':')[1], 10) / 60}
              endHour={parseInt(endTime.split(':')[0], 10) + parseInt(endTime.split(':')[1], 10) / 60}
              blockSizeMinutes={blockSizeMinutes}
              showSaturday={showSaturday}
              showSunday={showSunday}
              selectedSlots={selectedEntity ? selectedEntity.schedule : []}
              currentMode={selectionMode}
              disabled={!selectedEntity}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
