import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Board } from './components/Board';
import { Sidebar } from './components/Sidebar';
import { CardDragLayer } from './components/CardDragLayer';
import { Toaster } from './components/ui/sonner';
import { Menu } from 'lucide-react';

// Helper function to get background gradient style
function getBackgroundStyle(background: string): string {
  const gradients: Record<string, string> = {
    'gradient-gray': 'linear-gradient(to bottom right, #f5f5f5, #d4d4d4)',
    'gradient-blue': 'linear-gradient(to bottom right, #dbeafe, #93c5fd)',
    'gradient-green': 'linear-gradient(to bottom right, #dcfce7, #86efac)',
    'gradient-purple': 'linear-gradient(to bottom right, #f3e8ff, #c084fc)',
    'gradient-pink': 'linear-gradient(to bottom right, #fce7f3, #f9a8d4)',
    'gradient-sunset': 'linear-gradient(to right, #F9D423, #FF4E50)',
  };
  return gradients[background] || gradients['gradient-gray'];
}

// Helper function to get primary color from background
export function getPrimaryColor(background: string): string {
  const colors: Record<string, string> = {
    'gradient-gray': '#9ca3af',
    'gradient-blue': '#3b82f6',
    'gradient-green': '#22c55e',
    'gradient-purple': '#a855f7',
    'gradient-pink': '#ec4899',
    'gradient-sunset': '#FF4E50',
  };
  return colors[background] || colors['gradient-gray'];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ActivityItem {
  id: string;
  type: 'comment' | 'created' | 'moved' | 'updated';
  user: string;
  text?: string;
  timestamp: Date;
  fromList?: string;
  toList?: string;
}

export interface Label {
  id: string;
  text: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  lastActivity: Date;
  listId: string;
  checklist?: ChecklistItem[];
  dueDate?: Date;
  assignees?: string[];
  coverImage?: string;
  coverColor?: string;
  activity?: ActivityItem[];
  labels?: Label[];
}

export interface List {
  id: string;
  title: string;
  cards: Card[];
}

export interface BoardType {
  id: string;
  name: string;
  lists: List[];
  background: string;
}

const initialBoards: BoardType[] = [
  {
    id: '1',
    name: "Nick's board of things",
    background: 'gradient-gray',
    lists: [
      {
        id: '1',
        title: 'Backlog',
        cards: [
          {
            id: '1',
            title: 'Onboarding flow',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            listId: '1',
            checklist: [
              { id: '1', text: 'Design wireframes', completed: true },
              { id: '2', text: 'User testing', completed: true },
            ],
            assignees: ['👤', '👥'],
          },
          {
            id: '2',
            title: 'Readiness for launch',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            listId: '1',
            checklist: [
              { id: '1', text: 'Final checks', completed: true },
              { id: '2', text: 'Deploy', completed: false },
              { id: '3', text: 'Monitor', completed: false },
            ],
            dueDate: new Date('2025-05-25'),
            assignees: ['👤'],
          },
          {
            id: '3',
            title: 'This is the main heading',
            description: 'Some additional details',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            listId: '1',
            checklist: [
              { id: '1', text: 'Task 1', completed: true },
              { id: '2', text: 'Task 2', completed: false },
            ],
            assignees: ['👤', '👥'],
          },
        ],
      },
      {
        id: '2',
        title: 'In Progress',
        cards: [
          {
            id: '4',
            title: 'I AM IN PROGRESS - MOVE ME HERE AS I HAVE A MAXIMUM LINE HEIGHT AND THIS BOX SHOULD GROW TO A MAXIMUM OF 128',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            listId: '2',
            checklist: [
              { id: '1', text: 'Step 1', completed: true },
              { id: '2', text: 'Step 2', completed: false },
              { id: '3', text: 'Step 3', completed: false },
            ],
            assignees: ['👤'],
          },
          {
            id: '5',
            title: 'I am another heading + description',
            description: 'Additional details',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            listId: '2',
          },
        ],
      },
      {
        id: '3',
        title: 'Done 🎉',
        cards: [
          {
            id: '6',
            title: 'Dummy Data - I AM DONE',
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            listId: '3',
            checklist: [{ id: '1', text: 'Completed', completed: true }],
          },
          {
            id: '7',
            title: 'Hi I am a placeholder - IGNORE ME',
            createdAt: new Date(),
            lastActivity: new Date(),
            listId: '3',
            coverColor: '#60a5fa',
          },
        ],
      },
      {
        id: '4',
        title: '📅 Aging Samples',
        cards: [
          {
            id: '8',
            title: 'Fresh card (today)',
            description: 'No aging - pristine white',
            createdAt: new Date(),
            lastActivity: new Date(),
            listId: '4',
          },
          {
            id: '9',
            title: '3 days old',
            description: 'Still fresh, no visible aging',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            listId: '4',
          },
          {
            id: '10',
            title: '1 week old',
            description: 'Just starting to age - very subtle yellowing begins',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            listId: '4',
            checklist: [
              { id: '1', text: 'Initial task', completed: true },
            ],
          },
          {
            id: '11',
            title: '2 weeks old',
            description: 'Light yellowing, subtle texture, brown border begins',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            listId: '4',
            checklist: [
              { id: '1', text: 'First milestone', completed: true },
              { id: '2', text: 'Second milestone', completed: false },
            ],
          },
          {
            id: '12',
            title: '3 weeks old',
            description: 'Noticeable yellowing, corner peel starts, age spots appear',
            createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
            listId: '4',
            dueDate: new Date('2025-03-15'),
          },
          {
            id: '13',
            title: '4 weeks old',
            description: 'Clear aging - medium yellow tone, visible texture & spots, edges darkening',
            createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
            listId: '4',
            assignees: ['👤'],
          },
          {
            id: '14',
            title: '5 weeks old',
            description: 'Heavy aging - deep yellow/sepia, pronounced texture, dark edges',
            createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            listId: '4',
            assignees: ['👤', '👥'],
          },
          {
            id: '15',
            title: '6 weeks old (maximum aging)',
            description: 'Fully aged - maximum yellowing, heavy texture, prominent spots & peeling',
            createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000),
            listId: '4',
            checklist: [
              { id: '1', text: 'Ancient task 1', completed: true },
              { id: '2', text: 'Ancient task 2', completed: true },
              { id: '3', text: 'Ancient task 3', completed: false },
            ],
          },
          {
            id: '16',
            title: '10 weeks old (stays at maximum)',
            description: 'Same as 6 weeks - aging caps at maximum level',
            createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
            listId: '4',
          },
        ],
      },
    ],
  },
];

