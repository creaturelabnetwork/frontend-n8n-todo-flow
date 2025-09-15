import { useState, useRef, useEffect } from 'react';
import { Check, Edit2, Trash2, X } from 'lucide-react';
import { Todo } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
}

export const TodoItem = ({ todo, onUpdate, onDelete }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editTitle.trim() && editTitle !== todo.title) {
      onUpdate(todo.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const toggleComplete = () => {
    onUpdate(todo.id, { completed: !todo.completed });
  };

  return (
    <Card className="p-4 bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300 group border border-border/50">
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleComplete}
          className={cn(
            "w-6 h-6 p-0 rounded-full border-2 transition-all duration-300",
            todo.completed
              ? "bg-gradient-primary border-primary text-primary-foreground hover:bg-gradient-primary"
              : "border-muted-foreground/30 hover:border-primary hover:bg-accent"
          )}
        >
          {todo.completed && <Check className="w-3 h-3" />}
        </Button>

        {/* Todo Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 h-8 px-2 bg-background border-primary/20 focus:border-primary focus:shadow-focus"
                placeholder="Enter todo title..."
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="w-8 h-8 p-0 text-success hover:bg-success/10"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="w-8 h-8 p-0 text-muted-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p
              className={cn(
                "text-sm font-medium transition-all duration-300 cursor-pointer",
                todo.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground group-hover:text-primary"
              )}
              onClick={() => setIsEditing(true)}
            >
              {todo.title}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="w-8 h-8 p-0 text-muted-foreground hover:text-primary hover:bg-accent"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(todo.id)}
              className="w-8 h-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};