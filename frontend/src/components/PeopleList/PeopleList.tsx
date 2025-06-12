import React, { useState } from 'react';
import { Students } from './Students';
import { Educators } from './Educators';
import styles from './PeopleList.module.css';

type Tab = 'students' | 'educators';

interface RequiredAttribute {
  name: string;
  values: string[] | null; // null means free-form text
}

interface PeopleListProps {
  students: {
    list: Array<{
      id: string;
      name: string;
      attributes: Record<string, string>;
      schedule: { day: number; time: number; mode: string }[];
    }>;
    requiredAttributes: RequiredAttribute[];
    selectedId: string | null;
    newName: string;
    setNewName: (name: string) => void;
    onAdd: (attributes: Record<string, string>) => void;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdateAttribute: (idx: number, attrIdx: number, key: string, value: string) => void;
    onRemoveAttribute: (idx: number, attrIdx: number) => void;
    onAddAttribute: (idx: number) => void;
    onAddRequiredAttribute: (name: string, values: string[] | null) => void;
    onRemoveRequiredAttribute: (name: string) => void;
    onUpdateRequiredAttributeValues: (name: string, values: string[] | null) => void;
  };
  educators: {
    list: Array<{
      id: string;
      name: string;
      attributes: Record<string, string>;
      schedule: { day: number; time: number; mode: string }[];
      subjects: string[];
    }>;
    selectedId: string | null;
    newName: string;
    setNewName: (name: string) => void;
    onAdd: () => void;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
  };
}

export const PeopleList: React.FC<PeopleListProps> = ({ students, educators }) => {
  const [activeTab, setActiveTab] = useState<Tab>('students');

  return (
    <div className={styles['people-card']}>
      <div className={styles['tabs']}>
        <button
          className={`${styles['tab']} ${activeTab === 'students' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Students
        </button>
        <button
          className={`${styles['tab']} ${activeTab === 'educators' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('educators')}
        >
          Educators
        </button>
      </div>
      {activeTab === 'students' ? (
        <Students {...students} />
      ) : (
        <Educators {...educators} />
      )}
    </div>
  );
}; 