import { Component, usePlugin } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { ActionPlugin } from "@web/webclient/actions/action_plugin";
import { useClicker } from "../clicker_hook";
import { ClickerValue } from "../clicker_value/clicker_value";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";

export class ClickerSystray extends Component {
    static template = "awesome_clicker.ClickerSystray";
    static components = { ClickerValue, Dropdown, DropdownItem };

    action = usePlugin(ActionPlugin);
    clicker = useClicker();

    openClientAction() {
        this.action.doAction({
            type: "ir.actions.client",
            tag: "awesome_clicker.client_action",
            target: "new",
            name: "Clicker Game"
        });
    }

    get numberTrees() {
        let sum = 0;
        for (const tree of Object.values(this.clicker.trees)) {
            sum += tree.purchased();
        }
        return sum;
    }

    get numberFruits() {
        let sum = 0;
        for (const fruit of Object.values(this.clicker.fruits)) {
            sum += fruit();
        }
        return sum;
    }
}

export const systrayItem = {
    Component: ClickerSystray,
};

registry.category("systray").add("awesome_clicker.ClickerSystray", systrayItem, { sequence: 1000 });
