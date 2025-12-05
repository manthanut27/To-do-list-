import { Task, Project } from '@/types/todo';

const TASKS_KEY = 'tasks';
const PROJECTS_KEY = 'projects';

export const storage = {
  getTasks: (): Task[] => {
    try {
      const tasks = localStorage.getItem(TASKS_KEY);
      return tasks ? JSON.parse(tasks) : [];
    } catch {
      return [];
    }
  },

  saveTasks: (tasks: Task[]) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  getProjects: (): Project[] => {
    try {
      const projects = localStorage.getItem(PROJECTS_KEY);
      return projects ? JSON.parse(projects) : [];
    } catch {
      return [];
    }
  },

  saveProjects: (projects: Project[]) => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },
};
