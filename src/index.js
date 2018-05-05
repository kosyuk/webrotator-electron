const electron = require('electron')
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const remote = electron.remote
const axios = require('axios')
const ipc = electron.ipcRenderer

const settings = require('electron').remote.require('electron-settings');  

let textView = document.getElementById('textView')
let listLinks = document.getElementById('listLinks')

const delLink = document.getElementById('delLink')
delLink.addEventListener('click', function(event) {
    linksArr = settings.get('linksArr')             
    linksArr.splice(listLinks.selectedIndex, 1) // Удаляем из массива 1 элемент с индексом активного селекта
    listLinks.remove(listLinks.selectedIndex)   // Удаляем активный селект

    // Записываем текущий массив в настройки
    settings.set('lastLinkIndex', listLinks.selectedIndex)
    settings.set('linksArr', linksArr)

    jsonLink = linksArr[listLinks.selectedIndex]; getJsonData(jsonLink);     // Меняем эту переменную при удалении ссылки

    if (listLinks.length == 0) { openAddLinkWin(); }
})

window.onload = function () { 
    // Загружаем ссылки в выпадающий список
    let linksArr = []
    linksArr = settings.get('linksArr')   
    if (linksArr.length != 0) {
        linksArr.forEach(function(element) {
            var addOption = document.createElement("option");
            addOption.value = element;
            addOption.text = element;
            listLinks.add(addOption, null);
        });
        lastLinkIndex = settings.get('lastLinkIndex')
        listLinks.selectedIndex = lastLinkIndex
        jsonLink = linksArr[lastLinkIndex]; getJsonData(jsonLink);   // Берём эту переменную, при загрузке программы
    }
    else { 
        openAddLinkWin()
    }
    
}

// Нужно при изменении элемента записывать его значение в конфиг
listLinks.addEventListener('change', function(event) {
    settings.set('lastLinkIndex', listLinks.selectedIndex);
    jsonLink = listLinks.value; getJsonData(jsonLink);           // Берём эту переменную, при изменении селекта
})

// Закрытия окна по клику на элементе
const closeBtn = document.getElementById('closeBtn')
closeBtn.addEventListener('click', function(event) {
    let window = remote.getCurrentWindow();
    window.close()
})

let jsonLink      // Ссылка на JSON
var wordsObjArr   // Массив объектов слов и их параметров
var jsonSetup     // Параметры настроек из JSON
function getJsonData(jsonLink) {
    axios.get(jsonLink)
        .then(res => {
            wordsObjArr = res.data.words
            jsonSetup = res.data.setup

            ipc.send('new-window-size', jsonSetup.width, jsonSetup.height)
            ipc.send('send-words', wordsObjArr)
            ipc.send('send-setup', jsonSetup)
        })
        .catch(res => {     // Если ошибка, срабатывает это исключение
            console.log('JSON ошибка')
        })
}


var wordsSortArr
ipc.on('get-words', function(event, arg) {
    wordsObjArr = arg
    wordsObjArr = getRandomArr(wordsObjArr)
    // При загрузке массива сразу добавляем первое отсортированное слово
    wordCount = 0
    wordOutput(wordCount)
    lenArr = wordsObjArr.length - 1
})
var jsonTimeout
var jsonIntensity
ipc.on('get-setup', function(event, arg) {
    jsonSetup = arg
    jsonTimeout = arg.timeout
    jsonIntensity = arg.intensity
})




const addLinkWin = document.getElementById('addLinkWin')
function openAddLinkWin() {
    const modalPath = path.join('file://', __dirname, 'add.html')
    let win = new BrowserWindow({ frame:false, transparent:true, alwaysOnTop:true, width:500, height:115 })
        // Чтобы transparent:true работало, нужно ещё в стилях задать прозрачный цвет фона для html, body
    win.on('close', function() {win = null})
    win.loadURL(modalPath)
    win.show()
}
addLinkWin.addEventListener('click', openAddLinkWin )



