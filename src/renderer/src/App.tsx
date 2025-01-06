import React, { useEffect, useRef } from 'react';
import { ipcRenderer } from 'electron';

const App: React.FC = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const svgElement = rootRef.current;

    if (!svgElement) return;

    // 监听鼠标进入SVG区域
    const handleMouseEnter = () => {
      ipcRenderer.send('set-ignore-mouse-events', false); // 不穿透
    };

    // 监听鼠标离开SVG区域
    const handleMouseLeave = () => {
      ipcRenderer.send('set-ignore-mouse-events', true, { forward: true }); // 穿透透明区域
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.buttons === 1) {
        winMoveStart();
        svgElement.addEventListener('mousemove', handleMouseMove);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.buttons !== 1) {
        winMoveEnd();
        svgElement.removeEventListener('mousemove', handleMouseMove);
      }
    };

    const handleMouseUp = () => {
      winMoveEnd();
      svgElement.removeEventListener('mousemove', handleMouseMove);
    };

    function winMoveStart() {
      ipcRenderer.send('winMove-start');
    }

    function winMoveEnd() {
      ipcRenderer.send('winMove-end');
    }

    svgElement.addEventListener('mouseenter', handleMouseEnter);
    svgElement.addEventListener('mouseleave', handleMouseLeave);
    svgElement.addEventListener('mousedown', handleMouseDown);
    svgElement.addEventListener('mouseup', handleMouseUp);

    return () => {
      svgElement.removeEventListener('mouseenter', handleMouseEnter);
      svgElement.removeEventListener('mouseleave', handleMouseLeave);
      svgElement.removeEventListener('mousedown', handleMouseDown);
      svgElement.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      id="root"
      ref={rootRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'rgb(0, 128, 255)', // 半透明背景
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '20px',
        color: 'white',
      }}
    >
      嘻嘻
    </div>
  );
};

export default App
