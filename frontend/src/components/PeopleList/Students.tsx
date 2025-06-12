import React, { useState } from 'react';
import styles from './PeopleList.module.css';

interface Student {
  id: string;
  name: string;
  attributes: Record<string, string>;
  schedule: { day: number; time: number; mode: string }[];
  educatorMeetingRequirements: {
    educatorId: string;
    meetingsPerWeek: number;
    meetingDurationMinutes: number;
  }[];
}

interface RequiredAttribute {
  name: string;
  values: string[] | null; // null means free-form text
}

interface StudentsProps {
  list: Student[];
  requiredAttributes: RequiredAttribute[];
  selectedId: string | null;
  newName: string;
  setNewName: (name: string) => void;
  onAdd: (attributes: Record<string, string>, educatorRequirements: { educatorId: string; meetingsPerWeek: number; meetingDurationMinutes: number }[]) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAddRequiredAttribute: (name: string, values: string[] | null) => void;
  onRemoveRequiredAttribute: (name: string) => void;
  onUpdateRequiredAttributeValues: (name: string, values: string[] | null) => void;
  educators: Array<{ id: string; name: string }>;
  onAddEducatorRequirement: (studentId: string, requirement: { educatorId: string; meetingsPerWeek: number; meetingDurationMinutes: number }) => void;
  onRemoveEducatorRequirement: (studentId: string, educatorId: string) => void;
}

