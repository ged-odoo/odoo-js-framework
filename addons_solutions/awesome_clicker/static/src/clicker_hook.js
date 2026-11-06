import { usePlugin } from "@odoo/owl";
import { ClickerPlugin } from "./clicker_plugin";

export function useClicker() {
    return usePlugin(ClickerPlugin);
}
