import { registry } from "@web/core/registry";
import { usePlugin, useProps, types as t } from "@odoo/owl";
import { EffectPlugin } from "@web/core/effects/effect_plugin";
import { statusBarField } from "@web/views/fields/statusbar/statusbar_field";

class StatusbarRainbowManField extends statusBarField.component {
    // this.props stays StatusBarField's own inherited declaration - only the
    // one prop this class actually adds needs declaring, as its own field
    newProps = useProps({ rainbowStages: t.array() });
    effect = usePlugin(EffectPlugin);

    async selectItem(item) {
        super.selectItem(item);
        if (this.newProps.rainbowStages.includes(item.value)) {
            this.effect.add({ message: "A new happy life on the making" });
        }
    }
}

const statusbarRainbowManField = {
    ...statusBarField,
    additionalClasses: ["o_field_statusbar"],
    component: StatusbarRainbowManField,
    extractProps({ options }) {
        const props = statusBarField.extractProps(...arguments);
        props.rainbowStages = options.rainbow_stages;
        return props;
    },
};

registry.category("fields").add("statusbar_rainbowman", statusbarRainbowManField);
