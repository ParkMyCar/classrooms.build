import { useState } from "react";
import { Calendar } from "./components/Calendar/Calendar";
import {
  SelectionMode,
  type SelectionMode as SelectionModeType,
} from "./components/SelectionMode/SelectionMode";
import { PeopleList } from "./components/PeopleList/PeopleList";
import "./App.css";

interface Student {
  id: string;
  name: string;
  attributes: Record<string, string>;
  schedule: { day: number; time: number; mode: SelectionModeType }[];
  educatorMeetingRequirements: {
    educatorId: string;
    meetingsPerWeek: number;
    meetingDurationMinutes: number;
  }[];
}

interface Educator {
  id: string;
  name: string;
  attributes: Record<string, string>;
  schedule: { day: number; time: number; mode: SelectionModeType }[];
  subjects: string[];
}

function App() {
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [blockSizeMinutes, setBlockSizeMinutes] = useState(15);
  const [showSaturday, setShowSaturday] = useState(false);
  const [showSunday, setShowSunday] = useState(false);
  const [selectionMode, setSelectionMode] =
    useState<SelectionModeType>("available");

  // Student state
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [newStudentName, setNewStudentName] = useState("");

  interface RequiredAttribute {
    name: string;
    values: string[] | null; // null means free-form text
  }
  const [requiredStudentAttributes, setRequiredStudentAttributes] = useState<
    RequiredAttribute[]
  >([]);

  // Educator state
  const [educators, setEducators] = useState<Educator[]>([]);
  const [selectedEducatorId, setSelectedEducatorId] = useState<string | null>(
    null
  );
  const [newEducatorName, setNewEducatorName] = useState("");
  const [newEducatorAttributes, setNewEducatorAttributes] = useState<
    { key: string; value: string }[]
  >([]);

  // Calendar state for selected student/educator
  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || null;
  const selectedEducator =
    educators.find((e) => e.id === selectedEducatorId) || null;
  const selectedEntity = selectedStudent || selectedEducator;

  const handleStudentSelect = (id: string | null) => {
    setSelectedStudentId(id);
    setSelectedEducatorId(null); // Deselect educator when selecting student
  };

  const handleEducatorSelect = (id: string | null) => {
    setSelectedEducatorId(id);
    setSelectedStudentId(null); // Deselect student when selecting educator
  };

  const handleAddRequiredAttribute = (
    name: string,
    values: string[] | null
  ) => {
    if (!requiredStudentAttributes.some((attr) => attr.name === name)) {
      setRequiredStudentAttributes((prev) => [...prev, { name, values }]);
    }
  };

  const handleRemoveRequiredAttribute = (name: string) => {
    setRequiredStudentAttributes((prev) =>
      prev.filter((attr) => attr.name !== name)
    );
  };

  const handleUpdateRequiredAttributeValues = (
    name: string,
    values: string[] | null
  ) => {
    setRequiredStudentAttributes((prev) =>
      prev.map((attr) => (attr.name === name ? { ...attr, values } : attr))
    );
  };

  // Add a new student
  const handleAddStudent = (
    attributes: Record<string, string>,
    educatorRequirements: {
      educatorId: string;
      meetingsPerWeek: number;
      meetingDurationMinutes: number;
    }[],
    schedule?: { day: number; time: number; mode: SelectionModeType }[]
  ) => {
    if (!newStudentName.trim()) return;

    // Check if all required attributes are present and valid
    const missingRequired = requiredStudentAttributes.filter((required) => {
      const value = attributes[required.name];
      if (!value) return true;
      if (required.values && !required.values.includes(value)) return true;
      return false;
    });

    if (missingRequired.length > 0) {
      const missingNames = missingRequired.map((r) => r.name).join(", ");
      const invalidValues = missingRequired
        .filter(
          (r) =>
            r.values &&
            attributes[r.name] &&
            !r.values.includes(attributes[r.name])
        )
        .map((r) => `${r.name} (must be one of: ${r.values?.join(", ")})`)
        .join(", ");

      let message = `Please fill in all required attributes: ${missingNames}`;
      if (invalidValues) {
        message += `\nInvalid values for: ${invalidValues}`;
      }
      alert(message);
      return;
    }

    // Check if at least one educator requirement is specified
    if (educatorRequirements.length === 0) {
      alert("Please specify at least one educator meeting requirement.");
      return;
    }

    // Check if all educator requirements are valid
    const invalidEducatorReqs = educatorRequirements.filter(
      (req) =>
        !req.educatorId ||
        req.meetingsPerWeek < 1 ||
        req.meetingDurationMinutes < 5
    );
    if (invalidEducatorReqs.length > 0) {
      alert("Please fill in all educator requirement fields correctly.");
      return;
    }

    const newStudent: Student = {
      id: `${Date.now()}-${Math.random()}`,
      name: newStudentName,
      attributes,
      schedule: schedule || [],
      educatorMeetingRequirements: educatorRequirements,
    };
    setStudents((prev) => [...prev, newStudent]);
    setSelectedStudentId(newStudent.id);
    setNewStudentName("");
  };

  const handleAddEducatorRequirement = (
    studentId: string,
    requirement: {
      educatorId: string;
      meetingsPerWeek: number;
      meetingDurationMinutes: number;
    }
  ) => {
    setStudents((students) =>
      students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              educatorMeetingRequirements: [
                ...student.educatorMeetingRequirements,
                requirement,
              ],
            }
          : student
      )
    );
  };

  const handleRemoveEducatorRequirement = (
    studentId: string,
    educatorId: string
  ) => {
    setStudents((students) =>
      students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              educatorMeetingRequirements:
                student.educatorMeetingRequirements.filter(
                  (req) => req.educatorId !== educatorId
                ),
            }
          : student
      )
    );
  };

  // Add a new educator
  const handleAddEducator = () => {
    if (!newEducatorName.trim()) return;
    const attributes: Record<string, string> = {};
    newEducatorAttributes.forEach((attr) => {
      if (attr.key.trim()) attributes[attr.key] = attr.value;
    });
    const newEducator: Educator = {
      id: `${Date.now()}-${Math.random()}`,
      name: newEducatorName,
      attributes,
      schedule: [],
      subjects: [],
    };
    setEducators((prev) => [...prev, newEducator]);
    setSelectedEducatorId(newEducator.id);
    setNewEducatorName("");
    setNewEducatorAttributes([]);
  };

  // Update schedule
  const handleAvailabilityChange = (
    slots: { day: number; time: number; mode: SelectionModeType }[]
  ) => {
    if (!selectedEntity) return;
    
    if (selectedStudentId) {
      setStudents((students) =>
        students.map((s) =>
          s.id === selectedStudentId ? { ...s, schedule: slots } : s
        )
      );
    } else if (selectedEducatorId) {
      setEducators((educators) =>
        educators.map((e) =>
          e.id === selectedEducatorId ? { ...e, schedule: slots } : e
        )
      );
    }
  };

  const handleClearAll = () => {
    handleAvailabilityChange([]);
  };

  const handleGenerateSchedule = () => {
    console.log("Student Requirements and Availability:");
    students.forEach(student => {
      console.log(`Student: ${student.name}`);
      console.log("Attributes:", student.attributes);
      console.log("Educator Meeting Requirements:", student.educatorMeetingRequirements);
      console.log("Availability:", student.schedule);
      console.log("---");
    });

    console.log("\nEducator Availability:");
    educators.forEach(educator => {
      console.log(`Educator: ${educator.name}`);
      console.log("Attributes:", educator.attributes);
      console.log("Subjects:", educator.subjects);
      console.log("Availability:", educator.schedule);
      console.log("---");
    });
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
        <button 
          className="generate-schedule-btn"
          onClick={handleGenerateSchedule}
          disabled={students.length === 0 || educators.length === 0}
        >
          Generate Schedule
        </button>
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
              onSelect: handleStudentSelect,
              onDelete: (id) => {
                setStudents((students) => students.filter((s) => s.id !== id));
                if (selectedStudentId === id) setSelectedStudentId(null);
              },
              onUpdateAttribute: (studentIdx, attrIdx, key, value) => {
                setStudents((students) =>
                  students.map((s, i) => {
                    if (i !== studentIdx) return s;
                    const entries = Object.entries(s.attributes);
                    entries[attrIdx][0] = key;
                    entries[attrIdx][1] = value;
                    const newAttrs: Record<string, string> = {};
                    entries.forEach(([k, v]) => {
                      newAttrs[k] = v;
                    });
                    return { ...s, attributes: newAttrs };
                  })
                );
              },
              onRemoveAttribute: (studentIdx, attrIdx) => {
                setStudents((students) =>
                  students.map((s, i) => {
                    if (i !== studentIdx) return s;
                    const newAttrs: Record<string, string> = {};
                    Object.entries(s.attributes).forEach(([k, v], idx) => {
                      if (idx !== attrIdx) newAttrs[k] = v;
                    });
                    return { ...s, attributes: newAttrs };
                  })
                );
              },
              onAddAttribute: (studentIdx) => {
                setStudents((students) =>
                  students.map((s, i) => {
                    if (i !== studentIdx) return s;
                    return {
                      ...s,
                      attributes: { ...s.attributes, [""]: "" },
                    };
                  })
                );
              },
              onAddRequiredAttribute: handleAddRequiredAttribute,
              onRemoveRequiredAttribute: handleRemoveRequiredAttribute,
              onUpdateRequiredAttributeValues:
                handleUpdateRequiredAttributeValues,
              educators: educators.map((e) => ({ id: e.id, name: e.name })),
              onAddEducatorRequirement: handleAddEducatorRequirement,
              onRemoveEducatorRequirement: handleRemoveEducatorRequirement,
            }}
            educators={{
              list: educators,
              selectedId: selectedEducatorId,
              newName: newEducatorName,
              setNewName: setNewEducatorName,
              onAdd: handleAddEducator,
              onSelect: handleEducatorSelect,
              onDelete: (id) => {
                setEducators((educators) =>
                  educators.filter((e) => e.id !== id)
                );
                if (selectedEducatorId === id) setSelectedEducatorId(null);
              },
            }}
          />
        </div>
        <div className="right-col">
          <h2>
            {selectedEntity
              ? `Schedule for ${selectedEntity.name}`
              : "Schedule"}
          </h2>
          <SelectionMode
            currentMode={selectionMode}
            onModeChange={setSelectionMode}
            onClearAll={handleClearAll}
            clearDisabled={
              !selectedEntity || selectedEntity.schedule.length === 0
            }
          />
          <div className="calendar-container">
            <Calendar
              onAvailabilityChange={handleAvailabilityChange}
              startHour={
                parseInt(startTime.split(":")[0], 10) +
                parseInt(startTime.split(":")[1], 10) / 60
              }
              endHour={
                parseInt(endTime.split(":")[0], 10) +
                parseInt(endTime.split(":")[1], 10) / 60
              }
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
  );
}

export default App;
