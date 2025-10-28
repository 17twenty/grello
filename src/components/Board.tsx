import { List } from './List';
import { AddList } from './AddList';
import type { List as ListType, Card } from '../App';

interface BoardProps {
  lists: ListType[];
  onMoveCard: (cardId: string, targetListId: string, targetIndex?: number) => void;
  onAddCard: (listId: string, card: Omit<Card, 'id' | 'createdAt' | 'lastActivity' | 'listId'>) => void;
  onUpdateCard: (cardId: string, updates: Partial<Card>) => void;
  onDeleteCard: (cardId: string) => void;
  onAddList: (title: string) => void;
  onRenameList: (listId: string, newTitle: string) => void;
  onMoveList: (listId: string, direction: 'left' | 'right') => void;
  onDeleteList: (listId: string) => void;
  onArchiveAllCards: (listId: string) => void;
  primaryColor: string;
}

export function Board({ 
  lists, 
  onMoveCard, 
  onAddCard, 
  onUpdateCard, 
  onDeleteCard, 
  onAddList,
  onRenameList,
  onMoveList,
  onDeleteList,
  onArchiveAllCards,
  primaryColor,
}: BoardProps) {
  return (
    <div className="h-full overflow-x-auto overflow-y-hidden">
      <div className="flex gap-4 p-6 h-full items-start">
        {lists.map((list, index) => (
          <List
            key={list.id}
            list={list}
            listIndex={index}
            totalLists={lists.length}
            onMoveCard={onMoveCard}
            onAddCard={onAddCard}
            onUpdateCard={onUpdateCard}
            onDeleteCard={onDeleteCard}
            onRenameList={onRenameList}
            onMoveList={onMoveList}
            onDeleteList={onDeleteList}
            onArchiveAllCards={onArchiveAllCards}
            primaryColor={primaryColor}
          />
        ))}
        <AddList onAddList={onAddList} />
      </div>
    </div>
  );
}
