# Dental Practice

A many2one field is a familiar shape: a dropdown. This exercise draws one
differently - as a set of teeth - to practice everything a field can do: props
and their validation, reading and writing a record, a sub component, and
opening another view from inside a field.

The setting is the `awesome_dental_practice` addon: a res.partner gets a "Dental Care"
tab, showing every tooth as a small SVG shape. Clicking a tooth (or the "Mouth
Care" button, for care that isn't tied to one) opens a wizard to record an
intervention - a treatment product, from a category the addon already sets up,
tied to that tooth. The teeth already treated are colored, and hovering one
shows a tooltip with the details.

To get started, you need a running Odoo server and a development environment
setup. Clone [odoo-js-framework](https://github.com/ged-odoo/odoo-js-framework)
and start your odoo server with its `addons` folder in the addons path, then
install the `awesome_dental_practice` addon, open a patient (Dental Practice > Patient)
and its "Dental Care" tab.

The addon ships as a skeleton. Its models (`dental.py`), security, demo data
and SCSS are already there, and so is every tooth's hand-drawn SVG geometry.
What's missing is the JS: two components, `ToothChart` (the chart itself) and
`ToothChartField` (the field that feeds it the record's data), each currently
just enough to install and render "Hello world". The finished addon is at
`addons_solutions/awesome_dental_practice` in the same repository, same name - point
the addons path at `addons_solutions` instead to see it working, or to compare against your own.

![The finished chart](_images/dental_practice_chart.png)

Every step below shows its solution as before and after, side by side, only
what changed marked - click to open it once you've had a go, or to check your
work against it.

## 1. The tooth chart, part 1: props

`static/src/tooth_chart/tooth_chart.js` is where `ToothChart` lives: the
component that only knows how to draw teeth, with no idea where the data comes
from. It needs three props:

- `tooth`, a record keyed by tooth number (11 to 48), each entry an object
  with a `color` (an integer) and a `tooltipInfo` (a string: it has to be
  valid JSON, for the tooltip service to read - not an object)
- `tooltipTemplate`, the name of the template the tooltip is rendered from
- `toothSelected`, a callback invoked with the tooth number that was clicked

Give `ToothChart` a `props = useProps({...})` schema for the three of them.

<details>
<summary>Show solution</summary>

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Component } from "@odoo/owl";

export class ToothChart extends Component {
    static template = "awesome_dental_practice.ToothChart";
}</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, useProps, types as t } from "@odoo/owl";

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
}</code></pre>

</div>
</div>

</details>

## 2. The tooth chart, part 2: wiring the SVG

`static/src/tooth_chart/tooth_chart.xml` already draws all 32 teeth: each one
is a `<path class="parent" d="...">`, its `d` a hand-drawn outline, plus a
handful of undecorated detail paths around it that need no changes at all.
None of the 32 outlines reacts to anything yet.

For the tooth numbered 11 (then, the same way, for the other 31 - only the
number changes), add four attributes to its `<path class="parent">`:

- `t-att-data-tooltip-template`, pointing at `this.props.tooltipTemplate`
- `t-att-data-tooltip-info`, pointing at `this.props.tooth['11'].tooltipInfo`
- `t-attf-class`, `o_dental_chart_tooth_color_{{this.props.tooth['11'].color}}`
- `t-on-click`, calling `this.props.toothSelected(11)`

<details>
<summary>Show solution</summary>

Tooth 11 only, reformatted onto several lines and its `d` geometry elided
(`d="…"`) to stay readable - in the real file it's one long line, geometry
included, and the same four attributes repeat on all 32 `<path class="parent">`
elements, only the tooth number changing each time.

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;svg ...&gt;
    &lt;path class="parent" d="m 113.894,…"/&gt;
    &lt;path d="…" style="..."/&gt;
    ...
&lt;/svg&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;svg ...&gt;
    &lt;path class="parent"
          t-att-data-tooltip-template="this.props.tooltipTemplate"
          t-att-data-tooltip-info="this.props.tooth['11'].tooltipInfo"
          t-attf-class="o_dental_chart_tooth_color_{{this.props.tooth['11'].color}}"
          t-on-click="() => this.props.toothSelected(11)"
          d="m 113.894,…"/&gt;
    &lt;path d="…" style="..."/&gt;
    ...
