# Building a dashboard, part 2

The dashboard from part 1, continued. Same addon, same files: we now make the
network calls cheaper, draw a chart, keep the figures fresh, and finally open
the dashboard up so that another addon can add items to it without touching
ours.

If you did not finish part 1, the solution to step 4 is the starting point for
step 5.

## 5. Cache network calls, create a plugin

If you open the Network tab of your browser’s dev tools, you will see that the
call to `/awesome_dashboard/statistics` is done every time the client action is
displayed. This is because the `onWillStart` hook is called each time the
`Dashboard` component is mounted. But in this case, we would prefer to do it
only the first time, so we actually need to maintain some state outside of the
`Dashboard` component. This is a nice use case for a plugin!

1. Create a `ReportingPlugin` (`extends Plugin`) in a new
   `static/src/reporting_plugin.js`, and register it with
   `services.add(ReportingPlugin)`.
2. Give it a `loadStatistics()` method that performs the actual rpc, and
   always returns the same information.
3. Use the `rpc` cache: call `rpc(route, {}, { cache: true })` - it caches by
   url + params.
4. Use this plugin in the `Dashboard` component with
   `usePlugin(ReportingPlugin)`.
5. Check that it works as expected: only one call to
   `/awesome_dashboard/statistics` in the Network tab, even after leaving and
   reopening the dashboard.

#### See also