export const Students: React.FC<StudentsProps> = ({
  list,
  requiredAttributes,
  selectedId,
  newName,
  setNewName,
  onAdd,
  onSelect,
  onDelete,
  onAddRequiredAttribute,
  onRemoveRequiredAttribute,
  onUpdateRequiredAttributeValues,
  educators,
  onAddEducatorRequirement,
  onRemoveEducatorRequirement,
}) => {
  const [newRequiredAttr, setNewRequiredAttr] = useState('');
  const [newRequiredValues, setNewRequiredValues] = useState('');
  const [editingValues, setEditingValues] = useState<string | null>(null);
  const [newStudentAttributes, setNewStudentAttributes] = useState<{ key: string; value: string }[]>([]);
  const [newEducatorRequirements, setNewEducatorRequirements] = useState<{
    educatorId: string;
    meetingsPerWeek: number;
    meetingDurationMinutes: number;
  }[]>([]);

  const handleAddRequiredAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newRequiredAttr.trim();
    if (name) {
      const values = newRequiredValues.trim() 
        ? newRequiredValues.split(',').map(v => v.trim()).filter(Boolean)
        : null;
      onAddRequiredAttribute(name, values);
      // Clear both fields after successful addition
      setNewRequiredAttr('');
      setNewRequiredValues('');
      // Reset the form
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleEditValues = (name: string) => {
    const attr = requiredAttributes.find(a => a.name === name);
    if (attr) {
      setEditingValues(name);
      setNewRequiredValues(attr.values?.join(', ') || '');
    }
  };

  const handleSaveValues = (name: string) => {
    const values = newRequiredValues.trim() 
      ? newRequiredValues.split(',').map(v => v.trim()).filter(Boolean)
      : null;
    onUpdateRequiredAttributeValues(name, values);
    setEditingValues(null);
    setNewRequiredValues('');
  };

  const handleAddEducatorRequirement = () => {
    setNewEducatorRequirements(prev => [
      ...prev,
      { educatorId: '', meetingsPerWeek: 1, meetingDurationMinutes: 30 }
    ]);
  };

  const handleRemoveEducatorRequirement = (index: number) => {
    setNewEducatorRequirements(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateEducatorRequirement = (
    index: number,
    field: 'educatorId' | 'meetingsPerWeek' | 'meetingDurationMinutes',
    value: string | number
  ) => {
    setNewEducatorRequirements(prev =>
      prev.map((req, i) =>
        i === index ? { ...req, [field]: value } : req
      )
    );
  };

  return (
    <>
      <div className={styles['required-attributes']}>
        <h4>Required Attributes</h4>
        <form 
          onSubmit={handleAddRequiredAttribute} 
          className={styles['add-form']}
          onReset={() => {
            setNewRequiredAttr('');
            setNewRequiredValues('');
          }}
        >
          <input
            type="text"
            placeholder="Name"
            value={newRequiredAttr}
            onChange={e => setNewRequiredAttr(e.target.value)}
            style={{ marginRight: 8 }}
          />
          <input
            type="text"
            placeholder="Values"
            value={newRequiredValues}
            onChange={e => setNewRequiredValues(e.target.value)}
            style={{ marginRight: 8 }}
            title="Enter a comma-separated list of values, or leave empty for free-form text."
          />
          <button type="submit" className={styles['add-btn']}>+</button>
        </form>
        <ul className={styles['required-attr-list']}>
          {requiredAttributes && requiredAttributes.map(attr => (
            <li key={attr.name} className={styles['required-attr-item']}>
              <div className={styles['required-attr-content']}>
                <span className={styles['required-attr-name']}>{attr.name}</span>
                {editingValues === attr.name ? (
                  <div className={styles['required-attr-edit']}>
                    <input
                      type="text"
                      value={newRequiredValues}
                      onChange={e => setNewRequiredValues(e.target.value)}
                      placeholder="Possible values (comma-separated)"
                    />
                    <button
                      type="button"
                      className={styles['save-btn']}
                      onClick={() => handleSaveValues(attr.name)}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className={styles['cancel-btn']}
                      onClick={() => setEditingValues(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className={styles['required-attr-values']}>
                    {attr.values && (
                      <>
                        <span className={styles['values-label']}>Values:</span>
                        <span className={styles['values-list']}>{attr.values.join(', ')}</span>
                        <button
                          type="button"
                          className={styles['edit-btn']}
                          onClick={() => handleEditValues(attr.name)}
                          title="Edit values"
                        >
                          ✎
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                className={styles['remove-attr-btn']}
                onClick={() => onRemoveRequiredAttribute(attr.name)}
                title="Remove required attribute"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      </div>
      <ul className={styles['list-ul']}>
        <li className={styles['add-list-item']}>
          <div className={styles['group-box'] + ' ' + styles['add-group-box']}>
            <form
              className={styles['add-form'] + ' ' + styles['add-form-students']}
              onSubmit={e => {
                e.preventDefault();
                const attributes: Record<string, string> = {};
                newStudentAttributes.forEach(attr => {
                  if (attr.key.trim()) attributes[attr.key] = attr.value;
                });
                onAdd(attributes, newEducatorRequirements);
                setNewStudentAttributes([]);
                setNewEducatorRequirements([]);
              }}
            >
              <div className={styles['add-form-name']}>
                <input
                  type="text"
                  placeholder="Student Name"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{ marginRight: 8 }}
                />
                <button type="submit" className={styles['add-btn']}>+</button>
              </div>
              {requiredAttributes && requiredAttributes.length > 0 && (
                <div className={styles['required-fields']}>
                  {requiredAttributes.map(attr => (
                    <div key={attr.name} className={styles['required-field']}>
                      <label className={styles['required-field-label']}>
                        {attr.name}:
                      </label>
                      {attr.values ? (
                        <select
                          className={styles['required-field-select']}
                          value={newStudentAttributes.find(a => a.key === attr.name)?.value || ''}
                          onChange={e => {
                            const existingIdx = newStudentAttributes.findIndex(a => a.key === attr.name);
                            if (existingIdx >= 0) {
                              const newAttrs = [...newStudentAttributes];
                              newAttrs[existingIdx] = { key: attr.name, value: e.target.value };
                              setNewStudentAttributes(newAttrs);
                            } else {
                              setNewStudentAttributes([...newStudentAttributes, { key: attr.name, value: e.target.value }]);
                            }
                          }}
                          required
                        >
                          <option value="">Select {attr.name}</option>
                          {attr.values.map(value => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          className={styles['required-field-input']}
                          placeholder={`Enter ${attr.name}`}
                          value={newStudentAttributes.find(a => a.key === attr.name)?.value || ''}
                          onChange={e => {
                            const existingIdx = newStudentAttributes.findIndex(a => a.key === attr.name);
                            if (existingIdx >= 0) {
                              const newAttrs = [...newStudentAttributes];
                              newAttrs[existingIdx] = { key: attr.name, value: e.target.value };
                              setNewStudentAttributes(newAttrs);
                            } else {
                              setNewStudentAttributes([...newStudentAttributes, { key: attr.name, value: e.target.value }]);
                            }
                          }}
                          required
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className={styles['educator-requirements']}>
                <h4 className={styles['educator-requirements-title']}>Educator Meetings</h4>
                {newEducatorRequirements.map((req, index) => (
                  <div key={index} className={styles['educator-requirement']}>
                    <span>
                      <span>Meet with:</span>
                      <select
                        value={req.educatorId}
                        onChange={e => handleUpdateEducatorRequirement(index, 'educatorId', e.target.value)}
                        required
                      >
                        <option value="">Select Educator</option>
                        {educators.map(educator => (
                          <option key={educator.id} value={educator.id}>
                            {educator.name}
                          </option>
                        ))}
                      </select>
                    </span>
                    <span>
                      <span>Meetings/week:</span>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        placeholder="Meetings/week"
                        value={req.meetingsPerWeek}
                        onChange={e => handleUpdateEducatorRequirement(index, 'meetingsPerWeek', parseInt(e.target.value))}
                        required
                      />
                    </span>
                    <span>
                      <span>Duration (min):</span>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        placeholder="Duration (min)"
                        value={req.meetingDurationMinutes}
                        onChange={e => handleUpdateEducatorRequirement(index, 'meetingDurationMinutes', parseInt(e.target.value))}
                        required
                      />
                    </span>
                    <button
                      type="button"
                      className={styles['remove-btn']}
                      onClick={() => handleRemoveEducatorRequirement(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={styles['add-educator-btn']}
                  onClick={handleAddEducatorRequirement}
                >
                  + Add Educator Requirement
                </button>
              </div>
            </form>
          </div>
        </li>
        {list.map((student) => (
          <li
            key={student.id}
            className={`${styles['student-item']} ${
              selectedId === student.id ? styles['selected'] : ''
            }`}
            onClick={() => onSelect(student.id)}
          >
            <div
              className={styles['group-box']}
              style={{ cursor: 'pointer', position: 'relative' }}
              data-student-id={student.id}
            >
              <button
                className={styles['delete-btn']}
                type="button"
                title="Delete student"
                onClick={e => {
                  e.stopPropagation();
                  onDelete(student.id);
                }}
                style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 7.5V14.5M10 7.5V14.5M13.5 7.5V14.5M3 5.5H17M8.5 3.5H11.5C12.0523 3.5 12.5 3.94772 12.5 4.5V5.5H7.5V4.5C7.5 3.94772 7.94772 3.5 8.5 3.5Z" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className={styles['name']}>{student.name}</span>
              <ul className={styles['attr-list']}>
                {Object.entries(student.attributes).map(([key, value]) => (
                  <li key={key} className={styles['attr-list-item']}>
                    <span className={styles['attr-key']}>{key}:</span>
                    <span className={styles['attr-value']}>{value}</span>
                  </li>
                ))}
              </ul>
              <div className={styles['educator-requirements']}>
                <h4>Educator Meeting Requirements</h4>
                <ul>
                  {student.educatorMeetingRequirements.map(req => {
                    const educator = educators.find(e => e.id === req.educatorId);
                    return (
                      <li key={req.educatorId} className={styles['educator-requirement']}>
                        <span>{educator?.name || 'Unknown Educator'}</span>
                        <span>{req.meetingsPerWeek} meetings/week</span>
                        <span>{req.meetingDurationMinutes} min/meeting</span>
                        <button
                          type="button"
                          className={styles['remove-btn']}
                          onClick={e => {
                            e.stopPropagation();
                            onRemoveEducatorRequirement(student.id, req.educatorId);
                          }}
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}; 