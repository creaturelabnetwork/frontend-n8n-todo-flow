import { useState } from 'react';
import { Plus, CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { Todo } from '@/types/todo';
import { todoService } from '@/services/todoService';
import { TodoItem } from '@/components/TodoItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { toast } = useToast();

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    setIsLoading(true);
    try {
      const newTodo = await todoService.createTodo({ title: newTodoTitle.trim() });
      setTodos(prev => [newTodo, ...prev]);
      setNewTodoTitle('');
      toast({
        title: "Todo created",
        description: "Your todo has been added successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create todo. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updates, updatedAt: new Date() } : todo
    ));

    try {
      await todoService.updateTodo({ id, ...updates });
      toast({
        title: "Todo updated",
        description: "Your changes have been saved!",
      });
    } catch (error) {
      // Revert optimistic update
      setTodos(prev => prev.map(todo => 
        todo.id === id ? todos.find(t => t.id === id) || todo : todo
      ));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update todo. Please try again.",
      });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    const todoToDelete = todos.find(t => t.id === id);
    setTodos(prev => prev.filter(todo => todo.id !== id));

    try {
      await todoService.deleteTodo({ id });
      toast({
        title: "Todo deleted",
        description: "Your todo has been removed successfully!",
      });
    } catch (error) {
      // Revert optimistic update
      if (todoToDelete) {
        setTodos(prev => [todoToDelete, ...prev]);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete todo. Please try again.",
      });
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.length - completedCount;

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-medium">
              <ListTodo className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Todo App
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Stay organized and get things done
          </p>
        </div>

        {/* Add Todo Form */}
        <Card className="p-6 mb-6 bg-gradient-card shadow-medium border border-border/50">
          <form onSubmit={handleCreateTodo} className="flex gap-3">
            <Input
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 h-12 px-4 bg-background border-primary/20 focus:border-primary focus:shadow-focus transition-all duration-300"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={!newTodoTitle.trim() || isLoading}
              className="h-12 px-6 bg-gradient-primary hover:bg-gradient-primary hover:scale-105 shadow-soft hover:shadow-medium transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Todo
            </Button>
          </form>
        </Card>

        {/* Stats and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Circle className="w-4 h-4" />
              {activeCount} active
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {completedCount} completed
            </span>
          </div>

          <div className="flex bg-muted rounded-lg p-1">
            {(['all', 'active', 'completed'] as const).map((filterOption) => (
              <Button
                key={filterOption}
                variant="ghost"
                size="sm"
                onClick={() => setFilter(filterOption)}
                className={cn(
                  "px-3 py-1 text-xs font-medium transition-all duration-200",
                  filter === filterOption
                    ? "bg-background shadow-soft text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <Card className="p-8 text-center bg-gradient-card shadow-soft border border-border/50">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ListTodo className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg">
                {filter === 'all' 
                  ? "No todos yet. Add your first task above!"
                  : filter === 'active'
                  ? "No active todos. Great job!"
                  : "No completed todos yet. Get started!"
                }
              </p>
            </Card>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onUpdate={handleUpdateTodo}
                onDelete={handleDeleteTodo}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};