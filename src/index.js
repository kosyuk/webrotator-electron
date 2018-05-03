// const {app, BrowserWindow} = require('electron')
const electron = require('electron')  // ';' ставится, если в одной строке несколько операторов. Но желательно ставить ';'
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const remote = electron.remote      // <<< ???
const axios = require('axios')      // Для раоты с json
const ipc = electron.ipcRenderer

const settings = require('electron').remote.require('electron-settings');  // Подключение конфига не в main.js




// Это базовые настройки при загрузке
// Дальше нужно записывать значение последней введённой ссылки и её индекс в массиве



// const addBtn = document.getElementById('addBtn')
let textView = document.getElementById('textView')
let listLinks = document.getElementById('listLinks')
// let textEdit = document.getElementById('textEdit')
// addBtn.addEventListener('click', function(event) {
//     // Добавление новой ссылки в выпадающий список
//     var addOption = document.createElement("option");
//     addOption.value = textEdit.value;
//     addOption.text = textEdit.value;
//     listLinks.add(addOption, null);
//     // listLinks.add(addOption, listLinks.options[0]);
//     // При добавлении последнего элемента делаем его активным
//     listLinks.selectedIndex = listLinks.length - 1

//     // Отправка значения новой ссылки в конфиг через main.js 
//     ipc.send('add-new-link-to-settings', textEdit.value)

//     // textEdit.value = '';

// })

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
    console.log(linksArr)          
    if (linksArr.length != 0) {
        linksArr.forEach(function(element) {
            // console.log(element);
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
    settings.set('lastLinkIndex', listLinks.selectedIndex);     // console.log(settings.get('lastLinkIndex'))
    jsonLink = listLinks.value; getJsonData(jsonLink);           // Берём эту переменную, при изменении селекта
})


// Закрытия окна по клику на элементе
const closeBtn = document.getElementById('closeBtn')
closeBtn.addEventListener('click', function(event) {
    let window = remote.getCurrentWindow();
    window.close()
})


function getWords() {
    axios.get('http://localhost:9000/json/sample.json')
        .then(res => {
            const listWords = res.data.words
            console.log(listWords)              // listWords - это массив объектов
            const wordsArr = []
            listWords.forEach((element) => {
                // console.log(element.name)    // Выведет значением name данного объекта
                // console.log(element)         // Выведет значения переменных объекта
                wordsArr.push(element.name)     // В цикле добавляет в новый массив элементы
            });
            console.log(wordsArr)               // Выведет новый массив из элементов name объектов массива listWords
            const wordsArr2 = listWords.map((element) => {return element.name})     // То же самое, что и выше
            console.log(wordsArr2.join(', '))  // Чтобы вывести значения массива в виде строки (а не массива) через запятую
            // console.log(listWords.toLocaleString('en'))

            console.log(listWords[1].name)      // Получение значения name объекта 1 в массиве объектов listWords
            console.log(listWords[1])           // Все элементы объекта 1 в массиве объектов listWords

        })
        .catch(res => {  // Если ошибка, то выполняется то, что ниже
            console.log(321)
        })
}
const getJson = document.getElementById('getJson')
getJson.addEventListener( 'click', getWords )               // без скобок, то подвязывается ссылка на функцию
// getJson.addEventListener( 'click', () => {getWords()} )  // со скобками сначала при загрузке приложения вызывается функция и её результат подвязывается к клику


let jsonLink      // Ссылка на JSON
var wordsObjArr   // Массив объектов слов и их параметров
var jsonSetup     // Параметры настроек из JSON
function getJsonData(jsonLink) {
    axios.get(jsonLink)
        .then(res => {
            wordsObjArr = res.data.words
            jsonSetup = res.data.setup

            // console.log(wordsObjArr[1].name)
            // console.log(jsonSetup.width)
            ipc.send('new-window-size', jsonSetup.width, jsonSetup.height)
            ipc.send('send-words', wordsObjArr)
            ipc.send('send-setup', jsonSetup)
        })
        .catch(res => {     // Если ошибка, срабатывает это исключение
            console.log('JSON ошибка')
        })
    // console.log(wordsObjArr[1].name)
}


ipc.on('get-words', function(event, arg) {
    wordsObjArr = arg
    // console.log(wordsObjArr[1].name)
    wordsObjArr.sort(function (a, b) {
        if (a.priority > b.priority) {
          return -1;
        }
        if (a.priority < b.priority) {
          return 1;
        }
        // a должно быть равным b
        return 0;
    })
    wordsObjArr.forEach( (element) => {console.log(element)} )
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
    // console.log(jsonSetup.timeout)
})




const addLinkWin = document.getElementById('addLinkWin')
function openAddLinkWin() {
    const modalPath = path.join('file://', __dirname, 'add.html')
    // let win = new BrowserWindow({ frame:false, transparent:true, alwaysOnTop:true, modal: true, width:400, height:200 })
    let win = new BrowserWindow({ frame:false, transparent:true, alwaysOnTop:true, width:500, height:115 })
        // Чтобы transparent:true работало, нужно ещё в стилях задать прозрачный цвет фона для html, body
    win.on('close', function() {win = null})
    win.loadURL(modalPath)
    win.show()
}
addLinkWin.addEventListener('click', openAddLinkWin )



ipc.on('new-link-from-main-to-index', function(event, arg) {
    // console.log(arg)
    
    // Добавление новой ссылки в выпадающий список
    var addOption = document.createElement("option");
    addOption.value = arg;
    addOption.text = arg;
    jsonLink = arg; getJsonData(jsonLink);                    // Берём эту переменную, когда добавили новую ссылку в программу
    listLinks.add(addOption, null);
    // listLinks.add(addOption, listLinks.options[0]);
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
                    if (wordCount > lenArr) { wordCount = 0 };
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
    // console.log(jsonTimeout)
    // console.log(jsonIntensity)
    // console.log(f)
    // // console.log(v)
    // console.log(timerCount)
}
playApp()
setInterval(playApp, 1000)



const deleteBtn = document.getElementById('deleteBtn')
deleteBtn.addEventListener('click', function(event) {
    let deleteID = wordsObjArr[wordCount].id
    console.log(deleteID)
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






// Модальное окно неправильно работает. Можно создать хоть 10 окон 
// https://github.com/electron/electron/blob/master/docs/api/browser-window.md#browserwindowsetcontentsizewidth-height

// Нужна проверка на ввод пустой, дублирующей или ошибочной ссылки

// Энтер в эдите инициирует нажатие кнопки Добавить





