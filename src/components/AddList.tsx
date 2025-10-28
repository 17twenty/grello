import { useState, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useContrastColor } from '../utils/contrast';

interface AddListProps {
  onAddList: (title: string) => void;
}

export function AddList({ onAddList }: AddListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textColor = useContrastColor(buttonRef);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddList(title.trim());
      setTitle('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  return (
    <div className="min-w-[280px] max-w-[280px]">
      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleSubmit}
            className="bg-gray-100 rounded-lg p-4"
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter list title..."
              autoFocus
              className="bg-white mb-2"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={!title.trim()}>
                Add List
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={handleCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.form>
        ) : (
          <motion.button
            ref={buttonRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setIsAdding(true)}
            className="w-full bg-white/30 hover:bg-white/40 backdrop-blur-sm rounded-lg p-4 flex items-center gap-2 transition-all"
            style={{ color: textColor }}
          >
            <Plus className="w-5 h-5" />
            <span>Add another list</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