- [Example: simple plugin](https://github.com/odoo/odoo/blob/c5dce9c319b06a14553d30a0f6c777ab88321eac/addons/web/static/src/core/notifications/notification_plugin.js)
- [Example: plugin depending on another plugin](https://github.com/odoo/odoo/blob/c5dce9c319b06a14553d30a0f6c777ab88321eac/addons/bus/static/src/services/bus_plugin.js)
- [The rpc cache's settings](https://github.com/odoo/odoo/blob/c5dce9c319b06a14553d30a0f6c777ab88321eac/addons/web/static/src/core/network/rpc_cache.js#L5-L15),
  straight from the source
- [Example: `rpc(route, {}, { cache: true })` in the wild](https://github.com/odoo/odoo/blob/c5dce9c319b06a14553d30a0f6c777ab88321eac/addons/website/static/src/builder/plugins/options/footer_copyright_option.js#L15)

<details>
<summary>Show solution</summary>

**static/src/reporting_plugin.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Plugin } from "@odoo/owl";
import { services } from "@web/core/services";
import { rpc } from "@web/core/network/rpc";

export class ReportingPlugin extends Plugin {
    loadStatistics() {
        return rpc("/awesome_dashboard/statistics", {}, { cache: true });
    }
}

services.add(ReportingPlugin);</code></pre>

</div>
</div>

**static/src/dashboard.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { rpc } from "@web/core/network/rpc";
...
    statistics = signal(null);

    setup() {
        onWillStart(async () => {
            const data = await rpc("/awesome_dashboard/statistics");
            this.statistics.set(data);
        });
    }</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { ReportingPlugin } from "./reporting_plugin";
...
    reporting = usePlugin(ReportingPlugin);
    statistics = signal(null);

    setup() {
        onWillStart(async () => {
            const data = await this.reporting.loadStatistics();
            this.statistics.set(data);
        });
    }</code></pre>

</div>
</div>

(the now-unused `import { rpc } from "@web/core/network/rpc";` is dropped from
`dashboard.js` - it moved into the plugin; `usePlugin` was already imported
from `@odoo/owl` back in step 2)

</details>

## 6. Cleanup

The plugin owns the network call now, but the data itself is still held by the
component: a `statistics` signal, and an `onWillStart` whose only job is to
fill it. Two dashboards on screen would each keep their own copy of the same
figures. The data belongs where the call already is.

1. Move the signal into `ReportingPlugin`: a `stats = signal(null)`.
2. Have `loadStatistics()` set it, instead of returning the data.
3. In `Dashboard`, drop the `statistics` signal altogether: `onWillStart` only
   has to await the load.
4. Read the plugin straight from the template: `<t t-set="stats"
   t-value="this.reporting.stats"/>` at the top of it, and `stats().xxx` in
   each card.

The component is left holding nothing of its own - no copy of the data, no
line that exists only to pass it along.

<details>
<summary>Show solution</summary>

**static/src/reporting_plugin.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Plugin } from "@odoo/owl";
...
export class ReportingPlugin extends Plugin {
    loadStatistics() {
        return rpc("/awesome_dashboard/statistics", {}, { cache: true });
    }
}</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Plugin, signal } from "@odoo/owl";
...
export class ReportingPlugin extends Plugin {
    stats = signal(null);

    async loadStatistics() {
        const data = await rpc("/awesome_dashboard/statistics", {}, { cache: true });
        this.stats.set(data);
    }
}</code></pre>

</div>
</div>

**static/src/dashboard.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">    reporting = usePlugin(ReportingPlugin);
    statistics = signal(null);

    setup() {
        onWillStart(async () => {
            const data = await this.reporting.loadStatistics();
            this.statistics.set(data);
        });
    }</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">    reporting = usePlugin(ReportingPlugin);

    setup() {
        onWillStart(() => this.reporting.loadStatistics());
    }</code></pre>

</div>
</div>

**static/src/dashboard.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;t t-name="awesome_dashboard.AwesomeDashboard"&gt;
    &lt;Layout ...&gt;
        &lt;div class="d-flex flex-wrap"&gt;
            &lt;DashboardItem&gt;
                Average amount of t-shirt by order this month
                &lt;div class="fs-1 fw-bold text-success text-center"&gt;
                    &lt;t t-out="this.statistics().average_quantity"/&gt;
                &lt;/div&gt;
            &lt;/DashboardItem&gt;
            ... four more, one per statistic ...</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;t t-name="awesome_dashboard.AwesomeDashboard"&gt;
    &lt;t t-set="stats" t-value="this.reporting.stats"/&gt;
    &lt;Layout ...&gt;
        &lt;div class="d-flex flex-wrap"&gt;
            &lt;DashboardItem&gt;
                Average amount of t-shirt by order this month
                &lt;div class="fs-1 fw-bold text-success text-center"&gt;
                    &lt;t t-out="stats().average_quantity"/&gt;
                &lt;/div&gt;
            &lt;/DashboardItem&gt;
            ... four more, one per statistic ...</code></pre>

</div>
</div>

`signal` is no longer imported in `dashboard.js`. The `t-set` runs once per
render, at the top of the template, and is in scope everywhere below it -
inside the `Layout`'s slot included. `onWillStart` still awaits the first
load, so the first render still has its data.

</details>

## 7. Display a pie chart

Everyone likes charts (!), so let us add a pie chart in our dashboard. It will
display the proportions of t-shirts sold for each size: S/M/L/XL/XXL.

For this exercise, we will use [Chart.js](https://www.chartjs.org/). It is the
chart library used by the graph view. However, it is not loaded by default, so
we will need to either add it to our assets bundle, or lazy load it. Lazy
loading is usually better since our users will not have to load the chartjs code
every time if they don’t need it.

1.  Create a `PieChart` component.
2.  In its `onWillStart` method, load chartjs, you can use the
    [loadJs function](https://github.com/odoo/odoo/blob/1f4e583ba20a01f4c44b0a4ada42c4d3bb074273/addons/web/static/src/core/assets.js#L23)
    to load `/web/static/lib/Chart/Chart.js`.
3.  Use the `PieChart` component in a `DashboardItem` to display a
    [pie chart](https://www.chartjs.org/docs/latest/charts/doughnut.html) that
    shows the quantity for each sold t-shirts in each size (that information is
    available in the `/statistics` route). Note that you can use the size
    property to make it look larger.
4.  Give the canvas a real height to draw into: chart.js needs one to size
    itself against, and a `DashboardItem`'s `card` otherwise only sizes to its
    content. Add a `pie_chart.scss` with a wrapper `div` sized by
    `aspect-ratio`, and the canvas absolutely positioned to fill it - not
    `aspect-ratio` directly on the canvas itself, which chart.js also resizes
    from its *parent*'s measured size: the two would feed off each other and
    grow without limit (try it, then don't ship it - it's a fun way to hang a
    browser tab, once):

```scss
.o_pie_chart {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;

    canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
    }
}
```

5.  The `PieChart` component will need to render a canvas, and draw on it using
    chart.js. Since the sizes are a fixed, known set, give each one its own
    color directly rather than picking one by position. You can use this code
    to create the pie chart:

```js
const SIZE_COLORS = {
    s: "#36A2EB",
    m: "#FF6384",
    l: "#4BC0C0",
    xl: "#FF9F40",
    xxl: "#9C6DF4",
};
...
renderChart(canvas) {
    const keys = Object.keys(this.props.data);
    const data = Object.values(this.props.data);
    const color = keys.map((key) => SIZE_COLORS[key]);
    return new Chart(canvas, {
        type: "pie",
        data: {
            labels: keys,
            datasets: [
                {
                    label: this.props.label,
                    data: data,
                    backgroundColor: color,
                },
            ],
        },
    });
}
```

6.  Make it work!

![Pie Chart](_images/pie_chart.png)

<details>
<summary>Show solution</summary>

**static/src/pie_chart/pie_chart.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { loadJS } from "@web/core/assets";
import { Component, useProps, types as t, signal, onWillStart, useEffect } from "@odoo/owl";

const SIZE_COLORS = {
    s: "#36A2EB",
    m: "#FF6384",
    l: "#4BC0C0",
    xl: "#FF9F40",
    xxl: "#9C6DF4",
};

export class PieChart extends Component {
    static template = "awesome_dashboard.PieChart";
    props = useProps({
        label: t.string(),
        data: t.object(),
    });

    canvasRef = signal.ref();

    setup() {
        onWillStart(() => loadJS("/web/static/lib/Chart/Chart.js"));
        useEffect(() => {
            const canvas = this.canvasRef();
            if (canvas) {
                const chart = this.renderChart(canvas);
                return () => chart.destroy();
            }
        });
    }

    renderChart(canvas) {
        const keys = Object.keys(this.props.data);
        const data = Object.values(this.props.data);
        const color = keys.map((key) => SIZE_COLORS[key]);
        return new Chart(canvas, {
            type: "pie",
            data: {
                labels: keys,
                datasets: [
                    {
                        label: this.props.label,
                        data: data,
                        backgroundColor: color,
                    },
                ],
            },
            options: {
                maintainAspectRatio: false,
            },
        });
    }
}</code></pre>

</div>
</div>

Props are declared with `useProps` and typed helpers - `t.string()`,
`t.object()`, and so on. A ref is a `signal.ref()` class field, read by
calling it (`this.canvasRef()`, `null` before mount); `t-ref` in the template
takes that field as an expression (`t-ref="this.canvasRef"`).

One `useEffect` does the work three hooks used to: it reads the ref and the
props, so it runs once the canvas exists and again whenever the data changes,
and what it returns is the cleanup - `chart.destroy()`, run before the next
run and once more when the component goes. Nothing is kept on `this`: the
chart only exists for as long as the effect that made it.

**static/src/pie_chart/pie_chart.scss**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-scss"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-scss">.o_pie_chart {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;

    canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
    }
}</code></pre>

</div>
</div>

**static/src/pie_chart/pie_chart.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8" ?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_dashboard.PieChart"&gt;
        &lt;div class="o_pie_chart"&gt;
            &lt;canvas t-ref="this.canvasRef" /&gt;
        &lt;/div&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

The canvas is absolutely positioned inside `.o_pie_chart` rather than sized
directly by `aspect-ratio` - chart.js's own resize logic
(`getMaximumSize` in the vendored `Chart.js`) measures the canvas's *parent*
to decide the canvas's size. If the canvas's own `aspect-ratio` were what
gave that parent its height in the first place (a `card` with no height of
its own otherwise), each resize would read a parent that just grew because of
the canvas, then grow the canvas to match, forever - a hover-triggered
tooltip redraw is enough to kick it off. Taking the canvas out of normal flow
(`position: absolute`) breaks the loop: its size no longer affects its
parent's, only the other way round.

**static/src/dashboard.js**, importing and registering `PieChart` alongside
`DashboardItem` - the same mechanical addition as step 3.

**static/src/dashboard.xml**, one more card:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;div class="d-flex flex-wrap"&gt;
    ...
&lt;/div&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;div class="d-flex flex-wrap"&gt;
    ...
    &lt;DashboardItem size="2"&gt;
        Shirt orders by size
        &lt;PieChart data="stats().orders_by_size" label="'Shirt orders by size'"/&gt;
    &lt;/DashboardItem&gt;
&lt;/div&gt;</code></pre>

</div>
</div>

</details>

#### See also

- Example:
  [lazy loading a js file](https://github.com/odoo/odoo/blob/1f4e583ba20a01f4c44b0a4ada42c4d3bb074273/addons/web/static/src/views/graph/graph_renderer.js#L57)
- Example:
  [rendering a chart in a component](https://github.com/odoo/odoo/blob/1f4e583ba20a01f4c44b0a4ada42c4d3bb074273/addons/web/static/src/views/graph/graph_renderer.js#L618)

## 8. Make it a generic hook

`PieChart` holds two different things: what a pie of t-shirt sizes looks like,
and the plumbing every chart needs - load chart.js, keep a ref to a canvas,
build the chart once that canvas exists, destroy it when the data changes or
the component goes. Only the first is about pie charts.

1. Create a `useChart(descFn)` hook in `static/src/dashboard/use_chart.js`. It
   owns the ref, the `onWillStart` that loads chart.js and the effect, and
   returns the ref so a template can bind it with `t-ref`.
2. `descFn` is called inside the effect, and whatever it returns is handed
   straight to `new Chart(canvas, ...)`. Reading props in there is what makes
   the chart redraw when they change.
3. Rewrite `PieChart` on top of it. It should be left with its props and the
   description of a pie, and nothing else.

Another chart type is then a component with a different `descFn`.

<details>
<summary>Show solution</summary>

**static/src/dashboard/use_chart.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { loadJS } from "@web/core/assets";
import { signal, onWillStart, useEffect } from "@odoo/owl";

export function useChart(descFn) {
    const canvasRef = signal.ref();

    onWillStart(() => loadJS("/web/static/lib/Chart/Chart.js"));

    useEffect(() => {
        const canvas = canvasRef();
        if (canvas) {
            const chart = new Chart(canvas, descFn());
            return () => chart.destroy();
        }
    });

    return canvasRef;
}</code></pre>

</div>
</div>

**static/src/dashboard/pie_chart/pie_chart.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { loadJS } from "@web/core/assets";
import { Component, useProps, types as t, signal, onWillStart, useEffect } from "@odoo/owl";
...
    canvasRef = signal.ref();

    setup() {
        onWillStart(() => loadJS("/web/static/lib/Chart/Chart.js"));
        useEffect(() => {
            const canvas = this.canvasRef();
            if (canvas) {
                const chart = this.renderChart(canvas);
                return () => chart.destroy();
            }
        });
    }

    renderChart(canvas) {
        ...
        return new Chart(canvas, { type: "pie", ... });
    }</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, useProps, types as t } from "@odoo/owl";
import { useChart } from "../use_chart";
...
    canvasRef = useChart(() => {
        const keys = Object.keys(this.props.data);
        const data = Object.values(this.props.data);
        const color = keys.map((key) => SIZE_COLORS[key]);
        return {
            type: "pie",
            data: {
                labels: keys,
                datasets: [
                    {
                        label: this.props.label,
                        data: data,
                        backgroundColor: color,
                    },
                ],
            },
            options: {
                maintainAspectRatio: false,
            },
        };
    });</code></pre>

</div>
</div>

The template does not change: `useChart` returns the same ref `t-ref` was
already bound to. `PieChart` has no `setup()` left - the description is a
function, so it is only run inside the effect, where reading `this.props.data`
subscribes the chart to it.

</details>

## 9. Periodic Updates

Since we moved the data loading in a cache, it never updates. But let us say
that we are looking at fast moving data, so we want to periodically (for
example, every 10min) reload fresh data.

This is quite simple to implement, with a `setTimeout` or `setInterval` in the
reporting plugin. However, here is the tricky part: if the dashboard is
currently being displayed, it should be updated immediately.

The plugin already owns the signal; a component reading it just calls it
wherever it needs a value, and gets the latest data automatically - no
subscribing step needed. So the reload only has to set it again.

1. Update `ReportingPlugin` to reload data every 10 minutes (to test it,
   use 5s instead!)
2. Drop `loadStatistics()`: the plugin loads in its own `setup()`, on a timer,
   and sets `stats` each time. Clear that timer in an `onWillDestroy`.
3. `stats` starts at `null`, so the template has its own answer to "has it
   loaded yet?" - guard the cards with `t-if="stats()"`.

#### See also

- [Documentation on signals](https://odoo.github.io/owl/documentation/v3/owl/reference/signals.html)
- [Example: a plugin owning reactive state](https://github.com/odoo/odoo/blob/c5dce9c319b06a14553d30a0f6c777ab88321eac/addons/web/static/src/core/browser/title_plugin.js)

<details>
<summary>Show solution</summary>

**static/src/reporting_plugin.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Plugin, signal } from "@odoo/owl";
import { services } from "@web/core/services";
import { rpc } from "@web/core/network/rpc";

export class ReportingPlugin extends Plugin {
    stats = signal(null);

    async loadStatistics() {
        const data = await rpc("/awesome_dashboard/statistics", {}, { cache: true });
        this.stats.set(data);
    }
}

services.add(ReportingPlugin);</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Plugin, signal, onWillDestroy } from "@odoo/owl";
import { services } from "@web/core/services";
import { rpc } from "@web/core/network/rpc";

export class ReportingPlugin extends Plugin {
    stats = signal(null);

    setup() {
        this.loadData();
        const id = setInterval(() => this.loadData(), 5 * 1000);
        onWillDestroy(() => clearInterval(id));
    }

    async loadData() {
        const data = await rpc("/awesome_dashboard/statistics");
        this.stats.set(data);
    }
}

services.add(ReportingPlugin);</code></pre>

</div>
</div>

`loadStatistics()` is gone: the plugin now pushes fresh data on its own
schedule instead of waiting to be asked, so the `rpc` cache from step 5 (which
would otherwise keep serving the very first response forever) isn't used here
either - a plain `rpc(...)` call, refetched on every tick, is exactly what we
want. Each tick calls `this.stats.set(data)` with the response: the signal
holds a whole new object, every component reading it re-renders, and no
second flag is needed to say whether it has arrived. The interval is the one
thing Owl cannot clean up for you - hence `onWillDestroy`. A global plugin
lives as long as the tab, so it rarely fires in practice, but a plugin
provided to a subtree, or one in a test, is destroyed like anything else.

**static/src/dashboard.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Component, onWillStart, usePlugin } from "@odoo/owl";
...
    reporting = usePlugin(ReportingPlugin);

    setup() {
        onWillStart(() => this.reporting.loadStatistics());
    }</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, usePlugin } from "@odoo/owl";
...
    reporting = usePlugin(ReportingPlugin);</code></pre>

</div>
</div>

No more `setup()`/`onWillStart`, and nothing left on the component but the
plugin itself: it loads on its own schedule, and the template reads `stats()`
whenever it renders - for the figures, and for whether there are any yet.
Nothing to await.

**static/src/dashboard.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;div class="d-flex flex-wrap"&gt;
    &lt;DashboardItem&gt;
        Average amount of t-shirt by order this month
        &lt;div class="fs-1 fw-bold text-success text-center"&gt;
            &lt;t t-out="stats().average_quantity"/&gt;
        &lt;/div&gt;
    &lt;/DashboardItem&gt;
    ... four more DashboardItems, one per statistic, and the pie chart card ...
&lt;/div&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;div class="d-flex flex-wrap" t-if="stats()"&gt;
    &lt;DashboardItem&gt;
        Average amount of t-shirt by order this month
        &lt;div class="fs-1 fw-bold text-success text-center"&gt;
            &lt;t t-out="stats().average_quantity"/&gt;
        &lt;/div&gt;
    &lt;/DashboardItem&gt;
    ... four more DashboardItems, one per statistic, and the pie chart card ...
&lt;/div&gt;</code></pre>

</div>
</div>

The reads do not change: `stats` is the same plugin signal the `t-set` at the
top of the template already captured in the previous step. The guard is what
is new (the first render used to just wait, via `onWillStart`): nothing blocks
the first render anymore, so the wrapping `<div>` needs `t-if="stats()"` to
skip rendering cards until the first load resolves. The signal starting at
`null` is the whole flag.

</details>

## 10. Lazy loading the dashboard

Let us imagine that our dashboard is getting quite big, and is only of interest
to some of our users. In that case, it could make sense to lazy load our
dashboard, and all related assets, so we only pay the cost of loading the code
when we actually want to look at it.

One way to do this is to use `LazyComponent` (from @web/core/lazy_component) as an
intermediate that will load an asset bundle before displaying our component.

For example, it can be used like this:

```js
export class ExampleComponentLoader extends Component {
  static components = { LazyComponent };
  static template = xml`
        <LazyComponent bundle="'example_module.example_assets'" Component="'ExampleComponent'" />
    `;
}

registry
  .category("actions")
  .add("example_module.example_action", ExampleComponentLoader);
```

1. Move all dashboard assets into a sub folder `/dashboard` to make it easier to
   add to a bundle.
2. Create a `awesome_dashboard.dashboard` assets bundle containing all content
   of the `/dashboard` folder.
3. Modify `dashboard.js` to register itself to the `lazy_components` registry
   instead of `actions`.
4. In `src/dashboard_action.js`, create an intermediate component that uses
   `LazyComponent` and register it to the `actions` registry.

<details>
<summary>Show solution</summary>

Mostly assets bundling and a registry swap, unrelated to component syntax -
one real change though: `LazyComponent` moved to its own file,
`@web/core/lazy_component`, out of `@web/core/assets` (still there, still
exports `loadBundle`/`loadJS`/`loadCSS` - just not the component anymore).
Move every existing file from `static/src/*` into `static/src/dashboard/*`,
`dashboard.js` registers under `lazy_components` instead of `actions`, and:

**__manifest__.py**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-python">    'assets': {
        'web.assets_backend': [
            'awesome_dashboard/static/src/**/*',
        ],
    },</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-python">    'assets': {
        'web.assets_backend': [
            'awesome_dashboard/static/src/**/*',
            ('remove', 'awesome_dashboard/static/src/dashboard/**/*'),
        ],
        'awesome_dashboard.dashboard': [
            'awesome_dashboard/static/src/dashboard/**/*',
        ],
    },</code></pre>

