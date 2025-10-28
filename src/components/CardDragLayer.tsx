import { useState, useEffect, useRef } from 'react';
import { useDragLayer } from 'react-dnd';
import { motion } from 'motion/react';
import { Calendar, CheckSquare } from 'lucide-react';
import type { Card } from '../App';

interface DragItem {
  id: string;
  index: number;
  listId: string;
  card: Card;
}

export function CardDragLayer() {
  const [rotation, setRotation] = useState(0);
  const lastPosRef = useRef({ x: 0, y: 0, time: Date.now() });
  const velocityRef = useRef({ x: 0, y: 0 });

  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem() as DragItem | null,
    currentOffset: monitor.getClientOffset(),
  }));

  useEffect(() => {
    if (!isDragging) {
      setRotation(0);
      lastPosRef.current = { x: 0, y: 0, time: Date.now() };
      velocityRef.current = { x: 0, y: 0 };
      return;
    }

    if (!currentOffset) return;

    const now = Date.now();
    const dt = now - lastPosRef.current.time;

    if (dt > 0 && lastPosRef.current.x !== 0) {
      const dx = currentOffset.x - lastPosRef.current.x;
      const dy = currentOffset.y - lastPosRef.current.y;

      const velocityX = dx / dt * 16; // Increased multiplier for more sensitivity
      const velocityY = dy / dt * 16;

      velocityRef.current = { x: velocityX, y: velocityY };

      // Calculate rotation based on horizontal velocity
      const targetRotation = Math.max(-20, Math.min(20, velocityX * 1.5));
      setRotation(targetRotation);
    }

    lastPosRef.current = {
      x: currentOffset.x,
      y: currentOffset.y,
      time: now,
    };
  }, [currentOffset, isDragging]);

  if (!isDragging || !item || !currentOffset || !item.card) {
    return null;
  }

  const card = item.card;

  // Calculate aging effect based on last activity
  const lastActivityTime = card.lastActivity ? card.lastActivity.getTime() : (card.createdAt ? card.createdAt.getTime() : Date.now());
  const ageInDays = Math.floor((Date.now() - lastActivityTime) / (1000 * 60 * 60 * 24));
  
  // Aging starts after 1 week (7 days)
  const agingStartDay = 7;
  const maxAgingDay = 42;
  const effectiveAge = Math.max(0, ageInDays - agingStartDay);
  const agingProgress = Math.min(effectiveAge / (maxAgingDay - agingStartDay), 1);
  
  const yellowingIntensity = agingProgress * 0.7;
  const peelIntensity = agingProgress * 0.8;
  const shadowIntensity = agingProgress * 0.3;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const checklistProgress = card.checklist
    ? {
        total: card.checklist.length,
        completed: card.checklist.filter((item) => item.completed).length,
      }
    : null;

  const progressPercent = checklistProgress
    ? (checklistProgress.completed / checklistProgress.total) * 100
    : 0;

  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 10000,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: currentOffset.x,
          top: currentOffset.y,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          transition: 'transform 0.05s linear',
          width: '260px',
        }}
      >
        <div
          className="rounded-lg shadow-xl relative overflow-hidden"
          style={{
            backgroundColor: (card.coverImage || card.coverColor) 
              ? '#ffffff' 
              : `rgb(255, ${Math.max(255 - yellowingIntensity * 60, 200)}, ${Math.max(255 - yellowingIntensity * 180, 150)})`,
            boxShadow: `0 ${12 + shadowIntensity * 20}px ${32 + shadowIntensity * 40}px rgba(0, 0, 0, ${0.3 + shadowIntensity})`,
            opacity: 0.9,
          }}
        >
          {/* Cover Image/Color */}
          {(card.coverImage || card.coverColor) && (
            <div 
              className="w-full h-24 flex-shrink-0"
              style={{
                backgroundColor: card.coverColor || undefined,
                backgroundImage: card.coverImage ? `url(${card.coverImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}

          {/* Card content wrapper with padding */}
          <div className="p-3 relative">
            {/* Peeling corner effect */}
            {ageInDays > agingStartDay + 7 && !(card.coverImage || card.coverColor) && (
              <div
                className="absolute top-0 right-0 w-8 h-8"
                style={{
                  background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)',
                  opacity: peelIntensity,
                }}
              />
            )}

            {/* Age spots */}
            {ageInDays > agingStartDay + 14 && !(card.coverImage || card.coverColor) && (
            <>
              <div
                className="absolute rounded-full blur-sm"
                style={{
                  width: '30px',
                  height: '30px',
                  top: '20%',
                  left: '10%',
                  backgroundColor: `rgba(139, 69, 19, ${peelIntensity * 0.15})`,
                }}
              />
              <div
                className="absolute rounded-full blur-sm"
                style={{
                  width: '20px',
                  height: '20px',
                  bottom: '25%',
                  right: '15%',
                  backgroundColor: `rgba(139, 69, 19, ${peelIntensity * 0.1})`,
                }}
              />
            </>
          )}

          <div className="relative z-10">
            <h3 className="text-gray-900 mb-2 line-clamp-4">{card.title}</h3>

            {/* Description preview */}
            {card.description && (
              <p className="text-gray-600 mb-2 line-clamp-2" style={{ fontSize: '0.7rem' }}>
                {card.description.length > 140
                  ? card.description.substring(0, 140) + '...'
                  : card.description}
              </p>
            )}

            {/* Progress bar */}
            {checklistProgress && checklistProgress.total > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <CheckSquare className="w-3 h-3 text-gray-600" />
                  <span className="text-gray-600" style={{ fontSize: '0.65rem' }}>
                    {checklistProgress.completed}/{checklistProgress.total}
                  </span>
                </div>
                {progressPercent < 100 && (
                  <div className="w-full h-1.5 bg-gray-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Footer with date and avatars */}
            <div className="flex items-center justify-between gap-2 mt-2">
              {card.dueDate && (
                <div className="flex items-center gap-1 text-gray-600" style={{ fontSize: '0.65rem' }}>
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(card.dueDate)}</span>
                </div>
              )}

              {card.assignees && card.assignees.length > 0 && (
                <div className="flex items-center -space-x-2">
                  {card.assignees.map((assignee, idx) => (
                    <div
                      key={idx}
                      className="w-5 h-5 rounded-full bg-gray-800 border-2 border-white flex items-center justify-center"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {assignee}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
