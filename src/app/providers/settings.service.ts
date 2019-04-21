import { Injectable } from "@angular/core";
import * as Store from 'electron-store';
import config from "../../../config";

const schema: any = config.schema;

// Service that allows components to display the error component from any 
// component displayed in router-outlet
@Injectable()
export class SettingsService {

    store = null;

    constructor() {
        this.store = new Store({ schema });
    }

    getConfig() {
        return this.store.store;
    }

    setConfig(config) {
        this.store.store = config;
    }

    getStore() {
      return this.store;
    }
}