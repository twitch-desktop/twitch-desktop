import { Injectable } from "@angular/core";
import Store from "electron-store";

interface ConfigType {
  betterttv: boolean;
  autologin: boolean;
  openlinks: boolean;
  buffer_length: number;
  notifications: boolean;
}

const defaults: ConfigType = {
  betterttv: false,
  autologin: true,
  openlinks: true,
  buffer_length: 10,
  notifications: false
};

@Injectable()
export class SettingsService {
  store = null;

  constructor() {
    this.store = new Store<ConfigType>({ defaults: defaults });
  }

  getConfig(): ConfigType {
    return this.store.store;
  }

  setConfig(config) {
    this.store.store = config;
  }

  getStore() {
    return this.store;
  }
}
