import { app, BrowserWindow, screen } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import * as path from 'path';
import * as url from 'url';

let win;
let auxWindow;
const args = process.argv.slice(1);
const serve = args.some((val) => val === '--serve');

function createMainWindow(): BrowserWindow {
  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;

  log.info('App starting...');
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    frame: false,
    title: 'Twitch Desktop',
    backgroundColor: '#000',
    show: false,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      webSecurity: false,
      partition: 'persist:twitch',
      allowRunningInsecureContent: serve ? true : false
    }
  });

  // We set this to be able to acces the main window object inside angular application
  (global as any).mainWindow = win;

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
    win.show();
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
    win.show();
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  win.on('closed', () => {
    win = null;
    app.quit();
  });

  return win;
}

function sendStatusToWindow(text): void {
  log.info(text);
  auxWindow.webContents.send('message', text);
}

try {
  app.allowRendererProcessReuse = true;

  app.on('ready', () => {
    setTimeout(() => {
      if (serve) {
        createMainWindow();
      } else {
        auxWindow = new BrowserWindow({
          frame: true,
          width: 600,
          autoHideMenuBar: true,
          height: 300,
          show: true,
          backgroundColor: '#000',
          webPreferences: {
            webviewTag: true,
            nodeIntegration: true,
            webSecurity: false,
            partition: 'persist:twitch'
          }
        });
        auxWindow.on('close', () => {
          autoUpdater.removeAllListeners();
          auxWindow.removeAllListeners();
          createMainWindow();
        });

        auxWindow.loadURL(
          url.format({
            pathname: path.join(__dirname, `dist/update.html`),
            protocol: 'file:',
            slashes: true
          })
        );

        autoUpdater.checkForUpdates();
      }
    }, 400);
    autoUpdater.on('checking-for-update', () => {
      sendStatusToWindow('Checking for updates');
    });

    autoUpdater.on('update-available', () => {
      sendStatusToWindow('New update avaliable.');
      autoUpdater.downloadUpdate();
    });

    autoUpdater.on('update-not-available', () => {
      auxWindow.close();
    });

    autoUpdater.on('error', (err) => {
      sendStatusToWindow('Error in auto-updater. ' + err);
      auxWindow.close();
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let logMessage = 'Download speed: ' + progressObj.bytesPerSecond;
      logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%';
      logMessage =
        logMessage +
        ' (' +
        progressObj.transferred +
        '/' +
        progressObj.total +
        ')';
      sendStatusToWindow(logMessage);
    });

    autoUpdater.on('update-downloaded', () => {
      sendStatusToWindow('Update downloaded');
      setImmediate(() => autoUpdater.quitAndInstall());
    });
  });
} catch (e) {
  log.error(e);
}
