export const rewards = [
    {
        description: "Get 1 click bot",
        apply(clicker) {
            const bot = clicker.bots.clickbot;
            bot.purchased.set(bot.purchased() + 1);
        },
        maxLevel: 3,
    },
    {
        description: "Get 10 click bot",
        apply(clicker) {
            const bot = clicker.bots.clickbot;
            bot.purchased.set(bot.purchased() + 10);
        },
        minLevel: 3,
        maxLevel: 4,
    },
    {
        description: "Increase bot power!",
        apply(clicker) {
            clicker.multiplier.set(clicker.multiplier() + 1);
        },
        minLevel: 3,
    },
];
