import React, { useState, useEffect, useRef } from 'react';
import { playPop } from '../utils/audio.js';

/**
 * Mobile-first DragToOrder component:
 * 1. Shows the 3 number cards strictly in ONE ROW.
 * 2. Small labels above: Left = startLabel ("Least" / "Greatest"), Center = "Middle", Right = endLabel.
 * 3. Real touch drag-and-drop using Pointer Events API with touch-action: none, lift/shadow animation.
 * 4. Tap-a-card-then-tap-another-to-swap as instant fallback.
 * 5. No arrow buttons.
 * 6. "Check Order" button in a sticky bottom bar.
 */
export default function DragToOrder({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  const { items = [], startLabel = 'Least', endLabel = 'Greatest' } = question.data || {};
  const [currentList, setCurrentList] = useState([...items]);
  const [selectedIdx, setSelectedIdx] = useState(null); // For tap-to-swap fallback

  // Pointer drag state
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const [dragDeltaX, setDragDeltaX] = useState(0);

  const containerRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMovedEnough = useRef(false);

  useEffect(() => {
    setCurrentList([...items]);
    setSelectedIdx(null);
    setDraggingIdx(null);
    setDragOverIdx(null);
    setDragDeltaX(0);
  }, [question?.id]);

  // Pointer Events for drag & drop
  const handlePointerDown = (e, index) => {
    if (disabled) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    hasMovedEnough.current = false;
    setDraggingIdx(index);
    setDragOverIdx(index);
    setDragDeltaX(0);
  };

  const handlePointerMove = (e) => {
    if (disabled || draggingIdx === null) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    if (!hasMovedEnough.current) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        hasMovedEnough.current = true;
      }
    }

    if (hasMovedEnough.current) {
      setDragDeltaX(deltaX);

      // Determine which card slot the pointer is currently hovering over
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const slotWidth = rect.width / currentList.length;
        const targetIdx = Math.max(0, Math.min(currentList.length - 1, Math.floor(relativeX / slotWidth)));
        setDragOverIdx(targetIdx);
      }
    }
  };

  const handlePointerUp = (e, index) => {
    if (disabled || draggingIdx === null) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    if (hasMovedEnough.current && dragOverIdx !== null && dragOverIdx !== draggingIdx) {
      // Drag & drop swap
      playPop(soundEnabled);
      const updated = [...currentList];
      const [movedItem] = updated.splice(draggingIdx, 1);
      updated.splice(dragOverIdx, 0, movedItem);
      setCurrentList(updated);
      setSelectedIdx(null);
    } else if (!hasMovedEnough.current) {
      // Tap detected (fallback tap-to-swap)
      handleCardTap(index);
    }

    setDraggingIdx(null);
    setDragOverIdx(null);
    setDragDeltaX(0);
    hasMovedEnough.current = false;
  };

  const handlePointerCancel = () => {
    setDraggingIdx(null);
    setDragOverIdx(null);
    setDragDeltaX(0);
    hasMovedEnough.current = false;
  };

  // Fallback: tap-a-card-then-tap-another-to-swap
  const handleCardTap = (index) => {
    if (disabled) return;
    playPop(soundEnabled);

    if (selectedIdx === null) {
      setSelectedIdx(index);
    } else if (selectedIdx === index) {
      setSelectedIdx(null); // deselect
    } else {
      // Swap items at selectedIdx and index
      const updated = [...currentList];
      const temp = updated[selectedIdx];
      updated[selectedIdx] = updated[index];
      updated[index] = temp;
      setCurrentList(updated);
      setSelectedIdx(null);
    }
  };

  const handleSubmit = () => {
    if (disabled) return;
    onSubmit(currentList);
  };

  return (
    <div className="drag-to-order-container" role="region" aria-label="Order numbers activity">
      {/* Visual Instruction Banner */}
      <div className="order-direction-bar">
        <span className="order-instruction-pill">
          👉 Drag cards or tap two to swap!
        </span>
      </div>

      {/* Cards List strictly in ONE ROW with labels above */}
      <div
        className="order-slots-row single-row-order"
        ref={containerRef}
        role="group"
        aria-label="Number cards to order"
      >
        {currentList.map((num, idx) => {
          const isSelected = selectedIdx === idx;
          const isDragging = draggingIdx === idx;
          const isTargeted = draggingIdx !== null && dragOverIdx === idx && draggingIdx !== idx;

          // Labels above the cards: left = startLabel, middle = "Middle", right = endLabel
          const slotLabel = idx === 0 ? startLabel : idx === currentList.length - 1 ? endLabel : 'Middle';

          const cardStyle = isDragging
            ? {
                transform: `translateX(${dragDeltaX}px) scale(1.08) translateY(-6px)`,
                zIndex: 25
              }
            : {};

          return (
            <div
              key={`${num}_${idx}`}
              className={`order-card-wrapper slot-col ${isTargeted ? 'slot-target-hover' : ''}`}
            >
              {/* Small label above the card */}
              <div className="order-slot-header-label" aria-hidden="true">
                <span className={`slot-tag ${idx === 0 ? 'slot-start' : idx === currentList.length - 1 ? 'slot-end' : ''}`}>
                  {slotLabel}
                </span>
              </div>

              {/* Number Card */}
              <button
                type="button"
                className={`order-card-btn touch-drag-card ${isSelected ? 'ring-active' : ''} ${isDragging ? 'is-dragging' : ''} ${isTargeted ? 'is-target' : ''}`}
                style={cardStyle}
                disabled={disabled}
                onPointerDown={(e) => handlePointerDown(e, idx)}
                onPointerMove={handlePointerMove}
                onPointerUp={(e) => handlePointerUp(e, idx)}
                onPointerCancel={handlePointerCancel}
                aria-label={`Number ${num} at position ${slotLabel}. Drag to move or tap to select.`}
                aria-pressed={isSelected}
              >
                <span className="order-number-text">{num}</span>
                <span className="drag-handle-indicator" aria-hidden="true">⠿</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar for Check Order */}
      <div className="order-sticky-bottom-bar" role="region" aria-label="Submit order">
        <button
          type="button"
          className="primary-submit-btn check-order-btn sticky-action-btn"
          disabled={disabled}
          onClick={handleSubmit}
        >
          Check Order! ✨
        </button>
      </div>
    </div>
  );
}
