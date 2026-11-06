import { Plugin } from "@odoo/owl";
import { services } from "@web/core/services";
import { CURRENT_VERSION, migrate } from "./clicker_migration";

const STORAGE_KEY = "clickerState";

function dumpPurchased(dict) {
    return Object.fromEntries(Object.entries(dict).map(([name, v]) => [name, v.purchased()]));
}

function loadPurchased(dict, saved) {
    for (const [name, purchased] of Object.entries(saved)) {
        dict[name].purchased.set(purchased);
    }
}

function dumpSignals(dict) {
    return Object.fromEntries(Object.entries(dict).map(([name, s]) => [name, s()]));
}

function loadSignals(dict, saved) {
    for (const [name, value] of Object.entries(saved)) {
        dict[name].set(value);
    }
}

export class ClickerStoragePlugin extends Plugin {
    save(clicker) {
        const json = {
            version: CURRENT_VERSION,
            clicks: clicker.clicks(),
            level: clicker.level(),
            multiplier: clicker.multiplier(),
            bots: dumpPurchased(clicker.bots),
            trees: dumpPurchased(clicker.trees),
            fruits: dumpSignals(clicker.fruits),
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
    }

    load(clicker) {
        const value = window.localStorage.getItem(STORAGE_KEY);
        if (!value) {
            return;
        }
        const saved = migrate(JSON.parse(value));
        clicker.clicks.set(saved.clicks);
        clicker.level.set(saved.level);
        clicker.multiplier.set(saved.multiplier);
        loadPurchased(clicker.bots, saved.bots);
        loadPurchased(clicker.trees, saved.trees);
        loadSignals(clicker.fruits, saved.fruits);
    }
}

services.add(ClickerStoragePlugin);
