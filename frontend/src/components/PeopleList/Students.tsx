import React, { useState } from 'react';
import styles from './PeopleList.module.css';

interface Student {
  id: string;
  name: string;
  attributes: Record<string, string>;
  schedule: { day: number; time: number; mode: string }[];
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
  onAdd: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateAttribute: (idx: number, attrIdx: number, key: string, value: string) => void;
  onRemoveAttribute: (idx: number, attrIdx: number) => void;
  onAddAttribute: (idx: number) => void;
  onAddRequiredAttribute: (name: string, values: string[] | null) => void;
  onRemoveRequiredAttribute: (name: string) => void;
  onUpdateRequiredAttributeValues: (name: string, values: string[] | null) => void;
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
  onUpdateAttribute,
  onRemoveAttribute,
  onAddAttribute,
  onAddRequiredAttribute,
  onRemoveRequiredAttribute,
  onUpdateRequiredAttributeValues,
}) => {
  const [newRequiredAttr, setNewRequiredAttr] = useState('');
  const [newRequiredValues, setNewRequiredValues] = useState('');
  const [editingValues, setEditingValues] = useState<string | null>(null);

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
            style={{ marginRight: 8, flex: 1 }}
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
              className={styles['add-form']}
              onSubmit={e => {
                e.preventDefault();
                onAdd();
              }}
            >
              <input
                type="text"
                placeholder="Student Name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                style={{ marginRight: 8 }}
              />
              <button type="submit" className={styles['add-btn']}>+</button>
            </form>
          </div>
        </li>
        {list.map((student, idx) => (
          <li key={student.id} className={styles['list-item']}>
            <div
              className={
                styles['group-box'] +
                (student.id === selectedId ? ' ' + styles['selected'] : '')
              }
              onClick={() => onSelect(student.id)}
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
                {Object.entries(student.attributes).map(([key, value], attrIdx) => (
                  <li key={key} className={styles['attr-list-item']}>
                    <input
                      className={styles['attr-key-input']}
                      type="text"
                      value={key}
                      onChange={e => {
                        onUpdateAttribute(idx, attrIdx, e.target.value, value);
                      }}
                      placeholder="Key"
                    />
                    <input
                      className={styles['attr-value-input']}
                      type="text"
                      value={value}
                      onChange={e => {
                        onUpdateAttribute(idx, attrIdx, key, e.target.value);
                      }}
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      className={styles['remove-attr-btn']}
                      onClick={() => onRemoveAttribute(idx, attrIdx)}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={styles['add-attr-btn']}
                onClick={() => onAddAttribute(idx)}
              >
                + Attribute
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}; 