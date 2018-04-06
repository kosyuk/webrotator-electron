const {app, BrowserWindow, Menu} = require('electron')
  const path = require('path')
  const url = require('url')
  const shell = require('electron').shell     // Чтобы добавить ссылку в мену, нужно подключить этот модуль
  let win
  
  function createWindow () {
    win = new BrowserWindow({
      width: 800, 
      height: 600,
      //fullscreen:true,
      frame:false,
      resizable:false
    }) // Основная конфигурация окна
  
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })) // Загрузка html файла
  
    // Открытие инструмента разработчика для отладки
    // win.webContents.openDevTools()
  
    win.on('closed', () => {
      win = null
    }) // Закрытие главного окна

    var menu = Menu.buildFromTemplate([
      {
        label: 'Menu',
        submenu: [
          {label: 'Adjust Notification Value'},
          {
            label: 'Go to Google',
            click() {
              shell.openExternal('https://www.google.com.ua')   
            } // Чтоб работало, нужно вначале добавить const shell = require('electron').shell
          },
          {type: 'separator'},
          {
            label: 'Exit',
            click() {
              app.quit()
            }
          }
        ]
      },
      {
        label: 'Справка'
      }
    ])

    Menu.setApplicationMenu(menu);
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
  