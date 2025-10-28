import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CardDialog } from './CardDialog';
import type { Card } from '../App';

interface AddCardProps {
  listId: string;
  listTitle: string;
  onAddCard: (listId: string, card: Omit<Card, 'id' | 'createdAt' | 'lastActivity' | 'listId'>) => void;
}

export function AddCard({ listId, listTitle, onAddCard }: AddCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = (listId: string, card: Omit<Card, 'id' | 'createdAt' | 'lastActivity' | 'listId'>) => {
    onAddCard(listId, card);
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="mt-2">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="w-full flex items-center gap-2 p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add a card</span>
        </button>
      </div>

      <CardDialog
        listId={listId}
        listTitle={listTitle}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreate={handleCreate}
      />
    </>
  );
}
