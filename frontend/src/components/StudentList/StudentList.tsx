import React from 'react';
import styles from './StudentList.module.css';

interface Student {
  id: string;
  name: string;
  attributes: Record<string, string>;
  schedule: { day: number; time: number; mode: string }[];
}

interface StudentListProps {
  students: Student[];
  selectedStudentId: string | null;
  newStudentName: string;
  setNewStudentName: (name: string) => void;
  onAddStudent: () => void;
  onSelectStudent: (id: string) => void;
  onDeleteStudent: (id: string) => void;
  onUpdateStudentAttribute: (studentIdx: number, attrIdx: number, key: string, value: string) => void;
  onRemoveStudentAttribute: (studentIdx: number, attrIdx: number) => void;
  onAddStudentAttribute: (studentIdx: number) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  selectedStudentId,
  newStudentName,
  setNewStudentName,
  onAddStudent,
  onSelectStudent,
  onDeleteStudent,
  onUpdateStudentAttribute,
  onRemoveStudentAttribute,
  onAddStudentAttribute,
}) => {
  return (
    <div className={styles['student-card']}>
      <h3>Students</h3>
      <ul className={styles['student-list-ul']}>
        <li className={styles['add-student-list-item']}>
          <div className={styles['student-group-box'] + ' ' + styles['add-student-group-box']}>
            <form
              className={styles['add-student-form']}
              onSubmit={e => {
                e.preventDefault();
                onAddStudent();
              }}
            >
              <input
                type="text"
                placeholder="Student Name"
                value={newStudentName}
                onChange={e => setNewStudentName(e.target.value)}
                style={{ marginRight: 8 }}
              />
              <button type="submit" className={styles['add-student-btn']}>+</button>
            </form>
          </div>
        </li>
        {students.map((student, studentIdx) => (
          <li key={student.id} className={styles['student-list-item']}>
            <div
              className={
                styles['student-group-box'] +
                (student.id === selectedStudentId ? ' ' + styles['selected'] : '')
              }
              onClick={() => onSelectStudent(student.id)}
              style={{ cursor: 'pointer', position: 'relative' }}
              data-student-id={student.id}
            >
              <button
                className={styles['delete-student-btn']}
                type="button"
                title="Delete student"
                onClick={e => {
                  e.stopPropagation();
                  onDeleteStudent(student.id);
                }}
                style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 7.5V14.5M10 7.5V14.5M13.5 7.5V14.5M3 5.5H17M8.5 3.5H11.5C12.0523 3.5 12.5 3.94772 12.5 4.5V5.5H7.5V4.5C7.5 3.94772 7.94772 3.5 8.5 3.5Z" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className={styles['student-name']}>{student.name}</span>
              <ul className={styles['student-attr-list']}>
                {Object.entries(student.attributes).map(([key, value], attrIdx) => (
                  <li key={key} className={styles['student-attr-list-item']}>
                    <input
                      className={styles['student-attr-key-input']}
                      type="text"
                      value={key}
                      onChange={e => {
                        onUpdateStudentAttribute(studentIdx, attrIdx, e.target.value, value);
                      }}
                      placeholder="Key"
                    />
                    <input
                      className={styles['student-attr-value-input']}
                      type="text"
                      value={value}
                      onChange={e => {
                        onUpdateStudentAttribute(studentIdx, attrIdx, key, e.target.value);
                      }}
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      className={styles['remove-attr-btn']}
                      onClick={() => onRemoveStudentAttribute(studentIdx, attrIdx)}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={styles['add-attr-btn']}
                onClick={() => onAddStudentAttribute(studentIdx)}
              >
                + Attribute
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}; 