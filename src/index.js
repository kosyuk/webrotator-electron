const electron = require('electron')  // ';' ставится, если в одной строке несколько операторов. Но желательно ставить ';'
const path = require('path')
const BrowserWindow = electron.remote.BrowserWindow
const axios = require('axios') // Для раоты с json
const ipc = electron.ipcRenderer



function getBTC() {  // В скобках указываются параметры, которые функция должна считать
    axios.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC&tsyms=USD')
        .then(res => {  // '=>' - В аргумент функции вставил функцию, чтобы не создавать её отдельно
            // console.log(res.data) выводит в консоль результат. Можно посмотреть во вкладке Network, перейдя по ссылке
            // Во вкладке Headers - то, что отправили (мой запрос). Во вкладках Preview и Responce - то, что получил.
            const cryptos = res.data.BTC.USD
            price.innerHTML = '$'+cryptos.toLocaleString('en')  // .innerHTML записывает содержание в блок айдишника переменной price

            if (targetPrice.innerHTML != '' && targetPriceVal < res.data.BTC.USD) {
                const myNotification = new window.Notification(notification.title, notification)
            }
        })
}
getBTC()
setInterval(getBTC, 10000);  // setTimeout - одноразовый интервал




notifyBtn.addEventListener('click', function(event) {  // Первый параметр - на что реагировать, второй - как реагировать
    const modalPath = path.join('file://', __dirname, 'add.html')
    let win = new BrowserWindow({ frame:false, transparent:true, alwaysOnTop:true, width:400, height:200 })
        // Чтобы transparent:true работало, нужно ещё в стилях задать прозрачный цвет фона для html, body
    win.on('close', function() {win = null})
    win.loadURL(modalPath)
    win.show()
})

ipc.on('targetPriceVal', function(event, arg) {
    targetPriceVal = Number(arg)
    targetPrice.innerHTML = '$'+targetPriceVal.toLocaleString('en')
})







