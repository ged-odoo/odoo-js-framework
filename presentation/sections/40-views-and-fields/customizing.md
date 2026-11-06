# Customizing fields and views

This project is a sequence of (mostly) independant exercises designed to teach
how to work with fields and views in Odoo.

The setting for this project is an addon that manages a shelter and various kind
of animals that are adopted. All the code is located in the `awesome_shelter`
addon.

To get started, you need a running Odoo server and a development environment
setup. Before getting into the exercises, make sure you have a working setup.
Clone [odoo-js-framework](https://github.com/ged-odoo/odoo-js-framework)
and start your odoo server with its `addons` folder in the addons path, then install the
`awesome_shelter` addon.

The `awesome_shelter` addon introduces a few useful models:

- `awesome_shelter.animal` represents a specific animal that has been rescued
- `awesome_shelter.animal_race` is a specific animal race, such as german
  sheperd.
- `awesome_shelter.animal_type` is a small model that help us categorize
  animals, such as "dogs" or "cats"

## 1. Add a ribbon

In the kanban and form view for an animal, it would be cool to have a visual
feedback showing that the animal is adopted. Let us do that by adding a ribbon!

This can be done by using an existing widget named `web_ribbon`

1. modify the form view to add a `web_ribbon` widget, which should be visible
   only when the state is `adopted`
2. do the same for the kanban view

![Add a ribbon](_images/add_ribbon.png)

<details>
<summary>Show solution</summary>

No JS in this one - `web_ribbon` is an existing widget, just used from the arch.

**views/views.xml**, the kanban card:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;t t-name="card" class="flex-row"&gt;
  &lt;aside class="o_kanban_aside_full"&gt;
    &lt;field name="picture" .../&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;t t-name="card" class="flex-row"&gt;
  &lt;widget name="web_ribbon" title="Adopted" bg_color="text-bg-success" invisible="state != 'adopted'"/&gt;
  &lt;aside class="o_kanban_aside_full"&gt;
    &lt;field name="picture" .../&gt;</code></pre>

</div>
</div>

and the form, the same way:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;form&gt;
  &lt;header&gt;
    &lt;field name="state" widget="statusbar" options="{ 'clickable': True }" /&gt;
  &lt;/header&gt;
  &lt;sheet&gt;
    &lt;group col="4"&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;form&gt;
  &lt;header&gt;
    &lt;field name="state" widget="statusbar" options="{ 'clickable': True }" /&gt;
  &lt;/header&gt;
  &lt;sheet&gt;
    &lt;widget name="web_ribbon" title="Adopted" bg_color="text-bg-success" invisible="state != 'adopted'"/&gt;
    &lt;group col="4"&gt;</code></pre>

</div>
</div>

</details>

## 2. Display a custom view banner

The previous exercise showed how to use a widget. In this exercise, we will
implement a new widget from scratch.

In the form view for the animal model, we want to display a banner with a
message when the animal has been adopted for more than 6 months.

1. create a new component named `LongStayBanner`
2. register it in the `view_widgets` registry
3. Use it in the form view:

   ```xml
       <widget name="long_stay_banner" invisible="state == 'adopted' or not is_present_for_six_month" class="mb-2"/>
   ```

![Custom view banner](_images/banner.png)

<details>
<summary>Show solution</summary>

**static/src/widgets/long_stay_banner.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, useProps, types as t } from "@odoo/owl";
import { registry } from "@web/core/registry";

class LongStayBannerWidget extends Component {
    static template = "shelter.LongStayBannerWidget";
    props = useProps({ record: t.object() });

    get animalName() {
        return this.props.record.data["display_name"];
    }
}

const longStayBannerWidget = {
    component: LongStayBannerWidget,
};

registry.category("view_widgets").add("long_stay_banner", longStayBannerWidget);</code></pre>

</div>
</div>

**static/src/widgets/long_stay_banner.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="shelter.LongStayBannerWidget"&gt;
        &lt;div class="bg-warning text-bg-warning p-2 rounded"&gt;
            Oh no, &lt;t t-out="this.animalName" /&gt; has been here for a long time...
        &lt;/div&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

