const {app, BrowserWindow} = require('electron')
  const path = require('path')
  const url = require('url')
  const shell = require('electron').shell       // Позволяет реализовать открытие ссылки в браузере
  const ipc = require('electron').ipcMain       // Чтобы js-файлы могли взаимодействовать и получать информацию от main.js
  const settings = require('electron-settings') // Позволяет сохранять конфиги приложения

  let win
  
  function createWindow () {
    win = new BrowserWindow({
      width:  875,  // 320
      height: 600,  // 220
      // fullscreen:true,
      frame:false,
      resizable:false
    })
  
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'src/index.html'),
      protocol: 'file:',
      slashes: true
    }))
  
    // Инструменты разработчика для отладки
    win.webContents.openDevTools()
  
    win.on('closed', () => {
      win = null
    }) // Закрытие главного окна
  }
  
  app.on('activate', () => {
    if (win === null) {
      createWindow()
    }
  }) // Восстановление окна

  // СОХРАНЕНИЕ НАСТРОЕК ПРОГРАММЫ
  let linksArr = []           // Массив ссылок
  let lastLinkIndex = 0       // Индекс ссылки, которую использовали последней
  let lastLink                // Значение строки-ссылки, котоурю пользователь использовал последней
  
  app.on('ready', () => {     
    createWindow()
    if (settings.has('linksArr')) {                     // Проверяем, существует ли список ссылок
        linksArr = settings.get('linksArr')             // Если существует, берём основной массив из конфига
        lastLinkIndex = settings.get('lastLinkIndex')   // Берём индекс массива для последней используемой ссылки
        lastLink = linksArr[lastLinkIndex]              // Получаем последнюю используемую ссылку
    }
  });

  ipc.on('add-new-link-to-settings', function(event, arg) {
    linksArr.push(arg)
    settings.set('linksArr', linksArr)
    lastLinkIndex = linksArr.length - 1
    settings.set('lastLinkIndex', lastLinkIndex)
  })
  ipc.on('new-window-size', function(event, width, height) {
    win.setSize(width, height)
    win.center()
  })
  ipc.on('send-words', function(event, arg) {
    win.webContents.send('get-words', arg)
  })
  ipc.on('send-setup', function(event, arg) {
    win.webContents.send('get-setup', arg)
  })
  ipc.on('new-link-to-mainjs', function(event, arg) {
    win.webContents.send('new-link-from-main-to-index', arg)
  })
