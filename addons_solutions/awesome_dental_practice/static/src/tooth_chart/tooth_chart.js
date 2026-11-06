import { Component, useProps, types as t } from "@odoo/owl";

const toothShape = t.object({
    color: t.number(),
    tooltipInfo: t.string().optional(),
});

export class ToothChart extends Component {
    static template = "awesome_dental_practice.ToothChart";

    props = useProps({
        // keyed by tooth number (11-48), any key accepted
        tooth: t.record(toothShape),
        tooltipTemplate: t.string().optional(),
        toothSelected: t.function().optional(() => () => {}),
    });
}
