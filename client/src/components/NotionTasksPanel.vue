<template>
  <div class="pa-8">
    <div class="d-flex">
      <h2 class="text-h3 pb-8">Notion Tasks Panel</h2>
      <v-spacer />

      <v-tooltip bottom>
        <template #activator="{ props }">
          <v-btn
            :disabled="isLoadingTasks"
            size="x-small"
            class="ml-3 px-3 py-5"
            @click="loadTasks"
            v-bind="props"
          >
            <v-progress-circular
              v-if="isLoadingTasks"
              indeterminate
              size=18
              color="secondary"
            />
            <v-icon v-else size="x-large">
              mdi-refresh
            </v-icon>
          </v-btn>
        </template>
        <span>Refetch all tasks</span>
      </v-tooltip>
    </div>

    <div class="pb-8 text-red text-body-2">
      <div v-if="tasksLoadError">
        Failed to load tasks: {{ tasksLoadError }}
      </div>
    </div>

    <h3 class="text-h4 pb-8">
      Overlay Settings
    </h3>

    <div class="NotionTasksPanel__btnGroupContainer pb-8">
      <div class="NotionTasksPanel__btnGroup">
        <v-btn
          class="NotionTasksPanel__btn"
          :disabled="isClearingActiveTask"
          @click="clearActiveTask">
          Clear active task
          <v-progress-circular
            v-if="isClearingActiveTask"
            indeterminate
            class="ml-2"
            size=20
            color="secondary"
          />
        </v-btn>
        <p v-if="activeTaskClearError" class="text-red text-body-2">
          Failed to clear active task: {{ activeTaskClearError }}
        </p>

        <v-btn
          class="NotionTasksPanel__btn"
          :disabled="isTogglingTodos"
          @click="toggleTodos">
          Toggle todos
          <v-progress-circular
            v-if="isTogglingTodos"
            indeterminate
            class="ml-2"
            size=20
            color="secondary"
          />
        </v-btn>
        <p v-if="toggleTodosError" class="text-red text-body-2">
          Failed to toggle todos: {{ toggleTodosError }}
        </p>
      </div>

      <div class="NotionTasksPanel__btnGroup">
        <div class="d-flex">
          <v-text-field
            :model-value="zoom"
            variant="outlined"
            density="compact"
            label="Zoom"
            hide-details
            @update:modelValue="(newZoom) => zoom = newZoom"
          />
          <v-btn
            :disabled="isSettingZoom || !isZoomValid"
            class="ml-4"
            @click="setZoom"
          >
            Set Overlay Zoom
            <v-progress-circular
              v-if="isSettingZoom"
              indeterminate
              class="ml-2"
              size=20
              color="secondary"
            />
          </v-btn>
          <v-spacer />
        </div>
        <p v-if="setZoomError" class="text-red text-body-2">
          Failed to set overlay zoom: {{ setZoomError }}
        </p>
      </div>

      <div class="NotionTasksPanel__btnGroup" />
    </div>

    <h3 class="text-h4 pb-4">
      Task Settings
    </h3>

    <div class="pb-4 text-body-2 text-grey">
      Pick a task from selection below
    </div>

    <div v-if="isLoadingTasks" class="d-flex justify-center pa-8">
      <v-progress-circular size="75" indeterminate color="secondary" />
    </div>
    <div v-else>
      <div class="NotionTasksPanel__btnGroupContainer">
        <div v-for="(tasks, taskGroup) in tasksByStatus" :key="taskGroup" class="NotionTasksPanel__btnGroup">
          <h3 class="text-h5 pb-2">
            {{ taskGroup }}
          </h3>
          <div v-for="task in tasks" :key="task.taskId" class="">
            <v-btn
              class="NotionTasksPanel__btn"
              :color="isTaskSelected(task) ? 'secondary' : null"
              @click="toggleTask(task)"
            >
              {{ task.name }}
            </v-btn>
          </div>
        </div>
      </div>

      <div class="pt-10">
        <h3 class="text-h5 pb-4">
          Selected Task:
          <v-sheet :color="selectedTask ? 'secondary' : null" class="d-inline-block px-2">
            <span v-if="selectedTask"> {{ selectedTask.name }} </span>
            <span v-else class="text-grey"> None </span>
          </v-sheet>
          <v-btn
            v-if="selectedTask"
            icon flat size="small"
            :href="selectedTask.url"
            target="_blank"
            class="ml-1"
          >
            <v-icon color="grey">
              mdi-open-in-new
            </v-icon>
          </v-btn>
        </h3>
      </div>

      <div v-if="selectedTask">
        <div class="NotionTasksPanel__btnGroupContainer pb-8">
          <div class="NotionTasksPanel__btnGroup">
            <h4 class="text-h6 pb-2 font-weight-regular">
              Move Task
              <v-progress-circular
                v-if="isUpdatingTaskStatus"
                indeterminate
                class="ml-2"
                size=24
                color="secondary"
              />
            </h4>
            <p v-if="updateTaskStatusError" class="text-red text-body-2">
              Failed to move task: {{ updateTaskStatusError }}
            </p>
            <v-btn
              v-for="taskAction in renderedTaskMoveActions"
              :key="taskAction.text"
              :disabled="isUpdatingTaskStatus"
              class="NotionTasksPanel__btn"
              @click="taskAction.action()"
            >
              {{ taskAction.text }}
            </v-btn>
            <p class="text-grey pl-1 text-body-2">
              NOTE: Generate videos before moving tasks
            </p>
          </div>

          <div class="NotionTasksPanel__btnGroup">
            <h4 class="text-h6 pb-2 font-weight-regular">
              Other
            </h4>
            <v-btn
              class="NotionTasksPanel__btn"
              :disabled="isActivatingTask"
              @click="activateTask">
              Set as active
              <v-progress-circular
                v-if="isActivatingTask"
                indeterminate
                class="ml-2"
                size=20
                color="secondary"
              />
            </v-btn>
            <p v-if="taskActivateError" class="text-red text-body-2">
              Failed to activate: {{ taskActivateError }}
            </p>

            <v-btn
              class="NotionTasksPanel__btn"
              :disabled="isGeneratingVideos"
              @click="generateVideos">
              Generate videos
              <v-progress-circular
                v-if="isGeneratingVideos"
                indeterminate
                class="ml-2"
                size=20
                color="secondary"
              />
            </v-btn>
            <p class="text-grey pl-1 text-body-2">
              Video generation takes about 2-3 min
            </p>
            <p v-if="videoGenError" class="text-red text-body-2">
              Failed to generate: {{ videoGenError }}
            </p>
          </div>
        </div>

        <h4 class="text-h6 pb-2 font-weight-regular">
          Subtasks
          <v-progress-circular
            v-if="isUpdatingTodo"
            indeterminate
            class="ml-2"
            size=24
            color="secondary"
          />
        </h4>
        <p v-if="todoUpdatingError" class="text-red text-body-2">
          Failed to update subtask: {{ todoUpdatingError }}
        </p>
        <div class="NotionTasksPanel__checkboxGroup">
          <span v-if="!selectedTaskTodos.length" class="text-grey text-body-2">
            This task has no subtasks
          </span>
          <template v-else>
            <div class="pb-8">
              <v-checkbox
                v-for="taskTodo in selectedTaskTodos"
                :key="taskTodo.text"
                :modelValue="taskTodo.checked"
                :disabled="isUpdatingTodo"
                class="NotionTasksPanel__checkbox"
                :label="taskTodo.text"
                hide-details
                @change="updateTodoCheckbox(taskTodo, !taskTodo.checked)"
              />
            </div>

            <div class="NotionTasksPanel__btnGroupContainer pb-8">
              <div class="NotionTasksPanel__btnGroup">
                <v-btn
                  class="NotionTasksPanel__btn"
                  :disabled="isGeneratingSubtaskVideos"
                  @click="generateSubtaskVideos">
                  Generate subtask videos
                  <v-progress-circular
                    v-if="isGeneratingSubtaskVideos"
                    indeterminate
                    class="ml-2"
                    size=20
                    color="secondary"
                  />
                </v-btn>
                <p class="text-grey pl-1 text-body-2 pb-0">
                  Generate videos for all variants of next step ({{selectedTaskTodos.length}} videos)
                  <br/>
                  Video generation takes about 2-3 min
                </p>
                <p v-if="subtaskVideoGenError" class="text-red text-body-2">
                  Failed to generate: {{ subtaskVideoGenError }}
                </p>
              </div>
              <div class="NotionTasksPanel__btnGroup" />
            </div>
          </template>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, Ref, watch } from 'vue'
