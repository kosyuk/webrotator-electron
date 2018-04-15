const {app, BrowserWindow} = require('electron')
  const path = require('path')
  const url = require('url')
  const shell = require('electron').shell // Позволяет реализовать открытие ссылки в браузере
  const ipc = require('electron').ipcMain // Чтобы окна могли взаимодействовать друг с другом

  let win
  
  function createWindow () {
    win = new BrowserWindow({
      width: 320, 
      height: 240,
      //fullscreen:true,
      frame:false,
      resizable:false
    })
  
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'src/index.html'),
      protocol: 'file:',
      slashes: true
    })) // Загрузка index-файла главного окна
  
    // Инструменты разработчика для отладки
    win.webContents.openDevTools()
  
    win.on('closed', () => {
      win = null
    }) // Закрытие главного окна

  }
  
  app.on('ready', createWindow) // Создание окна, если приложение готово
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  }) // Закрытие окна и сворачивание в док если это OS X
  
  app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
  }) // Восстановление окна

