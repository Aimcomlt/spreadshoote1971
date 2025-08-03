import { useEffect } from 'react';

export function usePointerControls(callback) {
  useEffect(() => {
    let activePointerId = null;
    let lastMove = 0;
    const THROTTLE_MS = 16;

    const handlePointerDown = (event) => {
      event.preventDefault();
      const { pointerId, clientX: x, clientY: y, pointerType } = event;

      if (activePointerId === null) {
        activePointerId = pointerId;
        callback({ type: 'down', x, y, pointerType });
      } else {
        // Secondary touches trigger a fire event
        callback({ type: 'fire', x, y, pointerType });
      }
    };

    const handlePointerMove = (event) => {
      event.preventDefault();
      const { pointerId, clientX: x, clientY: y, pointerType } = event;

      if (pointerId !== activePointerId) return;

      const now = performance.now();
      if (now - lastMove < THROTTLE_MS) return;
      lastMove = now;

      callback({ type: 'move', x, y, pointerType });
    };

    const handlePointerUp = (event) => {
      event.preventDefault();
      const { pointerId, clientX: x, clientY: y, pointerType } = event;

      if (pointerId === activePointerId) {
        activePointerId = null;
        callback({ type: 'up', x, y, pointerType });
      } else {
        // Treat pointer releases from other touches as fire events
        callback({ type: 'fire', x, y, pointerType });
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: false });
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });
    window.addEventListener('pointercancel', handlePointerUp, { passive: false });

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [callback]);
}