function App() {
  const [boards, setBoards] = useState<BoardType[]>(initialBoards);
  const [currentBoardId, setCurrentBoardId] = useState(boards[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentBoard = boards.find((b) => b.id === currentBoardId) || boards[0];

  const updateBoard = (boardId: string, updates: Partial<BoardType>) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId ? { ...board, ...updates } : board
      )
    );
  };

  const moveCard = (cardId: string, targetListId: string, targetIndex?: number) => {
    const updatedLists = [...currentBoard.lists];
    let movedCard: Card | null = null;

    // Find and remove the card from its current list
    for (let i = 0; i < updatedLists.length; i++) {
      const index = updatedLists[i].cards.findIndex((c) => c.id === cardId);
      if (index !== -1) {
        movedCard = updatedLists[i].cards[index];
        updatedLists[i] = {
          ...updatedLists[i],
          cards: updatedLists[i].cards.filter((c) => c.id !== cardId),
        };
        break;
      }
    }

    if (!movedCard) return;

    // Add the card to the target list and refresh lastActivity
    const targetListIndex = updatedLists.findIndex((l) => l.id === targetListId);
    if (targetListIndex !== -1) {
      movedCard = { ...movedCard, listId: targetListId, lastActivity: new Date() };
      const newCards = [...updatedLists[targetListIndex].cards];

      if (targetIndex !== undefined) {
        newCards.splice(targetIndex, 0, movedCard);
      } else {
        newCards.push(movedCard);
      }

      updatedLists[targetListIndex] = {
        ...updatedLists[targetListIndex],
        cards: newCards,
      };
    }

    updateBoard(currentBoardId, { lists: updatedLists });
  };

  const addCard = (listId: string, card: Omit<Card, 'id' | 'createdAt' | 'lastActivity' | 'listId'>) => {
    const newCard: Card = {
      ...card,
      id: Date.now().toString(),
      createdAt: new Date(),
      lastActivity: new Date(),
      listId,
    };

    const updatedLists = currentBoard.lists.map((list) =>
      list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
    );

    updateBoard(currentBoardId, { lists: updatedLists });
  };

  const updateCard = (cardId: string, updates: Partial<Card>) => {
    const updatedLists = currentBoard.lists.map((list) => ({
      ...list,
      cards: list.cards.map((card) =>
        card.id === cardId ? { ...card, ...updates, lastActivity: new Date() } : card
      ),
    }));

    updateBoard(currentBoardId, { lists: updatedLists });
  };

  const deleteCard = (cardId: string) => {
    const updatedLists = currentBoard.lists.map((list) => ({
      ...list,
      cards: list.cards.filter((c) => c.id !== cardId),
    }));

    updateBoard(currentBoardId, { lists: updatedLists });
  };

  const addList = (title: string) => {
    const newList: List = {
      id: Date.now().toString(),
      title,
      cards: [],
    };
    updateBoard(currentBoardId, { lists: [...currentBoard.lists, newList] });
  };

  const renameList = (listId: string, newTitle: string) => {
    const updatedLists = currentBoard.lists.map((list) =>
      list.id === listId ? { ...list, title: newTitle } : list
    );
    updateBoard(currentBoardId, { lists: updatedLists });
  };

  const moveList = (listId: string, direction: 'left' | 'right') => {
    const currentIndex = currentBoard.lists.findIndex((l) => l.id === listId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= currentBoard.lists.length) return;

    const updatedLists = [...currentBoard.lists];
    const [removed] = updatedLists.splice(currentIndex, 1);
    updatedLists.splice(newIndex, 0, removed);

    updateBoard(currentBoardId, { lists: updatedLists });
  };

  const deleteList = (listId: string) => {
    const updatedLists = currentBoard.lists.filter((list) => list.id !== listId);
    updateBoard(currentBoardId, { lists: updatedLists });
  };

  const archiveAllCards = (listId: string) => {
    const updatedLists = currentBoard.lists.map((list) =>
      list.id === listId ? { ...list, cards: [] } : list
    );
    updateBoard(currentBoardId, { lists: updatedLists });
  };

  const addBoard = (name: string) => {
    const newBoard: BoardType = {
      id: Date.now().toString(),
      name,
      lists: [],
      background: 'gradient-gray',
    };
    setBoards([...boards, newBoard]);
    setCurrentBoardId(newBoard.id);
  };

  const deleteBoard = (boardId: string) => {
    if (boards.length === 1) return;
    const newBoards = boards.filter((b) => b.id !== boardId);
    setBoards(newBoards);
    if (currentBoardId === boardId) {
      setCurrentBoardId(newBoards[0].id);
    }
  };

  const updateBoardName = (name: string) => {
    updateBoard(currentBoardId, { name });
  };

  const updateBoardBackground = (background: string) => {
    updateBoard(currentBoardId, { background });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          boards={boards}
          currentBoardId={currentBoardId}
          onSelectBoard={setCurrentBoardId}
          onAddBoard={addBoard}
          onDeleteBoard={deleteBoard}
          onUpdateBackground={updateBoardBackground}
          currentBackground={currentBoard.background}
        />

        {/* Main content */}
        <div 
          className="flex-1 flex flex-col overflow-hidden min-w-0"
          style={{
            background: getBackgroundStyle(currentBoard.background)
          }}
        >
          {/* Header */}
          <div className="border-b border-gray-300 px-6 py-3 flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-black/5 rounded transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <input
              type="text"
              value={currentBoard.name}
              onChange={(e) => updateBoardName(e.target.value)}
              className="bg-transparent border-none outline-none text-gray-800 hover:bg-black/5 px-2 py-1 rounded transition-colors cursor-text text-xl font-bold"
            />
          </div>

          {/* Board */}
          <div className="flex-1 overflow-hidden">
            <Board
              lists={currentBoard.lists}
              onMoveCard={moveCard}
              onAddCard={addCard}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
              onAddList={addList}
              onRenameList={renameList}
              onMoveList={moveList}
              onDeleteList={deleteList}
              onArchiveAllCards={archiveAllCards}
              primaryColor={getPrimaryColor(currentBoard.background)}
            />
          </div>
        </div>

        <Toaster />
        <CardDragLayer />
      </div>
    </DndProvider>
  );
}

export default App;
