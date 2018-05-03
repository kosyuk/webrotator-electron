const electron = require('electron')
const path = require('path')
const remote = electron.remote
const ipc = electron.ipcRenderer
const BrowserWindow = electron.remote.BrowserWindow
const settings = require('electron').remote.require('electron-settings');  // Подключение конфига не в main.js



const closeBtn = document.getElementById('closeBtn')

closeBtn.addEventListener('click', function(event) {
    var window = remote.getCurrentWindow();
    window.close()
})




const addBtn = document.getElementById('addBtn')
// let listLinks = document.getElementById('listLinks')
let textEdit = document.getElementById('textEdit')
addBtn.addEventListener('click', function() {
    ipc.send('new-link-to-mainjs', textEdit.value)
    textEdit.value = ''

    var window = remote.getCurrentWindow();
    window.close()
})



