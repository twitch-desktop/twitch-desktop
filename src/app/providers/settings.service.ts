import { Injectable } from "@angular/core";
import * as Store from 'electron-store';
import config from "~/../../config";
import { Scheduler } from "rxjs";

const schema: any = config.schema;

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