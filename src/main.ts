///<reference path="../typings/browser.d.ts"/>

import { app, session, BrowserWindow, Menu, crashReporter, shell } from "electron";

let mainWindow = null;

app.on("window-all-closed", function () {
  app.quit();
});

app.on("ready", function () {

  mainWindow = new BrowserWindow({ width: 1066, height: 590, frame: false, title: "Twitch Desktop", backgroundColor: "#221F2A"});

  // We set this to be able to acces the main window object inside angular application
  (<any>global).mainWindow = mainWindow;

  const filter = {
    urls: ["http://usher.twitch.tv/*"]
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders["Client-ID"] = "jzkbprff40iqj646a697cyrvl0zt2m6";
    callback({cancel: false, requestHeaders: details.requestHeaders});
  });

  mainWindow.loadURL("file://" + __dirname + "/index.html");
  const ses = mainWindow.webContents.session;


  mainWindow.on("closed", function () {
    mainWindow = null;
  });

});