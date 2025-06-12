import React from 'react';
import styles from './SelectionMode.module.css';

export type SelectionMode = 'cannot' | 'prefer-not' | 'available' | 'preferred';

interface SelectionModeProps {
  currentMode: SelectionMode;
  onModeChange: (mode: SelectionMode) => void;
  onClearAll: () => void;
  clearDisabled?: boolean;
}

export function SelectionMode({ currentMode, onModeChange, onClearAll, clearDisabled }: SelectionModeProps) {
  return (
    <div className={styles.container}>
      <div className={styles.modesRow}>
        <span className={styles.label}>Selection Modes:</span>
        <button
          className={`${styles.modeButton} ${styles.cannot} ${currentMode === 'cannot' ? styles.active : ''}`}
          onClick={() => onModeChange('cannot')}
          title="Cannot schedule: This time is completely unavailable for the student."
        >
          Cannot Schedule
        </button>
        <button
          className={`${styles.modeButton} ${styles.preferNot} ${currentMode === 'prefer-not' ? styles.active : ''}`}
          onClick={() => onModeChange('prefer-not')}
          title="Prefer not: Avoid scheduling at this time if possible, but it's not strictly forbidden."
        >
          Prefer Not
        </button>
        <button
          className={`${styles.modeButton} ${styles.available} ${currentMode === 'available' ? styles.active : ''}`}
          onClick={() => onModeChange('available')}
          title="Available: This time is fine for scheduling, but not a strong preference."
        >
          Available
        </button>
        <button
          className={`${styles.modeButton} ${styles.preferred} ${currentMode === 'preferred' ? styles.active : ''}`}
          onClick={() => onModeChange('preferred')}
          title="Preferred: This is the best time for scheduling."
        >
          Preferred
        </button>
      </div>
      <button
        className={styles.clearButton}
        onClick={onClearAll}
        disabled={clearDisabled}
        title="Clear all selections"
      >
        Clear All
      </button>
    </div>
  );
} 