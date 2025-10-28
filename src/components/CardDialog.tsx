import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { 
  Trash2, Plus, X, Calendar, CreditCard, 
  Eye, UserPlus, Tag, CheckSquare, Paperclip, Image as ImageIcon,
  Copy, Archive, Share2, Menu, MessageSquare, GripVertical
} from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
import ReactMarkdown from 'react-markdown';
import type { Card, ChecklistItem as ChecklistItemType, ActivityItem, Label } from '../App';
import { Badge } from './ui/badge';

interface DraggableChecklistItemProps {
  item: ChecklistItemType;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  toggleItem: (itemId: string) => void;
  deleteItem: (itemId: string) => void;
  editingItemId: string | null;
  editedText: string;
  setEditingItemId: (id: string | null) => void;
  setEditedText: (text: string) => void;
  updateItemText: () => void;
}

function DraggableChecklistItem({
  item,
  index,
  moveItem,
  toggleItem,
  deleteItem,
  editingItemId,
  editedText,
  setEditingItemId,
  setEditedText,
  updateItemText,
}: DraggableChecklistItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'CHECKLIST_ITEM',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'CHECKLIST_ITEM',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className="flex items-start gap-3 group"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div
        ref={drag}
        className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing pt-0.5 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <Checkbox
        checked={item.completed}
        onCheckedChange={() => toggleItem(item.id)}
        className="mt-0.5"
      />
      {editingItemId === item.id ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateItemText();
              if (e.key === 'Escape') {
                setEditingItemId(null);
                setEditedText('');
              }
            }}
            onBlur={updateItemText}
            className="h-8 text-sm"
            autoFocus
          />
        </div>
      ) : (
        <span
          onClick={() => {
            setEditingItemId(item.id);
            setEditedText(item.text);
          }}
          className={`flex-1 cursor-pointer hover:bg-gray-50 -my-1 py-1 px-2 -ml-2 rounded transition-colors ${
            item.completed ? 'line-through text-gray-500' : 'text-gray-900'
          }`}
        >
          {item.text}
        </span>
      )}
      <button
        onClick={() => deleteItem(item.id)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all"
      >
        <Trash2 className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}

interface CardDialogProps {
  card?: Card;
  listId: string;
  listTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (cardId: string, updates: Partial<Card>) => void;
  onCreate?: (listId: string, card: Omit<Card, 'id' | 'createdAt' | 'lastActivity' | 'listId'>) => void;
  onDelete?: (cardId: string) => void;
  primaryColor?: string;
}

