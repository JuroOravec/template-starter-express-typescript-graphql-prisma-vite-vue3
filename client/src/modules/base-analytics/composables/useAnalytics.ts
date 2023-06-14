export const useAnalytics = () => {
  const instance = getCurrentInstance();
  const analyticsInstance = instance?.proxy?.$analytics ?? null;
  return analyticsInstance;
};

export const useTrackPage = () => {
  const analytics = useAnalytics();
  const route = useRoute();

  watch(
    () => route.fullPath,
    (newPath) => {
      if (!newPath) return;

      analytics?.trackEvent('page', { pageName: route.name ? route.name.toString() : null });
    },
    { immediate: true }
  );
};
