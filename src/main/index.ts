import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // width: 0,
    // height: 0,
    show: false,
    movable: false,    // 窗口可移动
    // resizable: true,    // 窗口可调整大小
    minimizable: false,    // 窗口不能最小化
    maximizable: false,    // 窗口不能最大化
    frame: false, // 去掉窗口边框
    transparent: true, // 使窗口透明
    alwaysOnTop: true, // 窗口总是在最前
    autoHideMenuBar: true,
    fullscreenable: true,
    fullscreen: true, // 添加全屏属性
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  // mainWindow.setContentSize(100, 100);
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    
    // mainWindow.setIgnoreMouseEvents(true);
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
      event
      console.log(ignore,options)
      console.log(mainWindow.getSize())
      // mainWindow.setIgnoreMouseEvents(ignore);
  });

  // 拖拽功能实现 ------------------------------------------------------
  let winXY = {
    //鼠标与窗口定位差值
    x: 0,
    y: 0
  }
  // 移动窗口----start
  let isMoving = false;
  ipcMain.on('winMove-start', () => {
    const winPosition = mainWindow.getPosition()
    const cursorPosition = screen.getCursorScreenPoint() //开始时鼠标位置
    winXY.x = cursorPosition.x - winPosition[0]
    winXY.y = cursorPosition.y - winPosition[1]

    isMoving = true;
    const moveWindow = () => {
      if (!isMoving) return;
      const cursorPosition = screen.getCursorScreenPoint();
      const newX = cursorPosition.x - winXY.x;
      const newY = cursorPosition.y - winXY.y;
      mainWindow.setPosition(newX, newY); // 更新窗口位置
      setTimeout(moveWindow, 16); // 每16ms递归调用，达到60fps效果
    };
    moveWindow(); // 开始递归
  })
  // 移动窗口----end
  ipcMain.on('winMove-end', () => {

    isMoving=false;
  })

  ipcMain.on('resize-window', (_, delta) => {
    const [width, height] = mainWindow.getSize();
    mainWindow.setSize(width + delta, height + delta);
  });


  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})