</div>
</div>

**static/src/dashboard_loader.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { registry } from "@web/core/registry";
import { LazyComponent } from "@web/core/lazy_component";
import { Component, xml } from "@odoo/owl";

class AwesomeDashboardLoader extends Component {
    static components = { LazyComponent };
    static template = xml`
    &lt;LazyComponent bundle="'awesome_dashboard.dashboard'" Component="'AwesomeDashboard'" props="this.props"/&gt;
    `;
}

registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboardLoader);</code></pre>

</div>
</div>

**static/src/dashboard/dashboard.js**, the registration at the bottom (moved from `static/src/dashboard.js`):

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">registry.category("actions").add("awesome_dashboard.dashboard", AwesomeDashboard);</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">registry.category("lazy_components").add("AwesomeDashboard", AwesomeDashboard);</code></pre>

</div>
</div>

</details>

## 11. Making our dashboard generic

So far, we have a nice working dashboard. But it is currently hardcoded in the
dashboard template. What if we want to customize our dashboard? Maybe some users
have different needs and want to see other data.

So, the next step is to make our dashboard generic: instead of hard-coding its
content in the template, it can just iterate over a list of dashboard items. But
then, many questions come up: how to represent a dashboard item, how to register
it, what data should it receive, and so on. There are many different ways to
design such a system, with different trade-offs.

