import { Injectable } from '@angular/core';
import Store from 'electron-store';

export interface IConfigType {
  betterttv: boolean;
  autologin: boolean;
  openlinks: boolean;
  buffer_length: number;
  notifications: boolean;
  preferred_quality: string;
}

const defaults: IConfigType = {
  betterttv: false,
  autologin: true,
  openlinks: true,
  buffer_length: 10,
  notifications: false,
  preferred_quality: 'auto'
};

@Injectable()
export class SettingsService {
  store = null;

  constructor() {
    this.store = new Store<IConfigType>({ defaults });
  }

  getConfig(): IConfigType {
    return this.store.store;
  }

  setConfig(config) {
    this.store.store = config;
  }

  getStore() {
    return this.store;
  }
}
