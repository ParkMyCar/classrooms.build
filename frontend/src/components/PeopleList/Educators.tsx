import React from "react";
import styles from "./PeopleList.module.css";

interface Educator {
  id: string;
  name: string;
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
}

export const Educators: React.FC<EducatorsProps> = ({
  list,
  selectedId,
  newName,
  setNewName,
  onAdd,
  onSelect,
  onDelete,
}) => {
  return (
    <>
      <ul className={styles["list-ul"]}>
        <li className={styles["add-list-item"]}>
          <div
            className={
              styles["group-box"] +
              " " +
              styles["add-group-box"] +
              " " +
              styles["add-educator-box"]
            }
          >
            <form
              className={styles["add-form"]}
              onSubmit={(e) => {
                e.preventDefault();
                onAdd();
              }}
            >
              <input
                type="text"
                placeholder="Educator Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ marginRight: 8 }}
              />
              <button type="submit" className={styles["add-btn"]}>
                +
              </button>
            </form>
          </div>
        </li>
        {list.map((educator) => (
          <li key={educator.id} className={styles["list-item"]}>
            <div
              className={
                styles["group-box"] +
                (educator.id === selectedId ? " " + styles["selected"] : "")
              }
              onClick={() => onSelect(educator.id)}
              style={{ cursor: "pointer", position: "relative" }}
              data-educator-id={educator.id}
            >
              <button
                className={styles["delete-btn"]}
                type="button"
                title="Delete educator"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(educator.id);
                }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.5 7.5V14.5M10 7.5V14.5M13.5 7.5V14.5M3 5.5H17M8.5 3.5H11.5C12.0523 3.5 12.5 3.94772 12.5 4.5V5.5H7.5V4.5C7.5 3.94772 7.94772 3.5 8.5 3.5Z"
                    stroke="#888"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <span className={styles["name"]}>{educator.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};