For this tutorial, we will say that a dashboard item is an object with the
following structure:

```js
const item = {
  id: "average_quantity",
  description: "Average amount of t-shirt",
  Component: StandardItem,
  // size and props are optionals
  size: 3,
  props: (data) => ({
    title: "Average amount of t-shirt by order this month",
    value: data.average_quantity,
  }),
};
```

The `description` value will be useful in a later exercise to show the name of
items that the user can add to their dashboard. The `size` number is optional,
and simply describes the size of the dashboard item that will be displayed.
Finally, the `props` function is optional. If not given, we will simply give the
`statistics` object as data. But if it is defined, it will be used to compute
specific props for the component.

The goal is to replace the content of the dashboard with something that look
like the following snippet:

```xml
<t t-foreach="this.items" t-as="item" t-key="item.id">
   <DashboardItem size="item.size || 1">
      <t t-set="itemProp" t-value="item.props ? item.props(statistics) : {'data': statistics}"/>
      <t t-component="item.Component" t-props="itemProp" />
   </DashboardItem>
</t>
```

Note that the above example features two advanced features of Owl: dynamic
components and dynamic props.

We currently have two kinds of item components: number cards with a title and a
number, and pie cards with some label and a pie chart.

1.  Create and implement two components: `NumberCard` and `PieChartCard`, with
    the corresponding props.
