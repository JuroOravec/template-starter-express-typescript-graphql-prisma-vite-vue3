import type { Component } from 'vue';

import type { MaybePromise } from '@/../utils/types';
import { deferredPromise } from '@/../utils/async';

export interface CompoItem<
  TProps extends object = object,
  TData = any,
  TState extends object = object,
  TRendererProps extends object = object,
> {
  /** Component that will be displayed when this queue item is enqueued */
  component: Component;
  /** Props passed to the component */
  props: TProps;
  /** Props passed to the renderer component - AKA the component that renders the queue components */
  rendererProps: TRendererProps;
  /**
   * State that the components can use to persist data, e.g. when they need to
   * open a child components to get additional data.
   */
  state: TState;
  callback: (data: TData) => MaybePromise<void>;
}

export type CompoStack<T extends CompoItem = CompoItem> = T[];
export type CompoQueue<T extends CompoItem = CompoItem> = CompoStack<T>[];

export type ExtractCompoItemData<T extends CompoItem> = T extends CompoItem<
  any,
  infer U,
  any
>
  ? U
  : never;

export interface UseCompoQueueOptions {
  /**
   * If you need to use `useCompoQueue` for multiple independent use cases (e.g.
   * managing modals AND managing snackbars), then use the namespace to create
   * multiple separate component queues.
   *
   * Default: `'default'`
   */
  namespace?: string;
  /**
   * If true, then components are automatically flushed (displayed if nothing else
   * is active already) when added to the queue.
   *
   * Default: `false`
   */
  autoFlush?: boolean;
}

////////////////////////////
// STATE
////////////////////////////

interface UseCompoQueueState<T extends CompoItem = CompoItem> {
  /**
   * Queue of components that will be displayed one by one. But each component
   * can call in "child" components, hence each item in the queue is actually a stack.
   */
  queueOfStacks: Ref<CompoQueue<T>>;
  /** The component that's currently displayed */
  currItem: Ref<T | null>;
  /**
   * Data from invocation of previous component. Defined only if the previous component
   * was in the same stack as this one.
   */
  childResult: Ref<any>;
}

export const CompoQueueKey = Symbol('CompoQueue');

// Use Vue's provide/inject for global state management
const initState = <T extends CompoItem = CompoItem>(namespace?: string) => {
  let state = inject<Record<string, UseCompoQueueState<T>> | null>(
    CompoQueueKey,
    null,
  );
  if (!state) {
    state = {};
    provide(CompoQueueKey, state);
  }

  const theNamespace = namespace ?? 'default';
  const namespaceState = state[theNamespace];
  if (!namespaceState) {
    state[theNamespace] = {
      queueOfStacks: shallowRef([]),
      currItem: shallowRef(null),
      childResult: shallowRef(null),
    };
  }
  return state[theNamespace];
};

////////////////////////////
// STACK & QUEUE UTILS
////////////////////////////

const getOrCreateStack = (queue: CompoQueue, queueIndex?: number) => {
  let stack: CompoStack | undefined;
  if (queueIndex != null) stack = queue[queueIndex];
  if (!stack) {
    stack = [];
    queue.push(stack);
  }
  return stack;
};

const upsertStackItem = (
  stack: CompoStack,
  item: CompoItem,
  posIndex?: number,
) => {
  // If valid stack index, insert the component into given position,
  // shifting all subsequent components by +1
  if (posIndex != null && stack[posIndex]) {
    stack.splice(posIndex, 0, item);
  } else {
    // Otherwise insert it at the end
    stack.push(item);
  }
  return stack.indexOf(item);
};

const findNextStack = <T extends CompoItem = CompoItem>(
  queue: CompoQueue<T>,
) => {
  let stack = null;
  while (queue.length && !stack) {
    const nextStack = queue[0];
    if (nextStack?.length) {
      stack = nextStack;
      break;
    }
    // Throw out empty stack and keep searching
    queue.shift();
  }
  return stack;
};

const getNextItem = <T extends CompoItem = CompoItem>(
  queue: CompoQueue<T>,
): { stack: CompoStack<T> | null; item: T | null } => {
  const stack = findNextStack(queue);
  if (!stack || !stack.length) return { stack, item: null };

  // Get the next component to show
  const item = stack.slice(-1)[0] ?? null;
  return { stack, item };
};

////////////////////////////
// COMPOSABLE
////////////////////////////

