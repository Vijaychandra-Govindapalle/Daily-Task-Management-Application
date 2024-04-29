const {
    app,
    BrowserWindow
} = require('electron')

  let appWindow

  function createWindow() {
    appWindow = new BrowserWindow({
        width: 1200,
        height: 900
    })
    appWindow.loadFile('dist/userint/browser/index.html');

    appWindow.on('closed', function() {
        appWindow = null
    })
  }

  app.whenReady().then(() => {
    createWindow()
  })