2.  Create a file `dashboard_items.js` in which you define and export a list of
    items, using `NumberCard` and `PieChartCard` to recreate our current
    dashboard.
3.  Import that list of items in our `Dashboard` component, add it to the
    component, and update the template to use a `t-foreach` like shown above.

And now, our dashboard template is generic!

<details>
<summary>Show solution</summary>

**static/src/dashboard/number_card/number_card.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, useProps, types as t } from "@odoo/owl";

export class NumberCard extends Component {
    static template = "awesome_dashboard.NumberCard";
    props = useProps({
        title: t.string(),
        value: t.number(),
    });
}</code></pre>

</div>
</div>

**static/src/dashboard/number_card/number_card.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8" ?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_dashboard.NumberCard"&gt;
        &lt;t t-out="this.props.title"/&gt;
        &lt;div class="fs-1 fw-bold text-success text-center"&gt;
            &lt;t t-out="this.props.value"/&gt;
        &lt;/div&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

**static/src/dashboard/pie_chart_card/pie_chart_card.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, useProps, types as t } from "@odoo/owl";
import { PieChart } from "../pie_chart/pie_chart";

export class PieChartCard extends Component {
    static template = "awesome_dashboard.PieChartCard";
    static components = { PieChart };
    props = useProps({
        title: t.string(),
        values: t.object(),
    });
}</code></pre>