**views/views.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;form&gt;
  &lt;header&gt;
    &lt;field name="state" widget="statusbar" options="{ 'clickable': True }" /&gt;
  &lt;/header&gt;
  &lt;sheet&gt;
    &lt;widget name="web_ribbon" .../&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;form&gt;
  &lt;widget name="long_stay_banner" invisible="state == 'adopted' or not is_present_for_six_month" class="mb-2"/&gt;
  &lt;header&gt;
    &lt;field name="state" widget="statusbar" options="{ 'clickable': True }" /&gt;
  &lt;/header&gt;
  &lt;sheet&gt;
    &lt;widget name="web_ribbon" .../&gt;</code></pre>

</div>
</div>

</details>

## 3. Subclass a char field

Let us now see how to specialize a field.

1. Subclass the charfield component from `@web/views/fields/char/char_field`
2. register it in the fields registry, and use the field in the form view
3. create a new template to add a button when the name is not set (this can be
   done with `xpaths` or using `t-call`)
4. when the button is clicked, choose a name from a hardcoded list of pet names,
   and set the value of the field

![Charfield subclass](_images/subcharfield.png)

<details>
<summary>Show solution</summary>

**static/src/fields/name_generator_field.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { registry } from "@web/core/registry";
import { charField } from "@web/views/fields/char/char_field";

class NameGeneratorField extends charField.component {
    static template = "shelter.NameGeneratorField";
    static names = [
        "Charlie", "Daisy", "Bella", "Lola", "Luna", "Milo", "Teddy", "Cooper",
        "Max", "Bailey", "Buddy", "Coco", "Leo", "Loki", "Lucy", "Chloé",
        "Oscar", "Rocky", "Sadie", "Bonnie", "Poppy",
    ];

    generate() {
        const name = NameGeneratorField.names[Math.floor(Math.random() * NameGeneratorField.names.length)];
        this.props.record.update({ [this.props.name]: name });
    }

    get shouldShowButton() {
        return !this.props.record.data[this.props.name];
    }
}

const nameGeneratorField = {
    ...charField,
    component: NameGeneratorField,
};

registry.category("fields").add("name_generator", nameGeneratorField);</code></pre>

</div>
</div>

No `props` field here: `CharField` already declares
`props = useProps(charFieldProps)`, and a class field a subclass doesn't
override is simply inherited.

**static/src/fields/name_generator_field.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="shelter.NameGeneratorField"&gt;
        &lt;button t-if="this.shouldShowButton" class="btn btn-secondary" t-on-click="this.generate"&gt;Generate&lt;/button&gt;
        &lt;t t-else="" t-call="web.CharField"/&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

**views/views.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;group col="2"&gt;
  &lt;field name="name" /&gt;
  &lt;field name="type_id" /&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;group col="2"&gt;
  &lt;field name="name" widget="name_generator" /&gt;
  &lt;field name="type_id" /&gt;</code></pre>

</div>
</div>

</details>

## 4. Customize a status bar widget

Let us now customize the status bar widget to display a more festive effect when
an animal is adopted, which usually happens when the shelter staff clicks on the
`adopted` status.

1. subclass the status bar field
2. register it in the fields registry, and use the field in the form view
3. override the `selectItem` to display a celebratory rainbow man when the
   animal is adopted

![Rainbowman](_images/rainbowadopted.png)

<details>
<summary>Show solution</summary>

**static/src/fields/statusbar_rainbowman_field.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { registry } from "@web/core/registry";
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

registry.category("fields").add("statusbar_rainbowman", statusbarRainbowManField);</code></pre>

</div>
</div>

**views/views.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;header&gt;
  &lt;field name="state" widget="statusbar" options="{ 'clickable': True }" /&gt;
&lt;/header&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;header&gt;
  &lt;field name="state" widget="statusbar_rainbowman" options="{ 'clickable': True, 'rainbow_stages': ['adopted'] }" /&gt;
&lt;/header&gt;</code></pre>

</div>
</div>

</details>

## 5. Display pictogram and type in list view

Animals have a type (cat, dog, etc). Those types can have a pictogram. We want
an extension of a one2many field widget to display the name and the pictogram a
little bit like the one2many_avatar, as a single element instead of two columns
in list view.

1. subclass the many2one field
2. use it in the list view
3. modify your field to display a pictogram if it is defined

![Rainbowman](_images/pictogram.png)

<details>
<summary>Show solution</summary>

