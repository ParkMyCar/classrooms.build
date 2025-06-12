import React from 'react';
import styles from './SelectionMode.module.css';

export type SelectionMode = 'cannot' | 'prefer-not' | 'available' | 'preferred';

interface SelectionModeProps {
  currentMode: SelectionMode;
  onModeChange: (mode: SelectionMode) => void;
}

export function SelectionMode({ currentMode, onModeChange }: SelectionModeProps) {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.modeButton} ${styles.cannot} ${currentMode === 'cannot' ? styles.active : ''}`}
        onClick={() => onModeChange('cannot')}
      >
        Cannot Schedule
      </button>
      <button
        className={`${styles.modeButton} ${styles.preferNot} ${currentMode === 'prefer-not' ? styles.active : ''}`}
        onClick={() => onModeChange('prefer-not')}
      >
        Prefer Not
      </button>
      <button
        className={`${styles.modeButton} ${styles.available} ${currentMode === 'available' ? styles.active : ''}`}
        onClick={() => onModeChange('available')}
      >
        Available
      </button>
      <button
        className={`${styles.modeButton} ${styles.preferred} ${currentMode === 'preferred' ? styles.active : ''}`}
        onClick={() => onModeChange('preferred')}
      >
        Preferred
      </button>
    </div>
  );
} 