import { Project } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Plus, Inbox, Calendar as CalendarIcon, CheckCircle2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectSidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onAddProject: () => void;
  taskCounts: Record<string, number>;
}

export function ProjectSidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onAddProject,
  taskCounts,
}: ProjectSidebarProps) {
  const { user, signOut } = useAuth();

  return (
    <aside className="w-64 border-r border-border bg-card p-4 flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">TaskFlow</h2>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <Button
          variant={selectedProjectId === null ? 'secondary' : 'ghost'}
          className="justify-start"
          onClick={() => onSelectProject(null)}
        >
          <Inbox className="w-4 h-4 mr-2" />
          All Tasks
          {taskCounts['all'] > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">{taskCounts['all']}</span>
          )}
        </Button>

        <Button
          variant={selectedProjectId === 'today' ? 'secondary' : 'ghost'}
          className="justify-start"
          onClick={() => onSelectProject('today')}
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Today
          {taskCounts['today'] > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">{taskCounts['today']}</span>
          )}
        </Button>

        <Button
          variant={selectedProjectId === 'completed' ? 'secondary' : 'ghost'}
          className="justify-start"
          onClick={() => onSelectProject('completed')}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Completed
          {taskCounts['completed'] > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">{taskCounts['completed']}</span>
          )}
        </Button>

        <div className="mt-6 mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Projects</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAddProject}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          {projects.map((project) => (
            <Button
              key={project.id}
              variant={selectedProjectId === project.id ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => onSelectProject(project.id)}
            >
              <span className="mr-2">{project.icon}</span>
              <span className="truncate">{project.name}</span>
              {taskCounts[project.id] > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">{taskCounts[project.id]}</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* User section at bottom */}
      <div className="mt-auto pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate flex-1" title={user?.email}>
            {user?.email}
          </p>
          <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
