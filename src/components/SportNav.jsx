import { useState, useRef } from 'react';
import { SPORTS } from '../api/espn';
import styles from './SportNav.module.css';

function ReorderSheet({ order, onReorder, onClose }) {
  const [localOrder, setLocalOrder] = useState(order);
  const [dragKey, setDragKey] = useState(null);
  const [dropIdx, setDropIdx] = useState(null);
  const listRef = useRef(null);

  const displayOrder = (() => {
    if (!dragKey || dropIdx === null) return localOrder;
    const fromIdx = localOrder.indexOf(dragKey);
    if (fromIdx === dropIdx) return localOrder;
    const next = [...localOrder];
    next.splice(fromIdx, 1);
    next.splice(dropIdx, 0, dragKey);
    return next;
  })();

  function onPointerDown(e, key) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragKey(key);
    setDropIdx(localOrder.indexOf(key));
  }

  function onPointerMove(e) {
    if (!dragKey || !listRef.current) return;
    const y = e.clientY;
    const items = listRef.current.querySelectorAll('[data-itemkey]');
    let best = dropIdx;
    let bestDist = Infinity;
    items.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(y - center);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    setDropIdx(best);
  }

  function onPointerUp() {
    if (dragKey !== null && dropIdx !== null) {
      const fromIdx = localOrder.indexOf(dragKey);
      if (fromIdx !== dropIdx) {
        const next = [...localOrder];
        next.splice(fromIdx, 1);
        next.splice(dropIdx, 0, dragKey);
        setLocalOrder(next);
      }
    }
    setDragKey(null);
    setDropIdx(null);
  }

  function handleDone() {
    onReorder(localOrder);
    onClose();
  }

  return (
    <div className={styles.sheetOverlay} onClick={onClose}>
      <div className={styles.sheet} onClick={e => e.stopPropagation()}>
        <div className={styles.sheetHandle} />
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>Reorder Sports</span>
        </div>
        <div className={styles.list} ref={listRef}>
          {displayOrder.map((key) => {
            const { label } = SPORTS[key];
            const isDragging = dragKey === key;
            return (
              <div
                key={key}
                data-itemkey={key}
                className={`${styles.listItem} ${isDragging ? styles.itemDragging : ''}`}
                onPointerDown={e => onPointerDown(e, key)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <span className={styles.handle}>≡</span>
                <span className={styles.itemLabel}>{label}</span>
              </div>
            );
          })}
        </div>
        <div className={styles.sheetFooter}>
          <button className={styles.doneBtn} onClick={handleDone}>Done</button>
        </div>
      </div>
    </div>
  );
}

export default function SportNav({ selected, onSelect, order, onReorder }) {
  const [showSheet, setShowSheet] = useState(false);

  return (
    <>
      <div className={styles.navWrapper}>
        <div className={styles.nav}>
          <button
            className={`${styles.tab} ${selected === 'ALL' ? styles.active : ''}`}
            onClick={() => onSelect('ALL')}
          >
            All
          </button>
          {order.map((key) => {
            const { label } = SPORTS[key];
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
        <button className={styles.editBtn} onClick={() => setShowSheet(true)} aria-label="Reorder sports">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>

      {showSheet && (
        <ReorderSheet
          order={order}
          onReorder={onReorder}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
}
