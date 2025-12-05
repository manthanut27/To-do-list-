import { useState } from 'react';
import { TaskItem } from '@/components/TaskItem';
import { AddTaskDialog } from '@/components/AddTaskDialog';
import { AddProjectDialog } from '@/components/AddProjectDialog';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { isToday } from 'date-fns';
import { useProjects } from '@/hooks/useProjects';
import { useTasks } from '@/hooks/useTasks';

const Index = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);

  const { projects, isLoading: projectsLoading, createProject } = useProjects();
  const { tasks, isLoading: tasksLoading, createTask, toggleTask, deleteTask } = useTasks();

  const isLoading = projectsLoading || tasksLoading;

  const getFilteredTasks = () => {
    if (selectedProjectId === 'today') {
      return tasks.filter(
        (task) => !task.completed && task.due_date && isToday(new Date(task.due_date))
      );
    }
    if (selectedProjectId === 'completed') {
      return tasks.filter((task) => task.completed);
    }
    if (selectedProjectId === null) {
      return tasks.filter((task) => !task.completed);
    }
    return tasks.filter((task) => task.project_id === selectedProjectId && !task.completed);
  };

  const getTaskCounts = () => {
    const counts: Record<string, number> = {
      all: tasks.filter((t) => !t.completed).length,
      today: tasks.filter((t) => !t.completed && t.due_date && isToday(new Date(t.due_date))).length,
      completed: tasks.filter((t) => t.completed).length,
    };

    projects.forEach((project) => {
      counts[project.id] = tasks.filter(
        (t) => t.project_id === project.id && !t.completed
      ).length;
    });

    return counts;
  };

  const getTitle = () => {
    if (selectedProjectId === 'today') return 'Today';
    if (selectedProjectId === 'completed') return 'Completed';
    if (selectedProjectId === null) return 'All Tasks';
    return projects.find((p) => p.id === selectedProjectId)?.name || 'Tasks';
  };

  const handleAddTask = (taskData: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    projectId: string;
    dueDate?: string;
  }) => {
    createTask({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      project_id: taskData.projectId,
      due_date: taskData.dueDate,
    });
  };

  const handleAddProject = (projectData: { name: string; color: string; icon: string }) => {
    createProject(projectData);
  };

  const filteredTasks = getFilteredTasks();

  // Convert projects to the format expected by ProjectSidebar and AddTaskDialog
  const projectsForSidebar = projects.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    icon: p.icon,
  }));

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <ProjectSidebar
        projects={projectsForSidebar}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onAddProject={() => setAddProjectOpen(true)}
        taskCounts={getTaskCounts()}
      />

      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{getTitle()}</h1>
              <p className="text-muted-foreground">
                {filteredTasks.length === 0
                  ? 'No tasks yet'
                  : `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'}`}
              </p>
            </div>

            {selectedProjectId !== 'completed' && (
              <Button onClick={() => setAddTaskOpen(true)} size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Add Task
              </Button>
            )}
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-medium text-foreground mb-2">No tasks here</h3>
              <p className="text-muted-foreground mb-6">
                {selectedProjectId === 'completed'
                  ? "You haven't completed any tasks yet"
                  : 'Create your first task to get started'}
              </p>
              {selectedProjectId !== 'completed' && (
                <Button onClick={() => setAddTaskOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={{
                    id: task.id,
                    title: task.title,
                    description: task.description || undefined,
                    completed: task.completed,
                    priority: task.priority,
                    projectId: task.project_id,
                    dueDate: task.due_date || undefined,
                    createdAt: task.created_at,
                  }}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onClick={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddTaskDialog
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
        onAdd={handleAddTask}
        projects={projectsForSidebar}
        selectedProjectId={
          selectedProjectId === 'today' || selectedProjectId === 'completed' || selectedProjectId === null
            ? undefined
            : selectedProjectId
        }
      />

      <AddProjectDialog
        open={addProjectOpen}
        onOpenChange={setAddProjectOpen}
        onAdd={handleAddProject}
      />
    </div>
  );
};

export default Index;