&lt;/svg&gt;</code></pre>

</div>
</div>

</details>

## 3. The field, part 1: rendering the chart

`static/src/fields/tooth_chart_field.js` is the actual field, `tooth_chart` -
what an `intervention_ids` one2many field with `widget="tooth_chart"` renders.
Its template, `tooth_chart_field.xml`, currently just says "Hello world".

Replace that with a `<ToothChart>`, passing it a `tooltipTemplate` (the addon
already ships one, `awesome_dental_practice.Tooltip`) and a `toothSelected` bound to a
method of the same name on `ToothChartField`. Add a "Mouth Care" button next to
it, calling a `mouthCareSelected` method.

Both methods, for now, can stay empty - part 3 is where they open the wizard.
You'll also need to pass `tooth`: part 2's SVG unconditionally reads every
tooth's `color`/`tooltipInfo`, for all 32 teeth, on every render, so `{}`
isn't enough - build a default entry for each tooth number instead (`color: 0`,
`tooltipInfo` a JSON string of `{data: []}`, since that's the shape part 2's
tooltip already expects). Part 2 (next) is where that default gets replaced by
the record's real data.

<details>
<summary>Show solution</summary>

`static/src/fields/tooth_chart_field.js`, a default `toothData` covering all
32 teeth, and `ToothChart` registered as a sub component:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Component, useProps } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

class ToothChartField extends Component {
    static template = "awesome_dental_practice.ToothChartField";

    props = useProps({
        name: standardFieldProps.name,
        record: standardFieldProps.record,
    });
}</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, useProps } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { ToothChart } from "../tooth_chart/tooth_chart";

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
    toothData = Object.fromEntries(
        TOOTH_NUMBERS.map((n) => [n, { color: 0, tooltipInfo: JSON.stringify({ data: [] }) }])
    );

    toothSelected(tooth) {}

    mouthCareSelected() {}
}</code></pre>

</div>
</div>

`static/src/fields/tooth_chart_field.xml`

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_dental_practice.ToothChartField"&gt;
        Hello world
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_dental_practice.ToothChartField"&gt;
        &lt;div&gt;
            &lt;ToothChart tooth="this.toothData" tooltipTemplate="'awesome_dental_practice.Tooltip'" toothSelected.bind="this.toothSelected"/&gt;
            &lt;button type="button" class="btn btn-secondary mt-2" t-on-click="() => this.mouthCareSelected()"&gt;Mouth Care&lt;/button&gt;
        &lt;/div&gt;
    &lt;/t&gt;
    &lt;t t-name="awesome_dental_practice.Tooltip"&gt;
        &lt;div class="o-tooltip"&gt;
            &lt;t t-if="data.length === 0"&gt;
                &lt;span&gt;No information&lt;/span&gt;
            &lt;/t&gt;
            &lt;t t-else=""&gt;
                &lt;table class="table o-tooltip--string"&gt;
                    &lt;thead&gt;
                        &lt;tr&gt;
                        &lt;th scope="col"&gt;Name&lt;/th&gt;
                        &lt;th scope="col"&gt;Date&lt;/th&gt;
                        &lt;th scope="col"&gt;Position&lt;/th&gt;
                        &lt;/tr&gt;
                    &lt;/thead&gt;
                    &lt;tbody&gt;
                        &lt;t t-foreach="data" t-as="d" t-key="d.id"&gt;
                            &lt;tr&gt;
                                &lt;td&gt;&lt;span t-out="d.name"/&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span t-out="d.date"/&gt;&lt;/td&gt;
                                &lt;td&gt;&lt;span t-if="d.dental_position" t-out="d.dental_position"/&gt;&lt;/td&gt;
                            &lt;/tr&gt;
                        &lt;/t&gt;
                    &lt;/tbody&gt;
                &lt;/table&gt;
            &lt;/t&gt;
        &lt;/div&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

`awesome_dental_practice.Tooltip` is the tooltip's own template, also part of this
file: it isn't used by `ToothChartField` directly, only by name, through
`tooltipTemplate` and the `t-att-data-tooltip-template`/`t-att-data-tooltip-info`
attributes from part 2 of the tooth chart - Odoo's tooltip service reads those
straight off the DOM element, at hover time.