</div>
</div>

**static/src/dashboard/pie_chart_card/pie_chart_card.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8" ?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_dashboard.PieChartCard"&gt;
        &lt;t t-out="this.props.title"/&gt;
        &lt;PieChart data="this.props.values" label="''"/&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

**static/src/dashboard/dashboard_items.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { NumberCard } from "./number_card/number_card";
import { PieChartCard } from "./pie_chart_card/pie_chart_card";

export const items = [
    {
        id: "average_quantity",
        description: "Average amount of t-shirt",
        Component: NumberCard,
        props: (data) => ({
            title: "Average amount of t-shirt by order this month",
            value: data.average_quantity,
        })
    },
    {
        id: "average_time",
        description: "Average time for an order",
        Component: NumberCard,
        props: (data) => ({
            title: "Average time for an order to go from 'new' to 'sent' or 'cancelled'",
            value: data.average_time,
        })
    },
    {
        id: "number_new_orders",
        description: "New orders this month",
        Component: NumberCard,
        props: (data) => ({
            title: "Number of new orders this month",
            value: data.nb_new_orders,
        })
    },
    {
        id: "cancelled_orders",
        description: "Cancelled orders this month",
        Component: NumberCard,
        props: (data) => ({
            title: "Number of cancelled orders this month",
            value: data.nb_cancelled_orders,
        })
    },
    {
        id: "amount_new_orders",
        description: "amount orders this month",
        Component: NumberCard,
        props: (data) => ({
            title: "Total amount of new orders this month",
            value: data.total_amount,
        })
    },
    {
        id: "pie_chart",
        description: "Shirt orders by size",
        Component: PieChartCard,
        size: 2,
        props: (data) => ({
            title: "Shirt orders by size",
            values: data.orders_by_size,
        })
    }
]</code></pre>

</div>
</div>

**static/src/dashboard/dashboard.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { PieChart } from "./pie_chart/pie_chart";
...
    static components = { Layout, DashboardItem, PieChart };</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { items } from "./dashboard_items";
...
    static components = { Layout, DashboardItem };

    items = items;</code></pre>

</div>
</div>

The template can only read `this.items` - not the imported `items` directly -
so it needs putting on the instance first. A class field is enough: the name
on the left is the field, the one on the right is still the import.

**static/src/dashboard/dashboard.xml**, the five hardcoded cards become one loop:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;div class="d-flex flex-wrap" t-if="stats()"&gt;
    &lt;DashboardItem&gt;
        Average amount of t-shirt by order this month
        &lt;div class="fs-1 fw-bold text-success text-center"&gt;
            &lt;t t-out="stats().average_quantity"/&gt;
        &lt;/div&gt;
    &lt;/DashboardItem&gt;
    ... four more DashboardItems, one per statistic, and the pie chart card ...
&lt;/div&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;div class="d-flex flex-wrap" t-if="stats()"&gt;
    &lt;t t-foreach="this.items" t-as="item" t-key="item.id"&gt;
        &lt;DashboardItem size="item.size || 1"&gt;
            &lt;t t-set="itemProp" t-value="item.props ? item.props(stats()) : {'data': stats()}"/&gt;
            &lt;t t-component="item.Component" t-props="itemProp" /&gt;
        &lt;/DashboardItem&gt;
    &lt;/t&gt;
&lt;/div&gt;</code></pre>

</div>
</div>

</details>

## 12. Making our dashboard extensible

