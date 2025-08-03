import { useEffect } from 'react';

export function usePointerControls(callback) {
  useEffect(() => {
    const handlePointerDown = (event) => {
      event.preventDefault();
      const { clientX: x, clientY: y, pointerType } = event;
      callback({ type: 'down', x, y, pointerType });
    };

    const handlePointerMove = (event) => {
      event.preventDefault();
      const { clientX: x, clientY: y, pointerType } = event;
      callback({ type: 'move', x, y, pointerType });
    };

    const handlePointerUp = (event) => {
      event.preventDefault();
      const { clientX: x, clientY: y, pointerType } = event;
      callback({ type: 'up', x, y, pointerType });
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [callback]);
}