ipc.on('new-link-from-main-to-index', function(event, arg) {
    // Добавление новой ссылки в выпадающий список
    var addOption = document.createElement("option");
    addOption.value = arg;
    addOption.text = arg;
    jsonLink = arg; getJsonData(jsonLink);                    // Берём эту переменную, когда добавили новую ссылку в программу
    listLinks.add(addOption, null);
    // При добавлении последнего элемента делаем его активным
    listLinks.selectedIndex = listLinks.length - 1
    // Отправка значения новой ссылки в конфиг через main.js 
    ipc.send('add-new-link-to-settings', arg)
})

var wordCount = 0
var lenArr
const leftBtn = document.getElementById('leftBtn')
const rightBtn = document.getElementById('rightBtn')
rightBtn.addEventListener('click', function(event) {
    ++wordCount
    if (wordCount > lenArr) { wordCount = 0 }
    wordOutput(wordCount)
})
leftBtn.addEventListener('click', function(event) {
    --wordCount
    if (wordCount < 0) { wordCount = lenArr }
    wordOutput(wordCount)
})

function wordOutput(indexInArr) {
    textView.innerHTML = wordsObjArr[indexInArr].name + '<hr>' + wordsObjArr[indexInArr].description
}

var win = remote.getCurrentWindow();
var timerCount = 0
function playApp() {
    var f = win.isFocused()
    // var v = win.isVisible()
    if (f != true) {
        timerCount++
        switch (timerCount) {
            case 0:
                win.hide();
                break;
            case jsonTimeout:
                    ++wordCount;
                    if (wordCount > lenArr) { 
                        wordCount = 0 
                        wordsObjArr = getRandomArr(wordsObjArr)
                    };
                    wordOutput(wordCount);
                    win.showInactive();
                break;
            case (jsonTimeout + jsonIntensity):
                timerCount = 0;
                win.hide();
                break;
        }
    }
    else {
        timerCount = 0
    }
}
playApp()
setInterval(playApp, 1000)

const deleteBtn = document.getElementById('deleteBtn')
deleteBtn.addEventListener('click', function(event) {
    let deleteID = wordsObjArr[wordCount].id
    axios.post(jsonLink, {
        // firstName: 'Fred',
        id: deleteID
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
})

const playBtn = document.getElementById('playBtn')
playBtn.addEventListener('click', function(event) {
    win.hide()
})

function getRandomElement(arg) {    // Возвращает выбранный элемент массива. И сам массив без этого элемента
    const inputArr = [...arg]       // Присваиваем входящий массив внутреннему, чтобы удаление не удаляло из оригинального массива
    const priorityArr = inputArr.map((element) => { return element.priority })    
    var pl = priorityArr.length - 1

    var sinceArr = []
    var tillArr = []
    sinceArr[0] = 1
    for (var i = 0; i < pl; i++) {
        tillArr[i] = sinceArr[i] + priorityArr[i] - 1;
        sinceArr[i+1] = tillArr[i] + 1;
    }
    tillArr[pl] = sinceArr[pl] + priorityArr[pl] - 1

    r = Math.floor(Math.random() * tillArr[pl]) + 1;  // Random
    for (var i = 0; i <= pl; i++) {
        if (r >= sinceArr[i] && r <= tillArr[i]) {
            var returnedElement = inputArr[i]
            inputArr.splice(i, 1);      // Удаляем элемент из массива
            return [returnedElement, inputArr]
            break;
        }
    }
}
function getRandomArr(arg) {
    var inputArr = [...arg]
    var res = getRandomElement(inputArr)
    var selElem = res[0]
    var restElem = res[1]
    var outputArr = []
    outputArr.push(selElem)

    while (restElem.length > 0) {
        res = getRandomElement(restElem)
        selElem = res[0]
        restElem = res[1]
        outputArr.push(selElem)
    }

    return outputArr
}
