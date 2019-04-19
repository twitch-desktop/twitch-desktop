import { app, BrowserWindow, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as log from 'electron-log';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';
import * as request from "request-promise-native";
import * as querystring from "querystring";
import config from "./config";

let win, update_window, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

autoUpdater.logger = log;
autoUpdater.autoDownload = false;

log.info('App starting...');

async function createMainWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
  let icon = path.join(__dirname, 'dist/assets/icon.png')

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    frame: false,
    icon: icon,
    title: "Twitch Desktop",
    backgroundColor: "#221F2A",
    show: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      partition: "persist:twitch"
    },
  });

  // We set this to be able to acces the main window object inside angular application
  (<any>global).mainWindow = win;


  let base_url = "https://id.twitch.tv/oauth2/authorize?";

  let params = {
    response_type: "token",
    client_id: config.client_id,
    redirect_uri: "http://localhost",
    scope: ["user_read", "channel_read"].join(" "),
    force_verify: false
  };

  let authUrl = base_url + querystring.stringify(params);

  let authWindow = new BrowserWindow({
    show: false,
    // FIXME: Remove autoHideMenuBar when this issue is fixed
    // https://github.com/electron/electron/issues/15901
    autoHideMenuBar: true,
    width: 500,
    icon: icon,
    height: 800,
    title: "Twitch Desktop - Login",
    backgroundColor: "#221F2A",
    webPreferences: {
      nodeIntegration: false,
      partition: "persist:twitch"
    }
  });

  authWindow.webContents.on('will-redirect', (event, newUrl) => {
    if (newUrl.includes('access_token')) {
      // Get access_token from the redirect url
      let token_regex = /localhost\/#access_token=([a-z0-9]{30})/.exec(newUrl);
      let auth_token: string;
      // If we found the token on the redirect url
      if (token_regex && token_regex.length > 1 && token_regex[1]) {
        // Show the spinner and get the token
        auth_token = token_regex[1];
        (<any>global).auth_token = auth_token;
        authWindow.close();
      }
    }
  });

  authWindow.on('closed', async () => {
    if (serve) {
      let betterttv = await request('http://localhost:4200/assets/betterttv.js');
      (<any>global).betterttv = betterttv;

      require('electron-reload')(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`)
      });
      win.loadURL('http://localhost:4200');
      win.show();
    } else {

      let betterttv_dir = path.resolve(__dirname, 'dist/assets/betterttv.js');
      let betterttv = fs.readFileSync(betterttv_dir, 'utf8');
      (<any>global).betterttv = betterttv;

      win.loadURL(url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file:',
        slashes: true
      }));
      win.show();
    }

    if (serve) {
      win.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    win.on('closed', () => {
      win = null;
      app.quit();
    });
  });

  authWindow.webContents.on('did-stop-loading', () => {
    authWindow.webContents.insertCSS(`body{background:#221F2A!important;color:#dad8de!important}
    body>.authorize .wrap{background:#17141f!important;border-bottom:1px solid #201c2b!important}
      #header_logo svg path{fill:#fff!important}
      .authorize .signed_in .userinfo p{color:#fff!important}`);
  });

  authWindow.setMenu(null);
  authWindow.loadURL(authUrl);

  authWindow.show();
  if (serve) {
    authWindow.webContents.openDevTools();
  }
}

function sendStatusToWindow(text) {
  log.info(text);
  update_window.webContents.send('message', text);
}

try {
  app.on('ready', () => {
    if (serve) {

      createMainWindow();

    } else {

      update_window = new BrowserWindow({
        frame: true,
        icon: path.join(__dirname, 'dist/assets/icon.png'),
        width: 600,
        height: 300,
        show: true,
        backgroundColor: "#221F2A",
        webPreferences: {
          nodeIntegration: true,
          webSecurity: false
        }
      });

      update_window.on('closed', () => {
        autoUpdater.removeAllListeners();
        createMainWindow();
        update_window = null;
      });

      update_window.loadURL(url.format({
        pathname: path.join(__dirname, `dist/update.html`),
        protocol: 'file:',
        slashes: true
      }));

      autoUpdater.checkForUpdates();
    }
  });

  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for updates');
  });

  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('New update avaliable.');
    autoUpdater.downloadUpdate();
  });

  autoUpdater.on('update-not-available', (info) => {
    update_window.close();
  });

  autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
    update_window.close();
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
    setImmediate(() => autoUpdater.quitAndInstall());
  });
} catch (e) {
  log.error(e);
  // Catch Error
  // throw e;
}
