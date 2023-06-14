export const useErrorTracker = () => {
  const instance = getCurrentInstance();
  const errorTracker = instance?.proxy?.$errorTracker ?? null;
  return errorTracker;
};