export function CardDialog({ card, listId, listTitle, isOpen, onClose, onUpdate, onCreate, onDelete, primaryColor = '#22c55e' }: CardDialogProps) {
  const isCreating = !card;
  const [title, setTitle] = useState(card?.title || '');
  const [description, setDescription] = useState(card?.description || '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(card?.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommentFocused, setIsCommentFocused] = useState(false);
  const [coverColor, setCoverColor] = useState(card?.coverColor || '');
  const [coverImage, setCoverImage] = useState(card?.coverImage || '');
  const [activity, setActivity] = useState<ActivityItem[]>(card?.activity || [
    {
      id: '1',
      type: 'created',
      user: 'Nick Glynn',
      timestamp: card?.createdAt || new Date(),
    }
  ]);
  const [labels, setLabels] = useState<Label[]>(card?.labels || []);
  const [newLabelText, setNewLabelText] = useState('');
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [editingChecklistItemId, setEditingChecklistItemId] = useState<string | null>(null);
  const [editedChecklistText, setEditedChecklistText] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(card?.dueDate);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setChecklist(card.checklist || []);
      setCoverColor(card.coverColor || '');
      setCoverImage(card.coverImage || '');
      setActivity(card.activity || [
        {
          id: '1',
          type: 'created',
          user: 'Nick Glynn',
          timestamp: card.createdAt,
        }
      ]);
      setLabels(card.labels || []);
      setDueDate(card.dueDate);
    } else {
      // Reset for new card
      setTitle('');
      setDescription('');
      setChecklist([]);
      setCoverColor('');
      setCoverImage('');
      setActivity([]);
      setLabels([]);
      setDueDate(undefined);
      setIsEditingDescription(false);
      setIsCommentFocused(false);
    }
  }, [card, isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [description]);

  const handleSave = () => {
    if (isCreating) {
      // For new cards, we'll handle save on close with the Create button
      return;
    }
    if (card && onUpdate) {
      onUpdate(card.id, {
        title,
        description: description || undefined,
        checklist: checklist.length > 0 ? checklist : undefined,
        coverColor: coverColor || undefined,
        coverImage: coverImage || undefined,
        activity: activity,
        labels: labels.length > 0 ? labels : undefined,
        dueDate: dueDate,
      });
    }
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    
    if (onCreate) {
      onCreate(listId, {
        title: title.trim(),
        description: description || undefined,
        checklist: checklist.length > 0 ? checklist : undefined,
        coverColor: coverColor || undefined,
        coverImage: coverImage || undefined,
        activity: activity.length > 0 ? activity : undefined,
        labels: labels.length > 0 ? labels : undefined,
      });
    }
    onClose();
  };

  const addComment = () => {
    if (newComment.trim()) {
      const newActivity: ActivityItem = {
        id: Date.now().toString(),
        type: 'comment',
        user: 'You',
        text: newComment.trim(),
        timestamp: new Date(),
      };
      const updatedActivity = [...activity, newActivity];
      setActivity(updatedActivity);
      if (card && onUpdate) {
        onUpdate(card.id, { activity: updatedActivity });
      }
      setNewComment('');
      setIsCommentFocused(false);
    }
  };

  const setCover = (type: 'color' | 'image', value: string) => {
    if (type === 'color') {
      setCoverColor(value);
      setCoverImage('');
      if (card && onUpdate) {
        onUpdate(card.id, { coverColor: value, coverImage: undefined });
      }
    } else {
      setCoverImage(value);
      setCoverColor('');
      if (card && onUpdate) {
        onUpdate(card.id, { coverImage: value, coverColor: undefined });
      }
    }
  };

  const handleDelete = () => {
    if (card && onDelete) {
      onDelete(card.id);
      onClose();
    }
  };

  const toggleChecklistItem = (itemId: string) => {
    const updatedChecklist = checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updatedChecklist);
    if (card && onUpdate) {
      onUpdate(card.id, { checklist: updatedChecklist });
    }
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newChecklistItem.trim(),
        completed: false,
      };
      const updatedChecklist = [...checklist, newItem];
      setChecklist(updatedChecklist);
      if (card && onUpdate) {
        onUpdate(card.id, { checklist: updatedChecklist });
      }
      setNewChecklistItem('');
      setIsAddingChecklistItem(false);
    }
  };

  const deleteChecklistItem = (itemId: string) => {
    const updatedChecklist = checklist.filter((item) => item.id !== itemId);
    setChecklist(updatedChecklist);
    if (card && onUpdate) {
      onUpdate(card.id, { checklist: updatedChecklist.length > 0 ? updatedChecklist : undefined });
    }
  };

  const updateChecklistItemText = () => {
    if (editedChecklistText.trim() && editingChecklistItemId) {
      const updatedChecklist = checklist.map((item) =>
        item.id === editingChecklistItemId ? { ...item, text: editedChecklistText.trim() } : item
      );
      setChecklist(updatedChecklist);
      if (card && onUpdate) {
        onUpdate(card.id, { checklist: updatedChecklist });
      }
      setEditingChecklistItemId(null);
      setEditedChecklistText('');
    }
  };

  const moveChecklistItem = (dragIndex: number, hoverIndex: number) => {
    const updatedChecklist = [...checklist];
    const [draggedItem] = updatedChecklist.splice(dragIndex, 1);
    updatedChecklist.splice(hoverIndex, 0, draggedItem);
    setChecklist(updatedChecklist);
    if (card && onUpdate) {
      onUpdate(card.id, { checklist: updatedChecklist });
    }
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const coverColors = [
    '#0079BF', '#D29034', '#519839', '#B04632', '#89609E',
    '#CD5A91', '#4BBF6B', '#00AECC', '#838C91'
  ];

  const addLabel = () => {
    if (newLabelText.trim()) {
      const newLabel: Label = {
        id: Date.now().toString(),
        text: newLabelText.trim(),
      };
      const updatedLabels = [...labels, newLabel];
      setLabels(updatedLabels);
      if (card && onUpdate) {
        onUpdate(card.id, { labels: updatedLabels });
      }
      setNewLabelText('');
      setIsAddingLabel(false);
    }
  };

  const removeLabel = (labelId: string) => {
    const updatedLabels = labels.filter((label) => label.id !== labelId);
    setLabels(updatedLabels);
    if (card && onUpdate) {
      onUpdate(card.id, { labels: updatedLabels.length > 0 ? updatedLabels : undefined });
    }
  };

  const formatDueDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const handleSetDueDate = (date: Date | undefined) => {
    setDueDate(date);
    if (card && onUpdate) {
      onUpdate(card.id, { dueDate: date });
    }
  };

  const formatActivityTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-h-[90vh] overflow-hidden p-0"
        style={{ width: '95%', maxWidth: '768px' }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Edit card details, description, and checklist items
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Cover Image/Color */}
          {(coverImage || coverColor) && (
            <div 
              className="w-full h-40 flex-shrink-0"
              style={{
                backgroundColor: coverColor || undefined,
                backgroundImage: coverImage ? `url(${coverImage})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}

          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <div className="flex items-start gap-4">
              <CreditCard className="w-6 h-6 text-gray-700 mt-2 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSave}
                  placeholder={isCreating ? "Enter card title..." : ""}
                  className="border-none p-0 h-auto focus-visible:ring-0 mb-1 -ml-1 select-text text-3xl! font-bold! resize-none overflow-hidden bg-transparent hover:bg-gray-50 transition-colors leading-tight!"
                  autoFocus={isCreating}
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
                <p className="text-sm text-gray-600">
                  in list <span className="underline">{listTitle}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex gap-6 px-8 pb-8">
              {/* Left column */}
              <div className="flex-1 space-y-8 min-w-0">
                {/* Members, Labels & Notifications */}
                <div className="flex items-start gap-8 flex-wrap">
                  <div>
                    <span className="text-xs text-gray-600 block mb-3">Members</span>
                    <div className="flex items-center gap-1">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          KF
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 hover:border-gray-400">
                        <Plus className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 block mb-3">Labels</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {labels.map((label) => (
                        <Badge 
                          key={label.id}
                          variant="secondary"
                          className="h-8 px-3 cursor-pointer hover:bg-gray-300 transition-colors"
                          onClick={() => removeLabel(label.id)}
                        >
                          {label.text}
                          <X className="w-3 h-3 ml-1.5" />
                        </Badge>
                      ))}
                      {isAddingLabel ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={newLabelText}
                            onChange={(e) => setNewLabelText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') addLabel();
                              if (e.key === 'Escape') {
                                setNewLabelText('');
                                setIsAddingLabel(false);
                              }
                            }}
                            onBlur={() => {
                              if (!newLabelText.trim()) setIsAddingLabel(false);
                            }}
                            placeholder="UX, Bug, etc."
                            className="h-8 w-32 text-sm"
                            autoFocus
                          />
                          <Button 
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={addLabel}
                          >
                            <CheckSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="w-8 h-8 rounded border-2 border-dashed border-gray-300 hover:border-gray-400"
                          onClick={() => setIsAddingLabel(true)}
                        >
                          <Plus className="w-4 h-4 text-gray-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600 block mb-3">Notifications</span>
                    <Button variant="outline" size="sm" className="h-9">
                      <Eye className="w-4 h-4 mr-1" />
                      Watch
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Menu className="w-5 h-5 text-gray-700" />
                    <h3 className="text-gray-900 font-semibold">Description</h3>
                  </div>
                  {isEditingDescription ? (
                    <div>
                      <Textarea
                        ref={textareaRef}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a more detailed description... (Markdown supported)"
                        className="mb-2 resize-none overflow-y-auto font-mono text-sm w-full"
                        style={{ minHeight: '120px', maxHeight: '60vh' }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setIsEditingDescription(false);
                            handleSave();
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDescription(card?.description || '');
                            setIsEditingDescription(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Tip: Use **bold**, *italic*, # headings, - lists, and more
                      </p>
                    </div>
                  ) : description ? (
                    <div
                      onClick={() => setIsEditingDescription(true)}
                      className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 cursor-pointer transition-colors prose prose-sm max-w-none min-h-[100px]"
                    >
                      <ReactMarkdown>{description}</ReactMarkdown>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingDescription(true)}
                      className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-600 transition-colors"
                    >
                      Add a more detailed description...
                    </button>
                  )}
                </div>

                {/* Checklist */}
                {checklist.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="w-5 h-5 text-gray-700" />
                        <h3 className="text-gray-900 font-semibold">Checklist</h3>
                      </div>
                      <span className="text-xs text-gray-600">
                        {completedCount}/{totalCount}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-5">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progressPercent}%`, backgroundColor: primaryColor }}
                      />
                    </div>

                    <div className="space-y-3">
                      {checklist.map((item, index) => (
                        <DraggableChecklistItem
                          key={item.id}
                          item={item}
                          index={index}
                          moveItem={moveChecklistItem}
                          toggleItem={toggleChecklistItem}
                          deleteItem={deleteChecklistItem}
                          editingItemId={editingChecklistItemId}
                          editedText={editedChecklistText}
                          setEditingItemId={setEditingChecklistItemId}
                          setEditedText={setEditedChecklistText}
                          updateItemText={updateChecklistItemText}
                        />
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-9 text-gray-600 hover:bg-gray-100 mt-2"
                        onClick={() => setIsAddingChecklistItem(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add item
                      </Button>
                    </div>
                  </div>
                )}

                {/* Activity */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-gray-700" />
                      <h3 className="text-gray-900 font-semibold">Activity</h3>
                    </div>
                    <Button variant="ghost" size="sm">
                      Hide details
                    </Button>
                  </div>

                  {/* Comment input */}
                  <div className="flex gap-2 mb-4">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                        Y
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      {isCommentFocused ? (
                        <div>
                          <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onBlur={() => {
                              if (!newComment.trim()) setIsCommentFocused(false);
                            }}
                            placeholder="Write a comment..."
                            className="mb-2 resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={addComment}>
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setNewComment('');
                                setIsCommentFocused(false);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsCommentFocused(true)}
                          className="w-full text-left p-2 bg-white border border-gray-200 hover:border-gray-300 rounded text-sm text-gray-600 transition-colors"
                        >
                          Write a comment...
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Activity log */}
                  <div className="space-y-3">
                    {activity.slice().reverse().map((item) => (
                      <div key={item.id} className="flex gap-2">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                            {item.user.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          {item.type === 'comment' ? (
                            <>
                              <p className="text-sm mb-1">
                                <span className="font-semibold">{item.user}</span>{' '}
                                <span className="text-gray-600">{formatActivityTime(item.timestamp)}</span>
                              </p>
                              <div className="bg-white border border-gray-200 rounded p-3 text-sm">
                                {item.text}
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">{item.user}</span>{' '}
                              {item.type === 'created' && 'created this card'}
                              {item.type === 'moved' && `moved this card from ${item.fromList} to ${item.toList}`}
                              {item.type === 'updated' && item.text}
                              {' '}
                              <span className="text-gray-500">{formatActivityTime(item.timestamp)}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right sidebar */}
              <div className="w-48 flex-shrink-0 space-y-2">
                {/* Add to card */}
                <div>
                  <span className="text-xs text-gray-600 block mb-3">Add to card</span>
                  <div className="space-y-1.5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start h-9 bg-gray-100 hover:bg-gray-200 border-0"
                      onClick={() => setIsAddingChecklistItem(true)}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Checklist
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-start h-9 bg-gray-100 hover:bg-gray-200 border-0">
                          <Calendar className="w-4 h-4 mr-2" />
                          {dueDate ? `Due ${formatDueDate(dueDate)}` : 'Set Due Date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">Due Date</h4>
                            {dueDate && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleSetDueDate(undefined)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <CalendarComponent
                            mode="single"
                            selected={dueDate}
                            onSelect={handleSetDueDate}
                            initialFocus
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="sm" className="w-full justify-start h-9 bg-gray-100 hover:bg-gray-200 border-0">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Attach File
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-start h-9 bg-gray-100 hover:bg-gray-200 border-0">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Cover
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="start">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Cover</h4>
                          
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Colors</p>
                            <div className="grid grid-cols-5 gap-2">
                              {coverColors.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => setCover('color', color)}
                                  className="h-10 rounded hover:opacity-80 transition-opacity ring-2 ring-offset-2 ring-transparent hover:ring-gray-400"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 mb-2">Image URL</p>
                            <div className="flex gap-2">
                              <Input
                                placeholder="https://example.com/image.jpg"
                                value={coverImage}
                                onChange={(e) => setCoverImage(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setCover('image', coverImage);
                                  }
                                }}
                              />
                              <Button 
                                size="sm" 
                                onClick={() => setCover('image', coverImage)}
                              >
                                Set
                              </Button>
                            </div>
                          </div>

                          {(coverColor || coverImage) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => {
                                setCoverColor('');
                                setCoverImage('');
                                if (card && onUpdate) {
                                  onUpdate(card.id, { coverColor: undefined, coverImage: undefined });
                                }
                              }}
                            >
                              Remove Cover
                            </Button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Add checklist item dialog */}
                {isAddingChecklistItem && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsAddingChecklistItem(false)}>
                    <div className="bg-white rounded-lg p-4 w-80" onClick={(e) => e.stopPropagation()}>
                      <h3 className="mb-3">Add checklist item</h3>
                      <Input
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                        placeholder="Add an item..."
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addChecklistItem();
                          if (e.key === 'Escape') setIsAddingChecklistItem(false);
                        }}
                        className="mb-3"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={addChecklistItem}>
                          Add
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsAddingChecklistItem(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                {isCreating ? (
                  <div className="space-y-2">
                    <Button 
                      className="w-full"
                      onClick={handleCreate}
                      disabled={!title.trim()}
                    >
                      Create Card
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-xs text-gray-600 block mb-3">Actions</span>
                      <div className="space-y-1.5">
                        <Button variant="outline" size="sm" className="w-full justify-start h-9 bg-gray-100 hover:bg-gray-200 border-0">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start h-9 bg-gray-100 hover:bg-gray-200 border-0">
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-start h-9 bg-gray-100 hover:bg-gray-200 border-0">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start h-9 text-red-600 hover:text-red-600 hover:bg-red-50 border-0 bg-gray-100"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
