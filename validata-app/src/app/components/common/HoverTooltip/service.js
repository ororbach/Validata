export const TOOLTIP_WIDTH = 224; // matches the old w-56
export const VIEWPORT_MARGIN = 8;
export const VERTICAL_GAP = 8;

export const calculateCoords = (rect, windowWidth) => {
  if (!rect) return null;

  const centerX = rect.left + rect.width / 2;
  const left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(centerX - TOOLTIP_WIDTH / 2, windowWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN)
  );

  const placement = rect.top > 90 ? 'top' : 'bottom';
  const top = placement === 'top' ? rect.top - VERTICAL_GAP : rect.bottom + VERTICAL_GAP;
  const arrowLeft = Math.max(12, Math.min(centerX - left, TOOLTIP_WIDTH - 12));

  return { top, left, placement, arrowLeft };
};