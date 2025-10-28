import { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, GripVertical, Calendar, CheckSquare } from 'lucide-react';
import { CardDialog } from './CardDialog';
import { Badge } from './ui/badge';
import type { Card as CardType } from '../App';

interface CardProps {
  card: CardType;
  index: number;
  listId: string;
  listTitle: string;
  onMoveCard: (cardId: string, targetListId: string, targetIndex?: number) => void;
  onUpdateCard: (cardId: string, updates: Partial<CardType>) => void;
  onDelete: (cardId: string) => void;
  onHoverIndex: (index: number | null) => void;
  hoveredIndex: number | null;
  primaryColor: string;
}

export function Card({
  card,
  index,
  listId,
  listTitle,
  onMoveCard,
  onUpdateCard,
  onDelete,
  onHoverIndex,
  hoveredIndex,
  primaryColor,
}: CardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'CARD',
    item: () => ({
      id: card.id,
      index,
      listId,
      card,
    }),
    end: () => {
      onHoverIndex(null);
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [card, index, listId, onHoverIndex]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    hover: (item: { id: string; index: number; listId: string }, monitor) => {
      if (item.id !== card.id && monitor.isOver({ shallow: true })) {
        onHoverIndex(index);
      } else if (!monitor.isOver({ shallow: true })) {
        onHoverIndex(null);
      }
    },
    drop: (item: { id: string; index: number; listId: string }) => {
      if (item.id !== card.id) {
        onMoveCard(item.id, listId, index);
      }
      onHoverIndex(null);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [card.id, listId, index, onHoverIndex, onMoveCard]);

  // Hide the default drag preview
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Connect drag and drop to the ref
  useEffect(() => {
    if (cardRef.current) {
      drag(drop(cardRef.current));
    }
  }, [drag, drop]);

  // Calculate card age in days based on last activity
  const ageInDays = Math.floor((Date.now() - card.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
  
  // Aging starts after 1 week (7 days) and reaches maximum at 6 weeks (42 days)
  const agingStartDay = 7;
  const maxAgingDay = 42;
  const effectiveAge = Math.max(0, ageInDays - agingStartDay); // Age beyond the first week
  const agingProgress = Math.min(effectiveAge / (maxAgingDay - agingStartDay), 1); // 0 to 1 over 5 weeks

  // Calculate aging effects - now scaled based on aging progress
  const yellowingIntensity = agingProgress * 0.7; // Reaches max 0.7
  const peelIntensity = agingProgress * 0.8; // Reaches max 0.8
  const contrastReduction = agingProgress * 0.15; // Subtle contrast reduction
  const noiseIntensity = agingProgress * 0.3; // Paper texture noise
  
  // Improved sepia/yellowing - keeps red high, reduces blue most, green moderately
  const getAgedBackgroundColor = () => {
    // If card has a cover, don't apply aging to background
    if (card.coverImage || card.coverColor) return '#ffffff';
    
    // Start with white (255, 255, 255)
    // For yellowing: red stays high, green reduces a bit, blue reduces significantly
    const red = 255;
    const green = Math.max(255 - yellowingIntensity * 60, 200); // Slight green reduction
    const blue = Math.max(255 - yellowingIntensity * 180, 150); // Significant blue reduction
    
    return `rgb(${red}, ${green}, ${blue})`;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(card.id);
    }, 400);
  };

  const handleCardClick = () => {
    if (!isDragging) {
      setIsDialogOpen(true);
    }
  };

  // Calculate checklist progress
  const checklistProgress = card.checklist
    ? {
        completed: card.checklist.filter((item) => item.completed).length,
        total: card.checklist.length,
      }
    : null;

  const progressPercent = checklistProgress
    ? (checklistProgress.completed / checklistProgress.total) * 100
    : 0;

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      <div ref={cardRef} className="relative">
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{
            opacity: isDeleting ? 0 : isDragging ? 0.3 : 1,
            scale: isDeleting ? 0.8 : 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            y: -20,
            transition: { duration: 0.2 },
          }}
          transition={{
            layout: { duration: 0.3, ease: 'easeInOut' },
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 },
          }}
          whileHover={{ scale: 1.015, zIndex: 10 }}
          className="relative group cursor-pointer"
          onClick={handleCardClick}
        >
          <div
            className={`rounded-lg relative overflow-hidden border transition-shadow group-hover:shadow-md`}
            style={{
              backgroundColor: (card.coverImage || card.coverColor) ? '#ffffff' : getAgedBackgroundColor(),
              borderColor: ageInDays > agingStartDay ? `rgba(139, 69, 19, ${0.2 + peelIntensity * 0.3})` : '#e5e7eb',
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
            <div 
              className="p-3 relative"
              style={{
                backgroundColor: (card.coverImage || card.coverColor) ? '#ffffff' : 'transparent',
                filter: ageInDays > agingStartDay && !(card.coverImage || card.coverColor) ? `contrast(${1 - contrastReduction}) opacity(${1 - noiseIntensity * 0.1})` : 'none',
              }}
            >
              {/* Paper texture/noise overlay for aged cards */}
              {ageInDays > agingStartDay && !(card.coverImage || card.coverColor) && (
                <div 
                  className="absolute inset-0 pointer-events-none rounded-lg"
                  style={{
                    opacity: noiseIntensity * 0.6,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'multiply',
                  }}
                />
              )}

              {/* Old texture overlay for cards over 3 weeks */}
              {ageInDays > 21 && !(card.coverImage || card.coverColor) && (
                <div 
                  className="absolute inset-0 pointer-events-none rounded-lg"
                  style={{
                    opacity: Math.min((ageInDays - 21) / 21, 1) * 0.4, // Fades in over 3 weeks, max opacity 0.4
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23b8946d' fill-opacity='0.3' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'multiply',
                  }}
                />
              )}
              
              {/* Hover overlay for darkening effect */}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-[0.03] transition-opacity rounded-lg pointer-events-none" />
              
              {/* Peeling corner effect - improved with shadow and curl */}
              {ageInDays > agingStartDay + 7 && !(card.coverImage || card.coverColor) && (
              <>
                {/* Main peel */}
                <div
                  className="absolute top-0 right-0 w-10 h-10 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, transparent 45%, rgba(139, 69, 19, ${peelIntensity * 0.15}) 50%, rgba(210, 180, 140, ${peelIntensity * 0.25}) 55%, transparent 60%)`,
                    clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
                  }}
                />
                {/* Shadow under peel */}
                <div
                  className="absolute top-0 right-0 w-10 h-10 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, ${peelIntensity * 0.2}) 50%)`,
                    clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
                    filter: 'blur(2px)',
                  }}
                />
              </>
            )}

              {/* Age spots/discoloration - subtle brown spots */}
              {ageInDays > agingStartDay + 14 && !(card.coverImage || card.coverColor) && (
              <>
                <div
                  className="absolute rounded-full blur-md pointer-events-none"
                  style={{
                    width: '40px',
                    height: '40px',
                    top: '12%',
                    left: '10%',
                    background: `radial-gradient(circle, rgba(160, 82, 45, ${0.08 + yellowingIntensity * 0.15}) 0%, rgba(139, 69, 19, ${0.04 + yellowingIntensity * 0.08}) 40%, transparent 70%)`,
                  }}
                />
                <div
                  className="absolute rounded-full blur-md pointer-events-none"
                  style={{
                    width: '30px',
                    height: '30px',
                    bottom: '15%',
                    right: '15%',
                    background: `radial-gradient(circle, rgba(139, 69, 19, ${0.06 + yellowingIntensity * 0.12}) 0%, rgba(101, 67, 33, ${0.03 + yellowingIntensity * 0.06}) 40%, transparent 70%)`,
                  }}
                />
                <div
                  className="absolute rounded-full blur-md pointer-events-none"
                  style={{
                    width: '22px',
                    height: '22px',
                    top: '55%',
                    left: '72%',
                    background: `radial-gradient(circle, rgba(184, 134, 11, ${0.05 + yellowingIntensity * 0.1}) 0%, transparent 70%)`,
                  }}
                />
                <div
                  className="absolute rounded-full blur-sm pointer-events-none"
                  style={{
                    width: '15px',
                    height: '15px',
                    top: '35%',
                    right: '8%',
                    background: `radial-gradient(circle, rgba(139, 69, 19, ${0.04 + yellowingIntensity * 0.08}) 0%, transparent 60%)`,
                  }}
                />
              </>
            )}
              
              {/* Edge darkening for very old cards */}
              {ageInDays > agingStartDay + 21 && !(card.coverImage || card.coverColor) && (
                <div
                  className="absolute inset-0 pointer-events-none rounded-lg"
                  style={{
                    boxShadow: `inset 0 0 25px rgba(101, 67, 33, ${0.1 + yellowingIntensity * 0.2})`,
                  }}
                />
              )}

              <div className="relative z-10">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <h3 className="text-gray-900 line-clamp-4">{card.title}</h3>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleDelete}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    aria-label="Delete card"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Description preview */}
              {card.description && (
                <p className="text-gray-600 mb-2 line-clamp-2" style={{ fontSize: '0.7rem' }}>
                  {card.description.length > 140
                    ? card.description.substring(0, 140) + '...'
                    : card.description}
                </p>
              )}

              {/* Labels/Tags - show up to 4 */}
              {card.labels && card.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {card.labels.slice(0, 4).map((label) => (
                    <Badge 
                      key={label.id} 
                      variant="secondary"
                      className="text-gray-700 bg-gray-200 hover:bg-gray-200 cursor-default"
                      style={{ fontSize: '0.65rem', padding: '2px 6px' }}
                    >
                      {label.text}
                    </Badge>
                  ))}
                </div>
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
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progressPercent}%`, backgroundColor: primaryColor }}
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

          {/* Drop indicator */}
          {hoveredIndex === index && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 4 }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute -top-1 left-0 right-0 h-1 bg-gray-600 rounded"
              style={{ zIndex: 1001 }}
            />
          )}
        </motion.div>
      </div>

      <CardDialog
        card={card}
        listId={listId}
        listTitle={listTitle}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onUpdate={onUpdateCard}
        onDelete={onDelete}
        primaryColor={primaryColor}
      />
    </>
  );
}
