# Building a dashboard, part 1

It is now time to learn about the Odoo JavaScript framework in its entirety, as
used by the web client. This document is a complete standalone project, in which
we will implement a dashboard client action. It is mostly an excuse to discover
and practice many features of the odoo web framework!

![Overview](_images/overview_02.png)

## Project setup

To get started, you need a running Odoo server and a development environment
setup. Before getting into the exercises, make sure you have a working setup.
Clone [odoo-js-framework](https://github.com/ged-odoo/odoo-js-framework)
and start your odoo server with its `addons` folder in the addons path, then install the
`awesome_dashboard` addon.

For this project, we will start from the empty dashboard provided by the
`awesome_dashboard` addon. Then, we will progressively add features to it using
the Odoo JavaScript framework.

Note that a lot of theory is covered in the slides for this event. Also, don't
hesitate to ask questions!

This page is steps 1 to 4. Steps 5 to 14 continue in *Building a dashboard,
part 2*, after the second half of the presentation.

## 1. A Common Layout

Most screens in the Odoo web client uses a common layout: a control panel on
top, with some buttons, and a main content zone just below. This is done using
the `Layout` component, available in `@web/search/layout`.

1. Update the `AwesomeDashboard` component located in
   `awesome_dashboard/static/src/` to use the `Layout` component. You can use
   `{controlPanel: {} }` for the display props of the `Layout` component.
2. Add a className prop to `Layout`: `className="'o_dashboard h-100'"`
3. Add a `dashboard.scss` file in which you set the `background-color` of
   .`o_dashboard` to gray (or your favorite color)
4. Open http://localhost:8069/odoo, then open the Awesome Dashboard app, and see
   the result.

![Layout component](_images/new_layout.png)

<details>
<summary>Show solution</summary>

**static/src/dashboard.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
}</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout };
}</code></pre>

</div>
</div>

**static/src/dashboard.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;t t-name="awesome_dashboard.AwesomeDashboard"&gt;
    hello dashboard
&lt;/t&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;t t-name="awesome_dashboard.AwesomeDashboard"&gt;
    &lt;Layout display="{controlPanel: {} } " className="'o_dashboard h-100'"&gt;
        some content
    &lt;/Layout&gt;
&lt;/t&gt;</code></pre>

</div>
</div>

**static/src/dashboard.scss**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-scss"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-scss">.o_dashboard {
    background-color: gray;
}</code></pre>

</div>
</div>

</details>

#### See also

- Example:
  [use of Layout in client action](https://github.com/odoo/odoo/blob/c5dce9c319b06a14553d30a0f6c777ab88321eac/addons/web/static/src/webclient/actions/reports/report_action.js)
  and
  [template](https://github.com/odoo/odoo/blob/c5dce9c319b06a14553d30a0f6c777ab88321eac/addons/web/static/src/webclient/actions/reports/report_action.xml)
- Example:
  [use of Layout in kanban views](https://github.com/odoo/odoo/blob/c5dce9c319b06a14553d30a0f6c777ab88321eac/addons/web/static/src/views/kanban/kanban_controller.xml)

## 2. Add some buttons for quick navigation

One important piece of the framework is the `ActionPlugin`: it can execute
all kind of standard actions defined by Odoo. For example, here is how one
component could execute an action by its xml id:

```js
import { usePlugin } from "@odoo/owl";
import { ActionPlugin } from "@web/webclient/actions/action_plugin";
...
action = usePlugin(ActionPlugin);
...
openSettings() {
      this.action.doAction("base_setup.action_general_configuration");
}
...
```

Note that `usePlugin` doesn't need `setup()` - a class field is enough.

Let us now add two buttons to our control panel:

1. A button `Customers`, which opens a kanban view with all customers (this
   action already exists, so you should use its
   [xml id](https://github.com/odoo/odoo/blob/1f4e583ba20a01f4c44b0a4ada42c4d3bb074273/odoo/addons/base/views/res_partner_views.xml#L510)).
2. A button `Leads`, which opens a dynamic action on the `crm.lead` model with a
   list and a form view, the same way as above.

![Navigation buttons](_images/navigation_buttons.png)

<details>
<summary>Show solution</summary>

**static/src/dashboard.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout };
}</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, usePlugin } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";
import { ActionPlugin } from "@web/webclient/actions/action_plugin";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout };
    action = usePlugin(ActionPlugin);

    openCustomerView() {
        this.action.doAction("base.action_partner_form");
    }

    openLeads() {
        this.action.doAction({
            type: "ir.actions.act_window",
            name: "All leads",
            res_model: "crm.lead",
            views: [
                [false, "list"],
                [false, "form"],
            ],
        });
    }
}</code></pre>

</div>
</div>

**static/src/dashboard.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;Layout display="{controlPanel: {} } " className="'o_dashboard h-100'"&gt;
    some content
&lt;/Layout&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;Layout display="{controlPanel: {buttons: true} } " className="'o_dashboard h-100'"&gt;
    &lt;t t-set-slot="control-panel-buttons"&gt;
        &lt;button class="btn btn-primary" t-on-click="this.openCustomerView"&gt;Customers&lt;/button&gt;
        &lt;button class="btn btn-primary" t-on-click="this.openLeads"&gt;Leads&lt;/button&gt;
    &lt;/t&gt;
    some content
&lt;/Layout&gt;</code></pre>

</div>
</div>

</details>

## 3. Add a dashboard item

Let us now improve the content of this dashboard.

