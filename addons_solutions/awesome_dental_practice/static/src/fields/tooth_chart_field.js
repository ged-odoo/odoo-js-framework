import { Component, computed, useProps, usePlugin } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { formatDate } from "@web/core/l10n/dates";
import { ToothChart } from "../tooth_chart/tooth_chart";
import { ActionPlugin } from "@web/webclient/actions/action_plugin";
import { deepCopy } from "@web/core/utils/objects";

const TOOTH_NUMBERS = [
    11, 12, 13, 14, 15, 16, 17, 18,
    21, 22, 23, 24, 25, 26, 27, 28,
    31, 32, 33, 34, 35, 36, 37, 38,
    41, 42, 43, 44, 45, 46, 47, 48,
];

class ToothChartField extends Component {
    static template = "awesome_dental_practice.ToothChartField";
    static components = { ToothChart };

    props = useProps({
        name: standardFieldProps.name,
        record: standardFieldProps.record,
    });
    action = usePlugin(ActionPlugin);
    // a pure derivation of the record's own o2m data - recomputes on its
    // own whenever that changes (loading, or record.load() after saving an
    // intervention), no manual subscription/mutation needed
    tooth = computed(() => {
        const tooth = {};
        for (const n of TOOTH_NUMBERS) {
            tooth[n] = { color: 0, tooltipInfo: { data: [] } };
        }
        const records = [...this.props.record.data[this.props.name].records].reverse();
        for (const rec of records) {
            if (["tooth", "part"].includes(rec.data.dental_care_type)) {
                tooth[rec.data.dental_tooth].color = rec.data.color;
                tooth[rec.data.dental_tooth].tooltipInfo.data.push({
                    id: rec.id,
                    name: rec.data.name,
                    date: formatDate(rec.data.date),
                    dental_position: rec.data.dental_position,
                });
            }
        }
        return tooth;
    });
    // same derivation, JSON-stringified for the tooltip attribute
    toothData = computed(() => {
        const toothData = deepCopy(this.tooth());
        Object.keys(toothData).forEach( (teeth) => toothData[teeth].tooltipInfo = JSON.stringify(toothData[teeth].tooltipInfo));
        return toothData;
    });

    openInterventionWizard(context) {
        this.action.doAction({
            name: _t("Intervention"),
            type: "ir.actions.act_window",
            res_model: "dental.intervention.wizard",
            views: [[false, "form"]],
            view_mode: "form",
            target: "new",
            context: {
                default_partner_id: this.props.record.resId,
                ...context,
            }},{
                onClose: () => {
                    this.props.record.load();
                },
            });
    }

    toothSelected(tooth) {
        // a particular tooth was picked: whole-mouth care doesn't belong here
        this.openInterventionWizard({
            default_dental_tooth: tooth.toString(),
            dental_care_type_filter: "tooth",
        });
    }

    mouthCareSelected() {
        // no particular tooth: restrict the product choice to whole-mouth
        // care (cleaning...), the only kind that doesn't need one
        this.openInterventionWizard({ dental_care_type_filter: "mouth" });
    }
}

const toothChartField = {
    component: ToothChartField,
    displayName: _t("ToothChartField"),
    supportedTypes: ["one2many"],
    isEmpty: () => false,
    relatedFields: () => {
        return [
               { name: "name", type: "char" },
               { name: "date", type: "date" },
               { name: "product_id", type: "many2one", relation: "product.product" },
               { name: "partner_id", type: "many2one", relation: "res.partner" },
               { name: "dental_tooth", type: "integer" },
               { name: "color", type: "integer" },
               { name: "dental_care_type", type: "select" },
               { name: "dental_position", type: "selection", selection: [
                    ["outside", _t("Outside")],
                    ["top", _t("Top")],
                    ["inside", _t("Inside")],
                ]},
        ];
    },
};

registry.category("fields").add("tooth_chart", toothChartField);