</details>

## 4. The field, part 2: a tooth's state

`ToothChartField`'s `props.record` carries the o2m's own records, under
`this.props.record.data[this.props.name].records` - each one an intervention:
`dental_tooth`, `dental_care_type`, `color`, `product_id`, `date`... Turn that
into the `tooth` object `ToothChart` actually needs: `{ 11: {color, tooltipInfo},
12: {...}, ... }`, one entry per tooth number, defaulting to `{color: 0,
tooltipInfo: {data: []}}` for a tooth with no intervention yet.

Build it as a `computed()`, keyed off the record's own o2m data, so it
recomputes on its own whenever that changes. Only interventions where
`dental_care_type` is `"tooth"` or `"part"` belong on a numbered tooth - a
`"mouth"` intervention has no `dental_tooth` at all.

`t-att-data-tooltip-info` needs a JSON *string*, not an object - keep
`toothData` as the `<ToothChart>` `tooth` prop, but make it a second
`computed()`, deriving from the first, that `JSON.stringify`s each tooth's
`tooltipInfo`. The template's `this.toothData` becomes `this.toothData()`,
now that it's callable.

<details>
<summary>Show solution</summary>

`relatedFields`, `displayName`, `toothSelected`, `mouthCareSelected` and the
rest of the field's registration below the class don't change in this step
(the two methods stay the same empty stubs from part 1) - left out here,
unchanged.

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Component, useProps } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { ToothChart } from "../tooth_chart/tooth_chart";

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
    toothData = Object.fromEntries(
        TOOTH_NUMBERS.map((n) => [n, { color: 0, tooltipInfo: JSON.stringify({ data: [] }) }])
    );</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, computed, useProps } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { formatDate } from "@web/core/l10n/dates";
import { ToothChart } from "../tooth_chart/tooth_chart";
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
}</code></pre>

</div>
</div>

`static/src/fields/tooth_chart_field.xml`, one word:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;ToothChart tooth="this.toothData" tooltipTemplate="'awesome_dental_practice.Tooltip'" toothSelected.bind="this.toothSelected"/&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;ToothChart tooth="this.toothData()" tooltipTemplate="'awesome_dental_practice.Tooltip'" toothSelected.bind="this.toothSelected"/&gt;</code></pre>

</div>
</div>

Records are read in reverse (`[...records].reverse()`) so that, if a tooth
somehow ends up with more than one intervention, the tooltip lists the most
recent one first.

</details>

## 5. The field, part 3: opening the wizard

`toothSelected(tooth)` and `mouthCareSelected()` both need to open
`dental.intervention.wizard`, as a dialog (`target: "new"`), with
`default_partner_id` set to the record's own id - and reload the record
(`this.props.record.load()`) once the dialog closes, so the chart picks up the
new intervention. Factor that shared part into an `openInterventionWizard`
helper, called with just what differs:

- `toothSelected(tooth)` passes `default_dental_tooth: tooth.toString()` and
  `dental_care_type_filter: "tooth"` (a specific tooth was clicked - whole
  mouth care doesn't belong there)
- `mouthCareSelected()` passes `dental_care_type_filter: "mouth"` only (no
  tooth to set)

`dental_care_type_filter` is read by the wizard's own `product_id` domain,
already written into `views/dental.xml` - it restricts the product choice to
match.

You'll need the `ActionPlugin` (`usePlugin(ActionPlugin)`) to open the dialog.

<details>
<summary>Show solution</summary>

<div class="diff-cols">
<div class="before">
<h4>Before (end of part 2)</h4>

<pre><code class="language-javascript">import { Component, computed, useProps } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";
import { registry } from "@web/core/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";
import { formatDate } from "@web/core/l10n/dates";
import { ToothChart } from "../tooth_chart/tooth_chart";
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
}</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, computed, useProps, usePlugin } from "@odoo/owl";
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
}</code></pre>

</div>
</div>

That's the whole exercise: a props-validated sub component, a field deriving
its state with `computed()`, and a field opening another view on the side.

</details>
