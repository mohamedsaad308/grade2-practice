import React, { useState, useEffect } from 'react';
import { playPop } from '../utils/audio.js';

/**
 * Ordering component supporting:
 * 1. Tap-to-swap (child taps one card, then taps another to swap them)
 * 2. Left / Right directional arrows on cards
 * 3. HTML5 Drag and drop
 */
export default function DragToOrder({
  question,
  onSubmit,
  disabled = false,
  soundEnabled = true
}) {
  const { items = [], startLabel = 'First', endLabel = 'Last' } = question.data || {};
  const [currentList, setCurrentList] = useState([...items]);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [draggedIdx, setDraggedIdx] = useState(null);

  useEffect(() => {
    setCurrentList([...items]);
    setSelectedIdx(null);
  }, [question?.id]);

  const handleCardClick = (index) => {
    if (disabled) return;
    playPop(soundEnabled);

    if (selectedIdx === null) {
      setSelectedIdx(index);
    } else if (selectedIdx === index) {
      setSelectedIdx(null); // Deselect
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

  const handleMove = (index, direction) => {
    if (disabled) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;

    playPop(soundEnabled);
    const updated = [...currentList];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCurrentList(updated);
    setSelectedIdx(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    if (disabled) return;
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx || disabled) return;
    playPop(soundEnabled);

    const updated = [...currentList];
    const [moved] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, moved);
    setCurrentList(updated);
    setDraggedIdx(null);
    setSelectedIdx(null);
  };

  const handleSubmit = () => {
    if (disabled) return;
    onSubmit(currentList);
  };

  return (
    <div className="drag-to-order-container">
      {/* Visual Order Helper */}
      <div className="order-direction-bar">
        <span className="order-pole-badge start-badge">⬅ {startLabel}</span>
        <span className="order-instruction-pill">Tap a card, then tap another to swap them!</span>
        <span className="order-pole-badge end-badge">{endLabel} ➡</span>
      </div>

      {/* Cards List */}
      <div className="order-slots-row">
        {currentList.map((num, idx) => {
          const isSelected = selectedIdx === idx;
          const slotLabel = idx === 0 ? startLabel : idx === currentList.length - 1 ? endLabel : 'Middle';

          return (
            <div
              key={`${num}_${idx}`}
              className={`order-card-wrapper ${isSelected ? 'is-selected' : ''}`}
              draggable={!disabled}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
            >
              <div className="slot-label">{slotLabel}</div>
              <button
                type="button"
                className={`order-card-btn ${isSelected ? 'ring-active' : ''}`}
                disabled={disabled}
                onClick={() => handleCardClick(idx)}
                aria-label={`Number ${num} at position ${slotLabel}. Click to select and swap.`}
              >
                <span className="order-number-text">{num}</span>
              </button>

              {/* Move buttons for quick tactile shifts */}
              <div className="card-quick-arrows">
                <button
                  type="button"
                  className="arrow-shift-btn"
                  disabled={disabled || idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  aria-label="Shift left"
                >
                  ◀
                </button>
                <button
                  type="button"
                  className="arrow-shift-btn"
                  disabled={disabled || idx === currentList.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  aria-label="Shift right"
                >
                  ▶
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        className="primary-submit-btn"
        disabled={disabled}
        onClick={handleSubmit}
      >
        Check Order! ✨
      </button>
    </div>
  );
}
