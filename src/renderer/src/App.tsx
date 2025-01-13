import React, { useEffect, useRef } from 'react';


function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const appRef = useRef<HTMLDivElement | null>(null);
  var mousePath: number[][] = [];
  let resizeInterval: NodeJS.Timeout | null = null;

  useEffect(() => {
    const svgElement = appRef.current;

    if (!svgElement) return;

    // 监听鼠标进入SVG区域
    const handleMouseEnter = () => {
      window.electron.ipcRenderer.send('set-ignore-mouse-events', false); // 不穿透
    };

    // 监听鼠标离开SVG区域
    const handleMouseLeave = () => {
      window.electron.ipcRenderer.send('set-ignore-mouse-events', true, {forward : true}); // 穿透透明区域
    };

    svgElement.addEventListener('mouseenter', handleMouseEnter);

    svgElement.addEventListener('mouseleave', handleMouseLeave);

    // 移动窗口
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button == 0) {
        winMoveStart() //开始刷新屏幕位置
      } else if (e.button == 2){
        svgElement.addEventListener('mousemove', mousemove)
      }
      
    }
    svgElement.addEventListener('mousedown', handleMouseDown);

    const handleMouseDoUp = (e: MouseEvent) => {
      if (e.button == 0) {
        winMoveEnd() //开始刷新屏幕位置
      } else if (e.button == 2){
        console.log(mousePath)
        fetch("http://localhost:20000/predict", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: mousePath })
          })
          .then(response => response.json())
          .then(data => {
          console.log('Response from server:', data);
          })
          .catch(error => {
          console.error('Error:', error);
        });
        mousePath = []
        svgElement.removeEventListener('mousemove', mousemove);
      }
    }
    svgElement.addEventListener('mouseup', handleMouseDoUp);

    

    function winMoveStart() {
      window.electron.ipcRenderer.send('winMove-start')
    }
    function winMoveEnd() {
      window.electron.ipcRenderer.send('winMove-end')
    }
    function mousemove(event) {
      // 这里可以添加鼠标移动时的具体操作，例如更新元素位置等
      mousePath.push([event.clientX, event.clientY])
  }

    window.addEventListener('keydown', (event) => {
      if (event.key === "=") {
          if (!resizeInterval) {
          // 如果当前没有resize操作，开始循环
          console.log('Start increasing window size');
          resizeInterval = setInterval(() => {
            window.electron.ipcRenderer.send('resize-window', 10); // 每次增大20像素
          }, 50); // 每隔100ms增大一次窗口
          }
      } else if (event.key === "-") {
          if (!resizeInterval) {
          console.log('Start decreasing window size');
          resizeInterval = setInterval(() => {
            window.electron.ipcRenderer.send('resize-window', -10); // 每次减小20像素
          }, 50);
          }
      }
      });
  
      window.addEventListener('keyup', (event) => {
      if (event.key === "=" || event.key === "-") {
          console.log('Stop resizing window');
          clearInterval(resizeInterval); // 停止调整窗口大小
          resizeInterval = null; // 重置状态
      }
      });
  })
  
  
  return (
    <div
      ref={appRef}
      style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 128, 255, 0.182)',
          borderRadius: '0%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '10px',
      }}
  ></div>
  )
}

export default App
