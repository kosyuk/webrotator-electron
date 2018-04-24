// const {app, BrowserWindow} = require('electron')
const electron = require('electron')  // ';' ставится, если в одной строке несколько операторов. Но желательно ставить ';'
const path = require('path')
// const BrowserWindow = electron.remote.BrowserWindow
const remote = electron.remote      // <<< ???
const axios = require('axios')      // Для раоты с json
const ipc = electron.ipcRenderer

const settings = require('electron').remote.require('electron-settings');  // Подключение конфига не в main.js




// Это базовые настройки при загрузке
// Дальше нужно записывать значение последней введённой ссылки и её индекс в массиве



const addBtn = document.getElementById('addBtn')
let textEdit = document.getElementById('textEdit')
let textView = document.getElementById('textView')
let listLinks = document.getElementById('listLinks')
addBtn.addEventListener('click', function(event) {
    // textView.innerHTML = textEdit.value
    // listLinks.options[listLinks.options.length] = new Option(textEdit.value, textEdit.value)
    // listLinks.options[listLinks.options.length] = new Option('Text 1', 'Value1')


    // Добавление новой ссылки в выпадающий список
    var addOption = document.createElement("option");
    addOption.value = textEdit.value;
    addOption.text = textEdit.value;
    listLinks.add(addOption, null);
    // listLinks.add(addOption, listLinks.options[0]);
    // При добавлении последнего элемента делаем его активным
    listLinks.selectedIndex = listLinks.length - 1

    // Отправка значения новой ссылки в конфиг через main.js 
    ipc.send('add-new-link', textEdit.value)

})

window.onload = function () { 
    // Загружаем ссылки в выпадающий список
    linksArr = settings.get('linksArr')             
    linksArr.forEach(function(element) {
        // console.log(element);

        var addOption = document.createElement("option");
        addOption.value = element;
        addOption.text = element;
        listLinks.add(addOption, null);
            
    });

    lastLinkIndex = settings.get('lastLinkIndex')
    listLinks.selectedIndex = lastLinkIndex
    // И нужно при добавлении последнего элемента делать его активным
}

// Нужно при изменении элемента записывать его значение в конфиг
listLinks.addEventListener('change', function(event) {
    settings.set('lastLinkIndex', listLinks.selectedIndex)
    console.log(settings.get('lastLinkIndex'))
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
            const wordsArr = []
            listWords.forEach((element) => {
                console.log(element.name)
                wordsArr.push(element.name)
            });
            console.log(wordsArr)
            const wordsArr2 = listWords.map((element) => {return element.name})
            console.log(wordsArr2.join(', '))  // Чтобы вывести значения массива в виде строки (а не массива) через запятую
            // console.log(listWords.toLocaleString('en'))

            console.log(listWords[1].name)
            console.log(listWords[1])

        })
        .catch(res => {  // Если ошибка, то выполняется то, что ниже
            console.log(321)
        })
}

const getJson = document.getElementById('getJson')
// getJson.addEventListener( 'click', () => {getWords()} )
getJson.addEventListener( 'click', getWords )   // без скобок, то подвязывается ссылка на функцию
                                                // со скобками сначала вызывается функция и её результат подвязывается к клику





// const notifyBtn = document.getElementById('notifyBtn')
// var textField = document.querySelector('h1')
// var targetPrice = document.getElementById('targetPrice')
// var targetPriceVal
// // console.log('blablabla')
// const notification = {
//     title: 'Текст заголовка окна уведомления',
//     body: 'Текст уведомления. В данном случае о том, что биткоин достиг указанного значения',
//     icon: path.join(__dirname, '../assets/images/quote-1.png') // Иконка для уведомления
// }

// function getBTC() {  // В скобках указываются параметры, которые функция должна считать
//     axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD')
//         .then(res => {  // '=>' - В аргумент функции вставил функцию, чтобы не создавать её отдельно
//             // console.log(res.data) выводит в консоль результат. Можно посмотреть во вкладке Network, перейдя по ссылке
//             // Во вкладке Headers - то, что отправили (мой запрос). Во вкладках Preview и Responce - то, что получил.
//             const cryptos = res.data.BTC.USD
//             price.innerHTML = '$'+cryptos.toLocaleString('en')  // .innerHTML записывает содержание в блок айдишника переменной price

//             if (targetPrice.innerHTML != '' && targetPriceVal < res.data.BTC.USD) {
//                 const myNotification = new window.Notification(notification.title, notification)
//             }
//         })
// }
// getBTC()
// setInterval(getBTC, 10000);  // setTimeout - одноразовый интервал

// notifyBtn.addEventListener('click', function(event) {  // Первый параметр - на что реагировать, второй - как реагировать
//     const modalPath = path.join('file://', __dirname, 'add.html')
//     let win = new BrowserWindow({ frame:false, transparent:true, alwaysOnTop:true, width:400, height:200 })
//         // Чтобы transparent:true работало, нужно ещё в стилях задать прозрачный цвет фона для html, body
//     win.on('close', function() {win = null})
//     win.loadURL(modalPath)
//     win.show()
// })

// ipc.on('targetPriceVal', function(event, arg) {
//     targetPriceVal = Number(arg)
//     targetPrice.innerHTML = '$'+targetPriceVal.toLocaleString('en')
// })







