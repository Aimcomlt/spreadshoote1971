import { useEffect } from 'react';

export function usePointerControls(callback) {
  useEffect(() => {
    const handlePointerDown = (event) => {
      event.preventDefault();
      const { clientX: x, clientY: y, pointerType } = event;
      callback({ type: 'down', x, y, pointerType });
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [callback]);
}
