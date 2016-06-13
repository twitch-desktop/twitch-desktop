///<reference path="../typings/browser.d.ts"/>

import { app, BrowserWindow, Menu, crashReporter, shell } from "electron";

let mainWindow = null;

app.on("window-all-closed", function () {
  app.quit();
});

app.on("ready", function () {

  mainWindow = new BrowserWindow({ width: 1066, height: 590, frame: false});

  // We set this to be able to acces the main window object inside angular application
  (<any>global).mainWindow = mainWindow;

  mainWindow.loadURL("file://" + __dirname + "/index.html");

  mainWindow.on("closed", function () {
    mainWindow = null;
  });

});