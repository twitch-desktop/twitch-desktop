import { Injectable } from "@angular/core";
import * as Store from "electron-store";

interface ConfigType {
  betterttv: boolean,
  autologin: boolean,
  openlinks: boolean,
  client_id: string,
  buffer_length: number
}
interface SampleStore {
  enabled: boolean;
  interval: number;
}

const defaults:ConfigType = {
  betterttv: false,
  autologin: true,
  openlinks: true,
  client_id: "",
  buffer_length: 10
};

@Injectable()
export class SettingsService {
  store = null;

  constructor() {
    this.store = new Store<ConfigType>({defaults: {defaults}});
  }

  getConfig() : ConfigType {
    return this.store.store;
  }

  setConfig(config) {
    this.store.store = config;
  }

  getStore() {
    return this.store;
  }
}
