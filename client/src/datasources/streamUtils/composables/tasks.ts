import { useAsync } from '@/utils/useAsync';

import {
  clearTaskAsActive,
  generateSubtaskVideosForTask,
  generateVideosForTask,
  getActiveTasks,
  setActiveTaskZoom,
  setTaskAction,
  setTaskAsActive,
  setTaskTodoCheck,
  toggleActiveTaskTodos,
} from '../endpoints/tasks';

export const useGetActiveTasks = () =>
  useAsync(getActiveTasks, { defaultValue: [] });
export const useSetTaskAction = () =>
  useAsync(setTaskAction, { defaultValue: null });
export const useGenerateVideosForTask = () =>
  useAsync(generateVideosForTask, { defaultValue: null });
export const useGenerateSubtaskVideosForTask = () =>
  useAsync(generateSubtaskVideosForTask, { defaultValue: null });
export const useToggleActiveTaskTodos = () =>
  useAsync(toggleActiveTaskTodos, { defaultValue: null });
export const useClearTaskAsActive = () =>
  useAsync(clearTaskAsActive, { defaultValue: null });
export const useSetTaskAsActive = () =>
  useAsync(setTaskAsActive, { defaultValue: null });
export const useSetTaskTodoCheck = () =>
  useAsync(setTaskTodoCheck, { defaultValue: null });
export const useSetActiveTaskZoom = () =>
  useAsync(setActiveTaskZoom, { defaultValue: null });