import groupBy from 'lodash/groupBy'
import toNumber from 'lodash/toNumber'
import isNil from 'lodash/isNil'

import {
  NotionTask,
  NotionTaskStatus,
  NotionTaskAction,
  NotionTaskTodo
} from '../datasources/streamUtils/endpoints/tasks';
import { sortObjectBy } from '../utils/sortObjectBy';
import {
  useClearTaskAsActive,
  useGenerateSubtaskVideosForTask,
  useGenerateVideosForTask,
  useGetActiveTasks,
  useSetActiveTaskZoom,
  useSetTaskAction,
  useSetTaskAsActive,
  useSetTaskTodoCheck,
  useToggleActiveTaskTodos
} from '../datasources/streamUtils/composables/tasks';
  
/**
 * Action that changes the task status. These are displayed
 * conditionally on the taskStatus
 */
interface TaskMoveAction {
  text: string;
  taskStatus: NotionTaskStatus;
  actionId: NotionTaskAction;
  action: (...args: any[]) => Promise<void>;
}

/**
 * Actions that change the task status. These are conditionally shown
 * based on the taskStatus.
 */
const taskMoveActionsDefinitions: Omit<TaskMoveAction, 'action'>[] = [{
  text: 'Make Available (move to "To Do")',
  taskStatus: NotionTaskStatus.BACKLOG,
  actionId: NotionTaskAction.AVAILABLE,
}, {
  text: 'Start (move to "Doing")',
  taskStatus: NotionTaskStatus.TO_DO,
  actionId: NotionTaskAction.START,
}, {
  text: 'Complete (move to "Completed")',
  taskStatus: NotionTaskStatus.DOING,
  actionId: NotionTaskAction.COMPLETE,
}, {
  text: 'Abandon (move to "To Do")',
  taskStatus: NotionTaskStatus.DOING,
  actionId: NotionTaskAction.ABANDON,
}];

