/**
 * Triggers a global event to refresh all header counts (cart, wishlist, notifications).
 * Use this after any action that might change these counts.
 */
export const refreshHeaderCounts = () => {
  window.dispatchEvent(new CustomEvent('refresh-counts'));
};
