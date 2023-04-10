import { streamUtilsClient } from "../streamUtilsClient";

/**
 * Task statuses that we want to display
 * Source of truth is in firebase functions project.
 */
export enum NotionTaskStatus {
  BACKLOG = "Backlog",
  TO_DO = "To Do",
  DOING = "Doing",
}

/**
 * Task actions that can be made in the control panel
 *
 * Source of truth is in firebase functions project.
 */
export enum NotionTaskAction {
  AVAILABLE = "available",
  START = "start",
  COMPLETE = "complete",
  ABANDON = "abandon",
}

export interface NotionTaskTodo {
  todoBlockId: string;
  checked: boolean;
  text: string;
}

export interface NotionTask {
  taskId: string;
  name: string;
  status: NotionTaskStatus;
  url: string;
  todos: NotionTaskTodo[];
}

export const getActiveTasks = async (): Promise<NotionTask[]> => {
  return (await streamUtilsClient.get<{ response: NotionTask[] }>('notionTaskGetAllActive')).response;
};

export const setTaskAction = (taskId: string, action: NotionTaskAction) => {
  return streamUtilsClient.get<void>(`notionTaskAction?taskId=${taskId}&action=${action}`);
}

export const setTaskTodoCheck = ({taskId, todoBlockId, checked}: {taskId: string, todoBlockId: string, checked: boolean}) => {
  return streamUtilsClient.get<void>(`notionTaskTodoCheck?taskId=${taskId}&todoBlockId=${todoBlockId}${checked ? '&checked' : ''}`);
}

export const setTaskAsActive = ({taskId}: {taskId: string}) => {
  return streamUtilsClient.get<void>(`notionTaskActiveTaskActivate?taskId=${taskId}`);
}

export const clearTaskAsActive = () => {
  return streamUtilsClient.get<void>('notionTaskActiveTaskClear');
}

export const toggleActiveTaskTodos = () => {
  return streamUtilsClient.get<void>(`notionTaskActiveTaskTodoToggle`);
}

export const setActiveTaskZoom = ({zoom}: {zoom: number}) => {
  return streamUtilsClient.get<void>(`notionTaskActiveTaskOverlayZoom?zoom=${zoom}`);
}

export const generateVideosForTask = async (taskId: string): Promise<void> => {
  return streamUtilsClient.get<void>(`notionTaskGenerateVideos?taskId=${taskId}`);
};

export const generateSubtaskVideosForTask = async (taskId: string): Promise<void> => {
  return streamUtilsClient.get<void>(`notionTaskSubtaskGenerateVideos?taskId=${taskId}`);
};