const NotionTasksPanel = defineComponent({
  name: 'NotionTasksPanel',
  setup() {
    const selectedTask: Ref<NotionTask | null> = ref(null);
    const zoom: Ref<string> = ref('1');

    const { value: tasks, isLoading: isLoadingTasks, error: tasksLoadError, call: loadTasks} = useGetActiveTasks();

    const { isLoading: isUpdatingTaskStatus, error: updateTaskStatusError, call: doSetTaskAction} = useSetTaskAction();

    const { isLoading: isGeneratingVideos, error: videoGenError, call: doGenerateVideos} = useGenerateVideosForTask();
    const generateVideos = () => doGenerateVideos(selectedTask.value?.taskId);

    const { isLoading: isGeneratingSubtaskVideos, error: subtaskVideoGenError, call: doGenerateSubtaskVideos} = useGenerateSubtaskVideosForTask();
    const generateSubtaskVideos = () => doGenerateSubtaskVideos(selectedTask.value?.taskId);

    const { isLoading: isUpdatingTodo, error: todoUpdatingError, call: doUpdateTodoCheckbox} = useSetTaskTodoCheck();
    const updateTodoCheckbox = (taskTodo: NotionTaskTodo, checked: boolean) =>
      doUpdateTodoCheckbox({taskId: selectedTask.value?.taskId, todoBlockId: taskTodo.todoBlockId, checked})
        .then(loadTasks);

    const { isLoading: isActivatingTask, error: taskActivateError, call: doActivateTask} = useSetTaskAsActive();
    const activateTask = () => doActivateTask({taskId: selectedTask.value?.taskId});

    const { isLoading: isClearingActiveTask, error: activeTaskClearError, call: clearActiveTask} = useClearTaskAsActive();

    const { isLoading: isTogglingTodos, error: toggleTodosError, call: toggleTodos} = useToggleActiveTaskTodos();

    const { isLoading: isSettingZoom, error: setZoomError, call: doSetZoom} = useSetActiveTaskZoom();
    const parsedZoom = computed((): number | null => {
      const zoomNum = toNumber(zoom.value);
      return Number.isNaN(zoomNum) ? null : zoomNum > 0 ? zoomNum : null;
    });
    const isZoomValid = computed((): boolean => !isNil(parsedZoom.value))
    const setZoom = () => {
      if (!isZoomValid.value) return;
      doSetZoom({zoom: parsedZoom.value});
    };

    const toggleTask = (toggledTask: NotionTask) => {
      if (selectedTask.value?.taskId === toggledTask.taskId) {
        selectedTask.value = null;
        return;
      }

      selectedTask.value = toggledTask;
    };


    const isTaskSelected = (task: NotionTask): boolean => task.taskId === selectedTask.value?.taskId;

    const selectedTaskTodos = computed((): NotionTaskTodo[] => selectedTask.value?.todos || []);

    const taskMoveActions = taskMoveActionsDefinitions.map((taskAction): TaskMoveAction => ({
      ...taskAction,
      action: () => doSetTaskAction(selectedTask.value?.taskId, taskAction.actionId)
        .then(loadTasks)
    }));

    const renderedTaskMoveActions = computed((): TaskMoveAction[] => taskMoveActions
      .filter((taskAction) => taskAction.taskStatus === selectedTask.value?.status)
    );

    const taskStatusOrder = [NotionTaskStatus.BACKLOG, NotionTaskStatus.TO_DO, NotionTaskStatus.DOING];
    const tasksByStatus = computed(() => {
      const unsortedTasksByStatus = groupBy(tasks.value, (task) => task.status) as Partial<Record<NotionTaskStatus, NotionTask[]>>;
      return sortObjectBy(unsortedTasksByStatus,
        (status, _) => taskStatusOrder.indexOf(status as NotionTaskStatus),
      );
    });

    // Update the value of the selected task with the freshly fetched task
    watch(tasks, (newTasks) => {
      const newSelectedTask = newTasks.find((task) => task.taskId === selectedTask.value?.taskId);
      selectedTask.value = newSelectedTask ? newSelectedTask : null;
    })

    onMounted(() => loadTasks());

    return {
      selectedTask,
      selectedTaskTodos,
      tasksByStatus,
      toggleTask,
      isTaskSelected,
      // Load tasks
      tasksLoadError,
      loadTasks,
      isLoadingTasks,
      // Move task
      renderedTaskMoveActions,
      isUpdatingTaskStatus,
      updateTaskStatusError,
      // Generate task videos
      generateVideos,
      isGeneratingVideos,
      videoGenError,
      // Generate subtask videos
      generateSubtaskVideos,
      isGeneratingSubtaskVideos,
      subtaskVideoGenError,
      // Update todo
      updateTodoCheckbox,
      isUpdatingTodo,
      todoUpdatingError,
      // Activate task
      activateTask,
      isActivatingTask,
      taskActivateError,
      // Clear active task
      clearActiveTask,
      isClearingActiveTask,
      activeTaskClearError,
      // Toggle active task todos
      toggleTodos,
      isTogglingTodos,
      toggleTodosError,
      // Setting zoom
      zoom,
      isZoomValid,
      setZoom,
      isSettingZoom,
      setZoomError,
      // Other
      NotionTaskStatus,
    };
  },
});

export default NotionTasksPanel;
</script>

<style lang="scss">
.NotionTasksPanel {
  &__btnGroupContainer {
    display: flex;
    flex-wrap: wrap;
    row-gap: 40px;
  }

  &__btnGroup {
    flex: 1 1 250px;
    min-width: 180px;
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }

  &__btn {
    width: 80%;
  }

  &__checkboxGroup {
    flex: 1 1 250px;
    min-width: 180px;
    display: flex;
    flex-direction: column;
  }

  &__checkbox {
    &.v-input--density-default {
      --v-input-control-height: unset;
    }

    .v-label {
      white-space: break-spaces !important;
      text-overflow: unset !important;
    }
  }
}
</style>