However, the content of our item list is still hardcoded. Let us fix that by
using a registry - Owl 3's own `Registry` class, not Odoo's older
`@web/core/registry` (that one still works, and is still what most existing
Odoo code uses, but it isn't typed - anything can be added under any key. Owl
3's `Registry` takes an optional `validation` schema, checked on every `add`).

1. Instead of exporting a list, create and export a `Registry` (`Registry`
   from `@odoo/owl`) with a validation schema for what a dashboard item looks
   like, and register each item on it with `addById` (each item already has
   an `id`).
2. Read all registered items from that registry in the `Dashboard` component.

The dashboard is now easily extensible. Any other Odoo addon that wants to
register a new item to the dashboard imports this registry and adds to it -
and gets a clear error immediately if what it adds doesn't look like a
dashboard item.

#### See also

- [Owl documentation: registries](https://odoo.github.io/owl/documentation/v3/owl/reference/registries.html)

<details>
<summary>Show solution</summary>

**static/src/dashboard/dashboard_items.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { NumberCard } from "./number_card/number_card";
import { PieChartCard } from "./pie_chart_card/pie_chart_card";

export const items = [
    { ... },
    ...
]</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Registry, Component, types as t } from "@odoo/owl";
import { NumberCard } from "./number_card/number_card";
import { PieChartCard } from "./pie_chart_card/pie_chart_card";

export const dashboardItems = new Registry({
    name: "awesome_dashboard",
    validation: t.object({
        id: t.string(),
        description: t.string(),
        Component: t.constructor(Component),
        size: t.number().optional(),
        props: t.function().optional(),
    }),
});

const items = [
    { ... },
    ...
]

items.forEach((item) => dashboardItems.addById(item));</code></pre>

</div>
</div>

`t.constructor(Component)` checks that `Component` *is* (or extends) Owl's
`Component` class - not an instance of it, the class itself, the same way
`services.js` validates a plugin with `t.constructor(Plugin)`.

**static/src/dashboard/dashboard.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { items } from "./dashboard_items";
...
    items = items;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { dashboardItems } from "./dashboard_items";
...
    items = dashboardItems.items;</code></pre>

</div>
</div>

No more `setup()` at all: `dashboardItems.items` is itself a reactive
computed (a signal), so assigning it straight to a class field is enough -
same reasoning as the plugin's `stats` a few steps back.

**static/src/dashboard/dashboard.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;t t-foreach="this.items" t-as="item" t-key="item.id"&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;t t-foreach="this.items()" t-as="item" t-key="item.id"&gt;</code></pre>

</div>
</div>

`this.items` is a signal too, same as the plugin's `stats` - it has to be
called.

</details>

## 13. Add and remove dashboard items

Let us see how we can make our dashboard customizable. To make it simple, we
will save the user dashboard configuration in the local storage, so that we
don’t have to deal with the server for now.

For this exercise, the dashboard configuration will be saved as a list of
removed item ids.

1. Add a button in the control panel with a gear icon to indicate that it is a
   settings button.
2. Clicking on that button should open a dialog.
3. In that dialog, we want to see a list of all existing dashboard items, each
   with a checkbox.
4. Each checkbox should immediately update the list of unchecked item ids and
   store it in the local storage - no separate step needed, a `Done` button
   in the footer just closes the dialog.
5. Modify the `Dashboard` component to filter the current items by removing
   the ids of items from the configuration.

![Item configurations](_images/items_configuration.png)

<details>
<summary>Show solution</summary>

A `signal.Array`'s reactivity is shallow: mutating a *property of one of its
elements* isn't tracked, only the array's own contents changing is (push,
splice, index assignment, `.set(...)`). So rather than keeping a list of items
with an `enabled` flag mutated directly on each one, the solution below keeps
a single source of truth - the flat list of disabled ids, as a plain
`signal()` - and derives whether an item is enabled from it.

**static/src/dashboard/dashboard.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Component, usePlugin } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";
import { ActionPlugin } from "@web/webclient/actions/action_plugin";
import { ReportingPlugin } from "./reporting_plugin";
import { dashboardItems } from "./dashboard_items";
import { DashboardItem } from "./dashboard_item";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout, DashboardItem };
    action = usePlugin(ActionPlugin);
    reporting = usePlugin(ReportingPlugin);
    items = dashboardItems.items;

    openCustomerView() { ... }

    openLeads() { ... }
}

registry.category("lazy_components").add("AwesomeDashboard", AwesomeDashboard);</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, signal, useProps, usePlugin } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { Layout } from "@web/search/layout";
import { DialogPlugin } from "@web/core/dialog/dialog_plugin";
import { ActionPlugin } from "@web/webclient/actions/action_plugin";
import { ReportingPlugin } from "./reporting_plugin";
import { dashboardItems } from "./dashboard_items";
import { DashboardItem } from "./dashboard_item";
import { Dialog } from "@web/core/dialog/dialog";
import { CheckBox } from "@web/core/checkbox/checkbox";

class AwesomeDashboard extends Component {
    static template = "awesome_dashboard.AwesomeDashboard";
    static components = { Layout, DashboardItem };

    disabledItems = signal(window.localStorage.getItem("disabledDashboardItems")?.split(",") || []);
    action = usePlugin(ActionPlugin);
    reporting = usePlugin(ReportingPlugin);
    items = dashboardItems.items;
    dialog = usePlugin(DialogPlugin);

    openConfiguration() {
        this.dialog.add(ConfigurationDialog, {
            items: this.items(),
            disabledItems: this.disabledItems(),
            onUpdateConfiguration: this.updateConfiguration.bind(this),
        });
    }

