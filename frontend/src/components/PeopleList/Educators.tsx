import React from 'react';
import styles from './PeopleList.module.css';

interface Educator {
  id: string;
  name: string;
  attributes: Record<string, string>;
  schedule: { day: number; time: number; mode: string }[];
  subjects: string[];
}

interface EducatorsProps {
  list: Educator[];
  selectedId: string | null;
  newName: string;
  setNewName: (name: string) => void;
  onAdd: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateAttribute: (idx: number, attrIdx: number, key: string, value: string) => void;
  onRemoveAttribute: (idx: number, attrIdx: number) => void;
  onAddAttribute: (idx: number) => void;
}

export const Educators: React.FC<EducatorsProps> = ({
  list,
  selectedId,
  newName,
  setNewName,
  onAdd,
  onSelect,
  onDelete,
  onUpdateAttribute,
  onRemoveAttribute,
  onAddAttribute,
}) => {
  return (
    <>
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
                placeholder="Educator Name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                style={{ marginRight: 8 }}
              />
              <button type="submit" className={styles['add-btn']}>+</button>
            </form>
          </div>
        </li>
        {list.map((educator, idx) => (
          <li key={educator.id} className={styles['list-item']}>
            <div
              className={
                styles['group-box'] +
                (educator.id === selectedId ? ' ' + styles['selected'] : '')
              }
              onClick={() => onSelect(educator.id)}
              style={{ cursor: 'pointer', position: 'relative' }}
              data-educator-id={educator.id}
            >
              <button
                className={styles['delete-btn']}
                type="button"
                title="Delete educator"
                onClick={e => {
                  e.stopPropagation();
                  onDelete(educator.id);
                }}
                style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 7.5V14.5M10 7.5V14.5M13.5 7.5V14.5M3 5.5H17M8.5 3.5H11.5C12.0523 3.5 12.5 3.94772 12.5 4.5V5.5H7.5V4.5C7.5 3.94772 7.94772 3.5 8.5 3.5Z" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <span className={styles['name']}>{educator.name}</span>
              <ul className={styles['attr-list']}>
                {Object.entries(educator.attributes).map(([key, value], attrIdx) => (
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