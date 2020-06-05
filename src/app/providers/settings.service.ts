import { Injectable } from '@angular/core';
import Store from 'electron-store';

export interface ConfigType {
  betterttv: boolean;
  frankerfacez: boolean;
  autologin: boolean;
  openlinks: boolean;
  bufferLength: number;
  notifications: boolean;
  preferredQuality: string;
}

const defaults: ConfigType = {
  betterttv: false,
  frankerfacez: false,
  autologin: true,
  openlinks: true,
  bufferLength: 10,
  notifications: false,
  preferredQuality: 'auto'
};

@Injectable()
export class SettingsService {
  store = null;

  constructor() {
    this.store = new Store<ConfigType>({ defaults });
  }

  getConfig(): ConfigType {
    return this.store.store;
  }

  setConfig(config): void {
    this.store.store = config;
  }

  getStore(): Store<ConfigType> {
    return this.store;
  }
}
