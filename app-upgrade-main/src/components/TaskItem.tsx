import { Task } from '@/types/todo';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Calendar, Trash2, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

const priorityColors = {
  low: 'text-success',
  medium: 'text-warning',
  high: 'text-accent',
};

export function TaskItem({ task, onToggle, onDelete, onClick }: TaskItemProps) {
  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-4 rounded-xl bg-card border border-border",
        "hover:shadow-md hover:border-primary/20 transition-all duration-200",
        "animate-fade-in"
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="mt-1"
      />
      
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <h3
          className={cn(
            "font-medium text-foreground transition-all",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </h3>
        
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center gap-3 mt-2">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
          
          <span className={cn("flex items-center gap-1 text-xs", priorityColors[task.priority])}>
            <Flag className="w-3 h-3" />
            {task.priority}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(task.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );
}
