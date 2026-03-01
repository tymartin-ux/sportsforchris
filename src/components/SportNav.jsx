import { useState, useRef } from 'react';
import { SPORTS } from '../api/espn';
import styles from './SportNav.module.css';

export default function SportNav({ selected, onSelect, order, onReorder }) {
  const [editing, setEditing] = useState(false);
  const [dragKey, setDragKey] = useState(null);
  const [dropIdx, setDropIdx] = useState(null);
  const navRef = useRef(null);

  // Compute preview order while dragging
  const displayOrder = (() => {
    if (!dragKey || dropIdx === null) return order;
    const fromIdx = order.indexOf(dragKey);
    if (fromIdx === dropIdx) return order;
    const next = [...order];
    next.splice(fromIdx, 1);
    next.splice(dropIdx, 0, dragKey);
    return next;
  })();

  function onPointerDown(e, key) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragKey(key);
    setDropIdx(order.indexOf(key));
  }

  function onPointerMove(e) {
    if (!dragKey || !navRef.current) return;
    const x = e.clientX;
    const items = navRef.current.querySelectorAll('[data-editkey]');
    let best = dropIdx;
    let bestDist = Infinity;
    items.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist = Math.abs(x - center);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    setDropIdx(best);
  }

  function onPointerUp() {
    if (dragKey !== null && dropIdx !== null) {
      const fromIdx = order.indexOf(dragKey);
      if (fromIdx !== dropIdx) {
        const next = [...order];
        next.splice(fromIdx, 1);
        next.splice(dropIdx, 0, dragKey);
        onReorder(next);
      }
    }
    setDragKey(null);
    setDropIdx(null);
  }

  return (
    <div className={styles.navWrapper}>
      <div className={styles.nav} ref={navRef}>
        {!editing && (
          <button
            className={`${styles.tab} ${selected === 'ALL' ? styles.active : ''}`}
            onClick={() => onSelect('ALL')}
          >
            All
          </button>
        )}
        {(editing ? displayOrder : order).map((key) => {
          const { label } = SPORTS[key];
          if (editing) {
            const isDragging = dragKey === key;
            return (
              <div
                key={key}
                data-editkey={key}
                className={`${styles.editItem} ${isDragging ? styles.dragging : ''}`}
                onPointerDown={(e) => onPointerDown(e, key)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <span className={styles.dragHandle}>⠿</span>
                <span className={styles.editLabel}>{label}</span>
              </div>
            );
          }
          return (
            <button
              key={key}
              className={`${styles.tab} ${selected === key ? styles.active : ''}`}
              onClick={() => onSelect(key)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <button className={styles.editBtn} onClick={() => { setEditing(e => !e); setDragKey(null); }}>
        {editing ? 'Done' : 'Edit'}
      </button>
    </div>
  );
}
