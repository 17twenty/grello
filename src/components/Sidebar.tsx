import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Palette } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import type { BoardType } from '../App';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  boards: BoardType[];
  currentBoardId: string;
  onSelectBoard: (boardId: string) => void;
  onAddBoard: (name: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onUpdateBackground: (background: string) => void;
  currentBackground: string;
}

const backgrounds = [
  { 
    name: 'Light Gray', 
    value: 'gradient-gray',
    gradient: 'linear-gradient(to bottom right, #f5f5f5, #d4d4d4)'
  },
  { 
    name: 'Blue', 
    value: 'gradient-blue',
    gradient: 'linear-gradient(to bottom right, #dbeafe, #93c5fd)'
  },
  { 
    name: 'Green', 
    value: 'gradient-green',
    gradient: 'linear-gradient(to bottom right, #dcfce7, #86efac)'
  },
  { 
    name: 'Purple', 
    value: 'gradient-purple',
    gradient: 'linear-gradient(to bottom right, #f3e8ff, #c084fc)'
  },
  { 
    name: 'Pink', 
    value: 'gradient-pink',
    gradient: 'linear-gradient(to bottom right, #fce7f3, #f9a8d4)'
  },
  { 
    name: 'Sunset', 
    value: 'gradient-sunset',
    gradient: 'linear-gradient(to right, #F9D423, #FF4E50)'
  },
];

export function Sidebar({
  isOpen,
  onToggle,
  boards,
  currentBoardId,
  onSelectBoard,
  onAddBoard,
  onDeleteBoard,
  onUpdateBackground,
  currentBackground,
}: SidebarProps) {
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [showBackgrounds, setShowBackgrounds] = useState(false);

  const handleAddBoard = () => {
    if (newBoardName.trim()) {
      onAddBoard(newBoardName.trim());
      setNewBoardName('');
      setIsAddingBoard(false);
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden"
    >
      <div className="w-64 flex flex-col h-full">
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-gray-800">Workspace</h2>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* My Boards */}
          <div>
            <h3 className="text-gray-600 mb-2" style={{ fontSize: '0.7rem' }}>
              My Boards
            </h3>
            <div className="space-y-1">
              {boards.map((board) => (
                <div key={board.id} className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectBoard(board.id);
                    }}
                    className={`flex-1 text-left px-3 py-2 rounded transition-colors ${
                      currentBoardId === board.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {board.name}
                  </button>
                  {boards.length > 1 && (
                    <button
                      onClick={() => onDeleteBoard(board.id)}
                      className="p-2 hover:bg-red-100 rounded transition-colors"
                      aria-label="Delete board"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              ))}

              {/* Add Board */}
              {isAddingBoard ? (
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="Board name..."
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddBoard();
                      if (e.key === 'Escape') setIsAddingBoard(false);
                    }}
                  />
                  <Button size="sm" onClick={handleAddBoard}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingBoard(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add board</span>
                </button>
              )}
            </div>
          </div>

          <Separator />

          {/* Background */}
          <div>
            <button
              onClick={() => setShowBackgrounds(!showBackgrounds)}
              className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <Palette className="w-4 h-4" />
              <span>Change background</span>
            </button>

            <AnimatePresence>
              {showBackgrounds && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-2 space-y-1"
                >
                  {backgrounds.map((bg) => (
                    <button
                      key={bg.value}
                      onClick={() => {
                        onUpdateBackground(bg.value);
                        setShowBackgrounds(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                        currentBackground === bg.value
                          ? 'bg-blue-100'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{
                          background: bg.gradient
                        }}
                      />
                      <span className="text-gray-700">{bg.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div>
            <h3 className="text-gray-600 mb-2" style={{ fontSize: '0.7rem' }}>
              Quick Actions
            </h3>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors">
                View my tasks
              </button>
              <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors">
                View tasks due soon
              </button>
              <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors">
                View all attachments
              </button>
              <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors">
                Search this board
              </button>
            </div>
          </div>

          <Separator />

          {/* Board Settings */}
          <div>
            <h3 className="text-gray-600 mb-2" style={{ fontSize: '0.7rem' }}>
              Board Settings
            </h3>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors">
                Share this board
              </button>
              <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors">
                Lock this board
              </button>
              <button className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors">
                Integrations
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
