import { usePlugin } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { ActionPlugin } from "@web/webclient/actions/action_plugin";
import { ClickerPlugin } from "./clicker_plugin";

const commandProviderRegistry = registry.category("command_provider");

commandProviderRegistry.add("clicker", {
    provide() {
        const clicker = usePlugin(ClickerPlugin);
        const action = usePlugin(ActionPlugin);
        return [
            {
                name: "Buy 1 click bot",
                action() {
                    clicker.buyBot("clickbot");
                },
            },
            {
                name: "Open Clicker Game",
                action() {
                    action.doAction({
                        type: "ir.actions.client",
                        tag: "awesome_clicker.client_action",
                        target: "new",
                        name: "Clicker Game",
                    });
                },
            },
        ];
    },
});
