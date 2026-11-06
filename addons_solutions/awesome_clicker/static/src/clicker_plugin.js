import { Plugin, signal, useListener, useEffect, usePlugin } from "@odoo/owl";
import { services } from "@web/core/services";
import { EffectPlugin } from "@web/core/effects/effect_plugin";
import { ActionPlugin } from "@web/webclient/actions/action_plugin";
import { NotificationPlugin } from "@web/core/notifications/notification_plugin";
import { ClickerStoragePlugin } from "./clicker_storage_plugin";
import { rewards } from "./click_rewards";
import { choose } from "./utils";

const MILESTONES = [
    { level: 1, clicks: 1000, unlock: "clickbot" },
    { level: 2, clicks: 5000, unlock: "bigbot" },
    { level: 3, clicks: 100000, unlock: "power multiplier" },
    { level: 4, clicks: 1000000, unlock: "pear tree & cherry tree" },
];

export class ClickerPlugin extends Plugin {
    clicks = signal(0);
    level = signal(0);
    multiplier = signal(1);
    effect = usePlugin(EffectPlugin);
    action = usePlugin(ActionPlugin);
    notification = usePlugin(NotificationPlugin);
    storage = usePlugin(ClickerStoragePlugin);

    bots = {
        clickbot: { price: 1000, level: 1, increment: 10, purchased: signal(0) },
        bigbot: { price: 5000, level: 2, increment: 100, purchased: signal(0) },
    };

    trees = {
        pearTree: { price: 1000000, level: 4, produce: "pear", purchased: signal(0) },
        cherryTree: { price: 1000000, level: 4, produce: "cherry", purchased: signal(0) },
        peachTree: { price: 1500000, level: 4, produce: "peach", purchased: signal(0) },
    };

    fruits = {
        pear: signal(0),
        cherry: signal(0),
        peach: signal(0),
    };

    setup() {
        this.storage.load(this);
        useListener(document.body, "click", () => this.increment(1), { capture: true });
        useEffect(() => this.storage.save(this));
        useEffect(() => {
            const interval = setInterval(() => this._tick(), 10000);
            return () => clearInterval(interval);
        });
        useEffect(() => {
            const interval = setInterval(() => this._tickFruits(), 30000);
            return () => clearInterval(interval);
        });
    }

    _tick() {
        let total = 0;
        for (const bot of Object.values(this.bots)) {
            total += bot.increment * bot.purchased() * this.multiplier();
        }
        this.clicks.set(this.clicks() + total);
    }

    _tickFruits() {
        for (const tree of Object.values(this.trees)) {
            const fruit = this.fruits[tree.produce];
            fruit.set(fruit() + tree.purchased());
        }
    }

    buyTree(name) {
        const tree = this.trees[name];
        if (!tree) {
            throw new Error(`Invalid tree name ${name}`);
        }
        if (this.clicks() < tree.price) {
            return false;
        }
        this.clicks.set(this.clicks() - tree.price);
        tree.purchased.set(tree.purchased() + 1);
    }

    buyMultiplier() {
        if (this.clicks() < 50000) {
            return false;
        }
        this.clicks.set(this.clicks() - 50000);
        this.multiplier.set(this.multiplier() + 1);
    }

    notify(unlock) {
        this.effect.add({
            message: `Milestone reached! You can now buy ${unlock}`,
            type: "rainbow_man",
        });
    }

    increment(inc) {
        this.clicks.set(this.clicks() + inc);
        const milestone = MILESTONES.find((m) => m.level === this.level() + 1);
        if (milestone && this.clicks() >= milestone.clicks) {
            this.notify(milestone.unlock);
            this.level.set(milestone.level);
        }
    }

    buyBot(name) {
        const bot = this.bots[name];
        if (!bot) {
            throw new Error(`Invalid bot name ${name}`);
        }
        if (this.clicks() < bot.price) {
            return false;
        }
        this.clicks.set(this.clicks() - bot.price);
        bot.purchased.set(bot.purchased() + 1);
    }

    giveReward() {
        const availableReward = [];
        for (const reward of rewards) {
            if (reward.minLevel <= this.level() || !reward.minLevel) {
                if (reward.maxLevel >= this.level() || !reward.maxLevel) {
                    availableReward.push(reward);
                }
            }
        }
        const reward = choose(availableReward);
        const closeNotification = this.notification.add(
            `Congrats you won a reward: "${reward.description}"`,
            {
                type: "success",
                sticky: true,
                buttons: [
                    {
                        name: "Collect",
                        onClick: () => {
                            reward.apply(this);
                            closeNotification();
                            this.action.doAction({
                                type: "ir.actions.client",
                                tag: "awesome_clicker.client_action",
                                target: "new",
                                name: "Clicker Game",
                            });
                        },
                    },
                ],
            }
        );
    }
}

services.add(ClickerPlugin);