/**
 * Show and manage content like modals, snackbars, or alerts, where
 * 1. The content is encapsulated in components,
 * 2. There should always be only 1 component displayed at any time.
 *
 * This is an abstraction of displaying e.g. modals (dialogs), snackbars, alerts,
 * and other system-wide components, where we usually want only single instance to
 * be displayed at any time (e.g. we want the user to first take action on first
 * modal before showing them another, and so on).
 *
 * Features:
 * - This composable ensures that there's always only one component present
 * - Component can create "child" components, for example when they need a user to
 *   do another flow before they can return to this flow.
 * - The "parent" components have access to the data sent from the "child" components.
 *
 *   Example: Imagine you have a gallery app. User wants to save a photo to a new album.
 *   This is done via a modal, where they select album, add tags, location, and other metadata.
 *
 *   However, the flow requires them to fill in more data about the album before it can be created.
 *   Hence, we want to open an "album creation flow" on top of the "save photo to album" flow.
 *
 *   This component manages that by:
 *   1. Temporarily closing the "save photo to album flow"
 *   2. Opening the "album creation flow"
 *   3. After creation, an event is emitted from the "album creation flow" component with the data about the created album.
 *      This triggers `useComponentQueue` close the "child" component.
 *   4. "album creation flow" is closed.
 *   5. "save photo to album flow" is opened, and it now has access to the data bout the created album. Hence, it
 *      can continue with the original flow.
 *
 * Usage:
 *   1. Display a component with
 *
 *     `useComponentQueue().push({ component: MyCustomModalContent }).then((res) => ...)`
 *
 *   2. If `MyCustomModalContent` needs to run a child modal, then:
 *
 *       1. It needs to define a `child-result` prop, this is where the child data will be provided.
 *       2. If `child-result` prop value is `null`, then run
 *
 *          `useComponentQueue().push({ component: ChildModalContent }).then((res) => ...)`
 *
 *       3. This will close `MyCustomModalContent` and instead open `ChildModalContent`.
 *
 *       4. Once `ChildModalContent` completed the flow as necessary, it should emit `done`
 *          event with data that it want to pass back to `MyCustomModalContent`.
 *
 *         `emit('done', { albumName: 'hello prague', id: 457286 })`
 *
 *       5. Since `ChildModalContent` has finished, then `MyCustomModalContent` will be loaded
 *          again. However, this time, the `child-result` will be populated with the emitted data.
 *
 *   3. Sometimes, you might want to preserved the state in the parent component, while the "child"
 *      component is being run. For this, the components receive also `state` prop. You can
 *      populate this object, and the object will preserve the data for after the child component is run.
 *
 *   4. To close a component, the component needs to emit a `done` event, optionally with data to be made
 *      available to the "parent" component.
 *
 *      `emit('done', { someValue: '...' })`
 */
export const useComponentQueue = <TRendererProps extends object = object>(
  options?: UseCompoQueueOptions,
) => {
  type CurrCompoItem = CompoItem<object, any, object, TRendererProps>;

  const autoFlush = options?.autoFlush ?? true;

  // Queue is handled First In First Out (FIFO).
  // Each queue item represents a group of components stacked on top of each other.
  // Hence, the queue item is a stack, which is handled First In Last Out (FILO).
  //
  // Think of it like this: The last added modal is show on the top of all other modals in the UI.
  // When we close the top modal, we pop it off from the stack, etc.
  const { queueOfStacks, currItem, childResult } = initState<CurrCompoItem>();

  const createItem = <T extends CurrCompoItem>(input: {
    component: Component;
    props?: T['props'];
    rendererProps?: Partial<T['rendererProps']>;
    queueIndex?: number;
    stackIndex?: number;
  }) => {
    // Return the component's result as promise
    const promise = deferredPromise<ExtractCompoItemData<T>>();
    const stack = getOrCreateStack(queueOfStacks.value, input.queueIndex);
    const item = {
      component: input.component,
      props: input.props ?? {},
      rendererProps: input.rendererProps ?? {},
      state: {},
      callback: (data) => promise.resolve(data),
    } as T;

    upsertStackItem(stack, item, input.stackIndex);
    triggerRef(queueOfStacks);

    if (autoFlush) openNextItem();

    return promise;
  };

  /**
   * Create a component that will be placed on top of any other components (first-most).
   *
   * - If the queue is empty, create stack and insert component into it.
   * - If queue not empty, push item at the top of the current stack.
   */
  const createChild = <T extends CurrCompoItem>(input: {
    component: Component;
    props?: T['props'];
    rendererProps?: Partial<T['rendererProps']>;
  }) => {
    return createItem<T>({ ...input, queueIndex: 0 });
  };

  /**
   * Create a component that will be shown on its own.
   *
   * - Now, if the queue is empty
   * - AFTER all enqueued components.
   */
  const push = <T extends CurrCompoItem>(input: {
    component: Component;
    props?: T['props'];
    rendererProps?: Partial<T['rendererProps']>;
  }) => {
    return createItem<T>(input);
  };

  /**
   * When user instructs us to open a component, we go through the queue
   * and stacks, and find the next component to open.
   */
  const openNextItem = () => {
    // Exit early if already in progress or queue is empty
    if (currItem.value || !queueOfStacks.value.length)
      return { stack: null, item: null };

    // NOTE: We don't remove the item from the stack until after the item is done
    // in case we come across any errors and need to re-open the component again
    const { stack, item } = getNextItem(queueOfStacks.value);
    if (item) currItem.value = item;

    return { stack, item };
  };

  // Internal - Remove the next item in queue/stack, so we can open
  // the item AFTER that.
  const popNextItem = () => {
    const { stack, item } = getNextItem(queueOfStacks.value);
    if (!stack || !item) return { stack, item };

    const itemIndex = stack?.indexOf(item);
    stack?.splice(itemIndex, 1);

    return { stack, item };
  };

  /**
   * Callback passed to the item component, through which the component
   * signals that it's done, and can pass data between the components.
   *
   * If there's more items in the stack, the next one is loaded.
   */
  const onItemDone = async (itemResult?: any) => {
    // Pop the item that was loaded with openNextltem
    const oldItem = popNextItem();
    await Promise.resolve(oldItem.item?.callback(itemResult)).catch((err) => {
      console.error('Error in component queue item callback');
      console.error(err);
    });

    // Prepare the results from child component (if applicable)
    const newItem = getNextItem(queueOfStacks.value);
    const shouldPassResults = newItem.stack === oldItem.stack;
    childResult.value = shouldPassResults ? itemResult : null;

    // And finally load the next component
    currItem.value = null;
    openNextItem();
  };

  return {
    createChild,
    push,
    openNextItem,
    onItemDone,
    currItem,
    childResult,
  };
};