**static/src/fields/animal_type_many_2_one.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { registry } from "@web/core/registry";
import { Many2OneField, buildM2OFieldDescription } from "@web/views/fields/many2one/many2one_field";
import { imageUrl } from "@web/core/utils/urls";
import { useProps, types as t } from "@odoo/owl";

const field = buildM2OFieldDescription(Many2OneField);

class AnimalTypeManyToOne extends Many2OneField {
    static template = "shelter.AnimalTypeManyToOne";
    // this.props stays Many2OneField's own inherited declaration - only the
    // one prop this class actually adds needs declaring, as its own field
    newProps = useProps({ imageField: t.string() });

    get pictogramUrl() {
        return imageUrl(this.props.record.resModel, this.props.record.resId, this.newProps.imageField);
    }

    get hasImage() {
        return Boolean(this.props.record.data[this.newProps.imageField]);
    }
}

const animalTypeManyToOne = {
    ...field,
    component: AnimalTypeManyToOne,
    fieldDependencies: [...field.fieldDependencies || [], { name: "pictogram", type: "image" }],
    extractProps({ options }) {
        const props = field.extractProps(...arguments);
        props.imageField = options.image_field;
        return props;
    },
};

registry.category("fields").add("animal_type_many2one", animalTypeManyToOne);</code></pre>

</div>
</div>

**static/src/fields/animal_type_many_2_one.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="shelter.AnimalTypeManyToOne" t-inherit="web.Many2OneField"&gt;
        &lt;xpath expr="//Many2One" position="replace"&gt;
            &lt;div class="d-flex align-items-center"&gt;
                &lt;Many2One t-props="this.m2oProps"/&gt;
                &lt;img t-if="this.hasImage" t-att-src="this.pictogramUrl" class="ms-2" style="width: 18px; height: 18px;"/&gt;
            &lt;/div&gt;
        &lt;/xpath&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

`web.Many2OneField`'s own arch is just `<Many2One t-props="this.m2oProps"/>` - appending the image next to it with `position="inside"` on the template root makes it a sibling of `Many2One`'s own rendered `<div class="o_many2one">`, and that div's readonly display is a `w-100` anchor, so anything after it wraps to its own line rather than sitting next to the type name. Replacing the `<Many2One>` tag with a small flex wrapper around it and the image fixes that.

**views/views.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;list string="Animals"&gt;
  &lt;field name="name" /&gt;
  &lt;field name="type_id" /&gt;
  &lt;field name="pictogram" widget="image" options="{ 'size': [18, 18] }"/&gt;
  &lt;field name="owner_id" widget="many2one_avatar"/&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;list string="Animals"&gt;
  &lt;field name="name" /&gt;
  &lt;field name="type_id" widget="animal_type_many2one" options="{ 'image_field': 'pictogram' }" /&gt;
  &lt;field name="owner_id" widget="many2one_avatar"/&gt;</code></pre>

</div>
</div>

The `pictogram` field it replaces (a plain `widget="image"` column) is dropped from the list at the same time - the new field shows both.

</details>

## 6. Extend a view

Finally, it sometimes happens that we need to work with views instead of fields.

For this exercise, we want to modify the kanban view to reload its data every 10
seconds or so. This is because the shelter staff want to display it on a small
external screen as a visual monitoring tool.

1. Subclass the kanban view
2. register your kanban view in the `views` registry, and use it (with
   `js_class` attribute) in the animal kanban view
3. Modify the code to reload every 10s

<details>
<summary>Show solution</summary>

**static/src/views/kanban_view.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { kanbanView } from "@web/views/kanban/kanban_view";
import { registry } from "@web/core/registry";
import { useEffect } from "@odoo/owl";

class ShelterKanbanController extends kanbanView.Controller {
    setup() {
        super.setup();
        useEffect(() => {
            const interval = window.setInterval(() => this.model.load(), 10000);
            return () => window.clearInterval(interval);
        });
    }
}

const shelterKanbanView = {
    ...kanbanView,
    Controller: ShelterKanbanController,
};

registry.category("views").add("shelter_kanban", shelterKanbanView);</code></pre>

</div>
</div>

**views/views.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;kanban&gt;
  &lt;templates&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;kanban js_class="shelter_kanban"&gt;
  &lt;templates&gt;</code></pre>

</div>
</div>

</details>