    updateConfiguration(newDisabledItems) {
        this.disabledItems.set(newDisabledItems);
        window.localStorage.setItem("disabledDashboardItems", newDisabledItems);
    }

    openCustomerView() { ... }

    openLeads() { ... }
}

class ConfigurationDialog extends Component {
    static template = "awesome_dashboard.ConfigurationDialog";
    static components = { Dialog, CheckBox };
    props = useProps(["close", "items", "disabledItems", "onUpdateConfiguration"]);

    disabledItems = signal(this.props.disabledItems);

    isEnabled(item) {
        return !this.disabledItems().includes(item.id);
    }

    done() {
        this.props.close();
    }

    onChange(checked, item) {
        const disabled = new Set(this.disabledItems());
        if (checked) {
            disabled.delete(item.id);
        } else {
            disabled.add(item.id);
        }
        const newDisabledItems = [...disabled];
        this.disabledItems.set(newDisabledItems);
        this.props.onUpdateConfiguration(newDisabledItems);
    }
}

registry.category("lazy_components").add("AwesomeDashboard", AwesomeDashboard);</code></pre>

</div>
</div>

`props = useProps(["close", "items", "disabledItems", "onUpdateConfiguration"])`
is the plain array form of `static props = [...]` - a list of accepted prop
names, no type validation - `useProps` takes an array the same way.

**static/src/dashboard/dashboard.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;t t-name="awesome_dashboard.AwesomeDashboard"&gt;
    &lt;Layout display="{controlPanel: {buttons: true} } " className="'o_dashboard h-100'"&gt;
        &lt;t t-set-slot="control-panel-buttons"&gt;
            &lt;button class="btn btn-primary" t-on-click="this.openCustomerView"&gt;Customers&lt;/button&gt;
            &lt;button class="btn btn-primary" t-on-click="this.openLeads"&gt;Leads&lt;/button&gt;
        &lt;/t&gt;
        &lt;div class="d-flex flex-wrap" t-if="stats()"&gt;
            &lt;t t-foreach="this.items()" t-as="item" t-key="item.id"&gt;
                &lt;DashboardItem size="item.size || 1"&gt;
                    &lt;t t-set="itemProp" t-value="item.props ? item.props(stats()) : {'data': stats()}"/&gt;
                    &lt;t t-component="item.Component" t-props="itemProp" /&gt;
                &lt;/DashboardItem&gt;
            &lt;/t&gt;
        &lt;/div&gt;
    &lt;/Layout&gt;
&lt;/t&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;t t-name="awesome_dashboard.AwesomeDashboard"&gt;
    &lt;Layout display="{controlPanel: {buttons: true} } " className="'o_dashboard h-100'"&gt;
        &lt;t t-set-slot="control-panel-buttons"&gt;
            &lt;button class="btn btn-primary" t-on-click="this.openCustomerView"&gt;Customers&lt;/button&gt;
            &lt;button class="btn btn-primary" t-on-click="this.openLeads"&gt;Leads&lt;/button&gt;
        &lt;/t&gt;
        &lt;t t-set-slot="control-panel-additional-actions"&gt;
            &lt;button t-on-click="this.openConfiguration" class="btn p-0 ms-1 border-0"&gt;
                &lt;i class="oi" data-icon="settings"&gt;&lt;/i&gt;
            &lt;/button&gt;
        &lt;/t&gt;
        &lt;div class="d-flex flex-wrap" t-if="stats()"&gt;
            &lt;t t-foreach="this.items()" t-as="item" t-key="item.id"&gt;
                &lt;DashboardItem t-if="!this.disabledItems().includes(item.id)" size="item.size || 1"&gt;
                    &lt;t t-set="itemProp" t-value="item.props ? item.props(stats()) : {'data': stats()}"/&gt;
                    &lt;t t-component="item.Component" t-props="itemProp" /&gt;
                &lt;/DashboardItem&gt;
            &lt;/t&gt;
        &lt;/div&gt;
    &lt;/Layout&gt;
&lt;/t&gt;

&lt;t t-name="awesome_dashboard.ConfigurationDialog"&gt;
    &lt;Dialog title="'Dashboard items configuration'"&gt;
        Which cards do you whish to see ?
        &lt;t t-foreach="this.props.items" t-as="item" t-key="item.id"&gt;
            &lt;CheckBox value="this.isEnabled(item)" onChange="(checked) => this.onChange(checked, item)"&gt;
                &lt;t t-out="item.description"/&gt;
            &lt;/CheckBox&gt;
        &lt;/t&gt;
        &lt;t t-set-slot="footer"&gt;
            &lt;button class="btn btn-primary" t-on-click="this.done"&gt;
                Done
            &lt;/button&gt;
        &lt;/t&gt;
    &lt;/Dialog&gt;
&lt;/t&gt;</code></pre>

</div>
</div>

</details>

## 14. Going further

Here is a list of some small (and not so small) improvements you could try to do
if you have the time:

- Make sure your application can be translated (with `_t`).
- Clicking on a section of the pie chart should open a list view of all orders
  that have the corresponding size.
- Save the content of the dashboard in a user setting on the server!
- Make it responsive: in mobile mode, each card should take 100% of the width.
- Update the dashboard in real time by using the bus (hard)
