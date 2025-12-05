import { useState } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(50, 'Name must be less than 50 characters'),
});

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (project: { name: string; color: string; icon: string }) => void;
}

const icons = ['📁', '💼', '🎯', '🚀', '💡', '📊', '🎨', '🔧', '📱', '🏠'];
const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1'];

export function AddProjectDialog({ open, onOpenChange, onAdd }: AddProjectDialogProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(icons[0]);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = projectSchema.safeParse({ name: name.trim() });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    onAdd({
      name: name.trim(),
      color: selectedColor,
      icon: selectedIcon,
    });

    setName('');
    setSelectedIcon(icons[0]);
    setSelectedColor(colors[0]);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Project"
              className="mt-1.5"
              autoFocus
            />
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>

          <div>
            <Label>Icon</Label>
            <div className="grid grid-cols-5 gap-2 mt-1.5">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-2 text-2xl rounded-lg border-2 transition-all ${
                    selectedIcon === icon
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Color</Label>
            <div className="grid grid-cols-6 gap-2 mt-1.5">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-10 rounded-lg border-2 transition-all ${
                    selectedColor === color ? 'border-foreground scale-110' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
