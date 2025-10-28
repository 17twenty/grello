import { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Card } from './Card';
import { AddCard } from './AddCard';
import { motion, AnimatePresence } from 'motion/react';
import { MoreHorizontal, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { List as ListType, Card as CardType } from '../App';

interface ListProps {
  list: ListType;
  listIndex: number;
  totalLists: number;
  onMoveCard: (cardId: string, targetListId: string, targetIndex?: number) => void;
  onAddCard: (listId: string, card: Omit<CardType, 'id' | 'createdAt' | 'lastActivity' | 'listId'>) => void;
  onUpdateCard: (cardId: string, updates: Partial<CardType>) => void;
  onDeleteCard: (cardId: string) => void;
  onRenameList: (listId: string, newTitle: string) => void;
  onMoveList: (listId: string, direction: 'left' | 'right') => void;
  onDeleteList: (listId: string) => void;
  onArchiveAllCards: (listId: string) => void;
  primaryColor: string;
}

export function List({ 
  list, 
  listIndex,
  totalLists,
  onMoveCard, 
  onAddCard, 
  onUpdateCard, 
  onDeleteCard,
  onRenameList,
  onMoveList,
  onDeleteList,
  onArchiveAllCards,
  primaryColor,
}: ListProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isBottomHovered, setIsBottomHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(list.title);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'CARD',
    drop: (item: { id: string; index: number }, monitor) => {
      if (!monitor.didDrop()) {
        onMoveCard(item.id, list.id);
      }
      setHoveredIndex(null);
      setIsBottomHovered(false);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }), [list.id, onMoveCard]);

  // Drop zone at the bottom of the list
  const [{ isOverBottom }, dropBottom] = useDrop(() => ({
    accept: 'CARD',
    hover: (item, monitor) => {
      if (monitor.isOver({ shallow: true })) {
        setIsBottomHovered(true);
        setHoveredIndex(null);
      } else {
        setIsBottomHovered(false);
      }
    },
    drop: (item: { id: string; listId: string }) => {
      onMoveCard(item.id, list.id, list.cards.length);
      setIsBottomHovered(false);
      setHoveredIndex(null);
    },
    collect: (monitor) => ({
      isOverBottom: monitor.isOver({ shallow: true }),
    }),
  }), [list.id, list.cards.length, onMoveCard]);

  // Cleanup bottom hover state when not hovering
  useEffect(() => {
    if (!isOverBottom) {
      setIsBottomHovered(false);
    }
  }, [isOverBottom]);

  return (
    <motion.div
      ref={drop}
      className="bg-white/80 backdrop-blur-sm rounded-lg p-3 min-w-[280px] max-w-[280px] flex flex-col shadow-sm"
      style={{
        minHeight: '200px',
        maxHeight: 'calc(100vh - 140px)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => {
              if (renameValue.trim()) {
                onRenameList(list.id, renameValue.trim());
              } else {
                setRenameValue(list.title);
              }
              setIsRenaming(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (renameValue.trim()) {
                  onRenameList(list.id, renameValue.trim());
                } else {
                  setRenameValue(list.title);
                }
                setIsRenaming(false);
              } else if (e.key === 'Escape') {
                setRenameValue(list.title);
                setIsRenaming(false);
              }
            }}
            autoFocus
            className="flex-1 px-2 py-1 rounded border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <h2 className="text-gray-700 flex-1">{list.title}</h2>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
              <MoreHorizontal className="w-4 h-4 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setIsRenaming(true)}>
              Rename list...
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onArchiveAllCards(list.id)}>
              Archive all cards
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onMoveList(list.id, 'left')}
              disabled={listIndex === 0}
            >
              Move list left
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onMoveList(list.id, 'right')}
              disabled={listIndex === totalLists - 1}
            >
              Move list right
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDeleteList(list.id)}
              className="text-red-600 focus:text-red-600"
            >
              Delete list...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="space-y-2 p-2">
          <AnimatePresence>
            {list.cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                listId={list.id}
                listTitle={list.title}
                onMoveCard={onMoveCard}
                onUpdateCard={onUpdateCard}
                onDelete={onDeleteCard}
                onHoverIndex={setHoveredIndex}
                hoveredIndex={hoveredIndex}
                primaryColor={primaryColor}
              />
            ))}
          </AnimatePresence>

          {isOver && list.cards.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-20 border-2 border-dashed border-gray-400 rounded-lg"
            />
          )}

          {/* Drop zone at the bottom */}
          <div
            ref={dropBottom}
            className="relative"
            style={{ minHeight: list.cards.length > 0 ? '40px' : '0px' }}
          >
            {isBottomHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 4 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-600 rounded w-full"
                style={{ height: '4px' }}
              />
            )}
          </div>
        </div>
      </div>

      <AddCard listId={list.id} listTitle={list.title} onAddCard={onAddCard} />
    </motion.div>
  );
}