1. Create a generic `DashboardItem` component that display its default slot in a
   nice card layout. It should take an optional `size` number props, that
   default to 1. The width should be hardcoded to `(18*size)rem`.
2. Add two cards to the dashboard. One with no size, and the other with a size
   of 2.

![Dashboard items](_images/dashboard_item.png)

<details>
<summary>Show solution</summary>

`dashboard.js` imports `DashboardItem` and adds it to `static components`, the
same way it already did for `Layout` - nothing new there.

**static/src/dashboard_item.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, useProps, types as t } from "@odoo/owl";

export class DashboardItem extends Component {
    static template = "awesome_dashboard.DashboardItem";
    props = useProps({
        size: t.number().optional(1),
    });
}</code></pre>

</div>
</div>

**static/src/dashboard_item.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8" ?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_dashboard.DashboardItem"&gt;
        &lt;div class="card m-2 border-dark" t-attf-style="width: {{18*this.props.size}}rem;"&gt;
            &lt;div class="card-body"&gt;
                &lt;t t-call-slot="default"/&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

**static/src/dashboard.xml**, two cards added:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;Layout display="{controlPanel: {buttons: true} } " className="'o_dashboard h-100'"&gt;
    ...
    some content
&lt;/Layout&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;Layout display="{controlPanel: {buttons: true} } " className="'o_dashboard h-100'"&gt;
    ...
    &lt;div class="d-flex flex-wrap"&gt;
        &lt;DashboardItem&gt;
            some content
        &lt;/DashboardItem&gt;
        &lt;DashboardItem size="2"&gt;
            I love milk
        &lt;/DashboardItem&gt;
    &lt;/div&gt;
&lt;/Layout&gt;</code></pre>

</div>
</div>

</details>

**See also:**
[Owl slot system](https://odoo.github.io/owl/documentation/v3/owl/reference/slots.html)

## 4. Call the server, add some statistics

Let’s improve the dashboard by adding a few dashboard items to display real
business data. The `awesome_dashboard` addon provides a
`/awesome_dashboard/statistics` route that is meant to return some interesting
information.

To call a specific controller, we need to use the `rpc` function. This function
`rpc(route, params, settings)` is the low level communication code that will
create a network request to the server in jsonrpc, then will return a promise
with the result. A basic request could look like this:

```js
import { rpc } from "@web/core/network/rpc";
...
setup() {
      onWillStart(async () => {
         const result = await rpc("/my/controller", {a: 1, b: 2});
         // ...
      });
}
...
```

1. Update Dashboard so that it uses the `rpc` function.
2. Call the statistics route `/awesome_dashboard/statistics` in the
   `onWillStart` hook.
3. Display a few cards in the dashboard containing:
   - Number of new orders this month
   - Total amount of new orders this month
   - Average amount of t-shirt by order this month
   - Number of cancelled orders this month
   - Average time for an order to go from ‘new’ to ‘sent’ or ‘cancelled’

![Statistics](_images/statistics1.png)

<details>
<summary>Show solution</summary>

**static/src/dashboard.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Component, usePlugin } from "@odoo/owl";
...
    action = usePlugin(ActionPlugin);</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, usePlugin, onWillStart, signal } from "@odoo/owl";
...
    action = usePlugin(ActionPlugin);

    statistics = signal(null);

    setup() {
        onWillStart(async () => {
            const data = await rpc("/awesome_dashboard/statistics");
            this.statistics.set(data);
        });
    }</code></pre>

</div>
</div>

(also add `import { rpc } from "@web/core/network/rpc";` at the top)

**static/src/dashboard.xml**, one `DashboardItem` per statistic:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;div class="d-flex flex-wrap"&gt;
    &lt;DashboardItem&gt;
        some content
    &lt;/DashboardItem&gt;
    &lt;DashboardItem size="2"&gt;
        I love milk
    &lt;/DashboardItem&gt;
&lt;/div&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;div class="d-flex flex-wrap"&gt;
    &lt;DashboardItem&gt;
        Average amount of t-shirt by order this month
        &lt;div class="fs-1 fw-bold text-success text-center"&gt;
            &lt;t t-out="this.statistics().average_quantity"/&gt;
        &lt;/div&gt;
    &lt;/DashboardItem&gt;
    &lt;DashboardItem&gt;
        Average time for an order to go from 'new' to 'sent' or 'cancelled'
        &lt;div class="fs-1 fw-bold text-success text-center"&gt;
            &lt;t t-out="this.statistics().average_time"/&gt;
        &lt;/div&gt;
    &lt;/DashboardItem&gt;
    &lt;DashboardItem&gt;
        Number of new orders this month
        &lt;div class="fs-1 fw-bold text-success text-center"&gt;
            &lt;t t-out="this.statistics().nb_new_orders"/&gt;
        &lt;/div&gt;
    &lt;/DashboardItem&gt;
    &lt;DashboardItem&gt;
        Number of cancelled orders this month
        &lt;div class="fs-1 fw-bold text-success text-center"&gt;
            &lt;t t-out="this.statistics().nb_cancelled_orders"/&gt;
        &lt;/div&gt;
    &lt;/DashboardItem&gt;
    &lt;DashboardItem&gt;
        Total amount of new orders this month
        &lt;div class="fs-1 fw-bold text-success text-center"&gt;
            &lt;t t-out="this.statistics().total_amount"/&gt;
        &lt;/div&gt;
    &lt;/DashboardItem&gt;
&lt;/div&gt;</code></pre>

</div>
</div>

</details>