/** Variables definition for a item. */
export type ItemDef<
  TProps extends object = object,
  TEmit = void,
  TState extends object = object,
> = {
  props: TProps;
  emit: TEmit;
  state: TState;
};

/** Transform ItemDef to CompoItem. */
export type ItemDef2CompoItem<
  T extends ItemDef<object, any, object>,
  TRendererProps extends object = object,
> = CompoItem<T['props'], T['emit'], T['state'], TRendererProps>;

/**
 * Transform ItemDef to Vue Component props that can be used in {@link defineProps}.
 *
 * @warning
 * WARNING - DO NOT USE INSIDE `defineProps` as of vue@3.3.4
 *
 * Usage inside `defineProps` throws following error:
 * ```
 * [vite:vue] [@vue/compiler-sfc] Unresolvable type reference or unsupported built-in utility type
 * ```
 */
export type ItemDef2Props<
  T extends ItemDef<object, any, object>,
  TChildRes = any,
> = {
  state: T['state'];
  childResult: TChildRes;
} & T['props'];

/** Transform ItemDef to Vue Component emit that can be used in {@link defineEmits}. */
export type ItemDef2Emits<TItem extends ItemDef<object, any, object>> = {
  done: [TItem['emit']];
};

/**
 * Wrapper around {@link useComponentQueue} that can use only pre-defined components identified by their names.
 *
 * Unlike {@link useComponentQueue}, this composable provides type safety for components
 * and their input (props), output (emits), and state.
 *
 * See {@link useComponentQueue} for further details.
 *
 * Usage:
 * ```ts
 * // 1. Define types for props, emits, and state
 * type Modals = {
 *   checkoutSx: ItemDef<{ event: CheckoutSuccessEvent }>;
 *   mfaFail: ItemDef;
 * };
 *
 * // 2. Define components
 * const modals = {
 *   checkoutSx: ModalCheckoutSx,
 *   mfaFail: ModalMfaFail,
 * } satisfies Record<keyof Modals, Component>;
 *
 * // 3. Create composable
 * const useNamedModal = createNamedUseComponentQueue<Modals>(modals, { namespace: 'modal' });
 *
 * // 4. Use as `useComponentQueue` but with `name` instead of `component`
 * useNamedModal().push({ name: 'checkoutSx', props: { event: eventData } })
 *   .then((res) => ...);
 * ```
 */
export const createNamedUseComponentQueue = <
  TItems extends Record<string, { props: object; emit: any; state: object }>,
  TRendererProps extends object = object,
>(
  components: Record<keyof TItems, Component>,
  defaultOptions?: UseCompoQueueOptions,
) => {
  return (options?: UseCompoQueueOptions) => {
    const queue = useComponentQueue<TRendererProps>({
      ...defaultOptions,
      ...options,
    });

    const createChild = <TKey extends keyof TItems>(input: {
      name: TKey;
      props: TItems[TKey]['props'];
      rendererProps?: Partial<TRendererProps>;
    }) => {
      type CurrCompoItem = ItemDef2CompoItem<TItems[TKey], TRendererProps>;

      const component = components[input.name];
      return queue.createChild<CurrCompoItem>({ ...input, component });
    };

    const push = <TKey extends keyof TItems>(input: {
      name: TKey;
      props: TItems[TKey]['props'];
      rendererProps?: Partial<TRendererProps>;
    }) => {
      type CurrCompoItem = ItemDef2CompoItem<TItems[TKey], TRendererProps>;

      const component = components[input.name];
      return queue.push<CurrCompoItem>({ ...input, component });
    };

    return {
      ...queue,
      createChild,
      push,
    };
  };
};
