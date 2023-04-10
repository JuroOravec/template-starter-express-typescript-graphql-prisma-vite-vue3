import { streamUtilsClient } from "../streamUtilsClient";

/** Task statuses that we want to display */
export enum NotionTaskStatus {
  TO_DO = "To Do",
  DOING = "Doing",
}

export interface NotionTask {
  taskId: string;
  name: string;
  status: NotionTaskStatus;
  url: string;
}

export const genVideo = async ({ templateId, templateArgs }: { templateId: string; templateArgs: string }): Promise<NotionTask[]> => {
  return streamUtilsClient.post<NotionTask[]>('video_gen', {
    body: JSON.stringify({ templateId, templateArgs }),
  });
};
