# Clicker game

For this project, we will build together a
[clicker game](https://en.wikipedia.org/wiki/Incremental_game), completely
integrated with Odoo. In this game, the goal is to accumulate a large number of
clicks, and to automate the system. The interesting part is that we will use the
Odoo user interface as our playground. For example, we will hide bonuses in some
random parts of the web client.

To get started, you need a running Odoo server and a development environment
setup. Before getting into the exercises, make sure you have a working setup.
Clone [odoo-js-framework](https://github.com/ged-odoo/odoo-js-framework)
and start your odoo server with its `addons` folder in the addons path, then install the
`awesome_clicker` addon.

The code for this addon is currently empty, but we will progressively add
features to it.

![Final Result](_images/final.png)

## 1. Create a systray item

To get started, we want to display a counter in the systray.

1. Create a `clicker_systray_item.js` (and `xml`) file with a hello world Owl
   component.
2. Register it to the systray registry, and make sure it is visible.
3. Update the content of the item so that it displays the following string:
   `Clicks: 0`, and add a button on the right to increment the value.

![Systray](_images/systray.png)

And voila, we have a completely working clicker game!

#### See also

- [Documentation on the systray registry](https://www.odoo.com/documentation/master/developer/reference/frontend/registries.html#frontend-registries-systray)
- [Example: adding a systray item to the registry](https://github.com/odoo/odoo/blob/c4fb9c92d7826ddbc183d38b867ca4446b2fb709/addons/web/static/src/webclient/user_menu/user_menu.js#L41-L42)

<details>
<summary>Show solution</summary>

**static/src/clicker_systray_item/clicker_systray_item.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { registry } from "@web/core/registry";
import { Component, signal } from "@odoo/owl";

export class ClickerSystray extends Component {
    static template = "awesome_clicker.ClickerSystray";

    counter = signal(0);

    increment() {
        this.counter.set(this.counter() + 1);
    }
}

export const systrayItem = {
    Component: ClickerSystray,
};

registry.category("systray").add("awesome_clicker.ClickerSystray", systrayItem, { sequence: 1000 });</code></pre>

</div>
</div>

**static/src/clicker_systray_item/clicker_systray_item.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8" ?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_clicker.ClickerSystray"&gt;
        &lt;div class="o_nav_entry"&gt;
            Clicks: &lt;t t-out="this.counter()"/&gt;
            &lt;button class="btn btn-secondary" t-on-click="this.increment"&gt;
                &lt;i class="oi oi-lg" data-icon="add"&gt;&lt;/i&gt;
            &lt;/button&gt;
        &lt;/div&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

Local reactive state is a `signal(0)` class field, read by calling it
(`this.counter()`) and written with `.set(...)`, never mutated directly.

</details>

## 2. Count external clicks

Well, to be honest, it is not much fun yet. So let us add a new feature: we want
all clicks in the user interface to count, so the user is incentivized to use
Odoo as much as possible! But obviously, the intentional clicks on the main
counter should still count more.

1. Use `useListener` to listen on all clicks on `document.body`.
2. Each of these clicks should increase the counter value by 1.
3. Modify the code so that each click on the counter increased the value by 10
4. Make sure that a click on the counter does not increase the value by 11!
5. Also additional challenge: make sure the listener captures the events, so
   we don’t miss any clicks.

#### See also

- [Owl documentation on useListener](https://odoo.github.io/owl/documentation/v3/owl/reference/hooks.html#uselistener)
- [MDN page on event capture](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling#event_capture)

<details>
<summary>Show solution</summary>

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { registry } from "@web/core/registry";
import { Component, signal } from "@odoo/owl";

export class ClickerSystray extends Component {
    static template = "awesome_clicker.ClickerSystray";

    counter = signal(0);

    increment() {
        this.counter.set(this.counter() + 1);
    }
}</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { registry } from "@web/core/registry";
import { Component, signal, useListener } from "@odoo/owl";

export class ClickerSystray extends Component {
    static template = "awesome_clicker.ClickerSystray";

    counter = signal(0);

    setup() {
        useListener(document.body, "click", () => this.counter.set(this.counter() + 1), { capture: true });
    }

    increment() {
        this.counter.set(this.counter() + 9);
    }
}</code></pre>

</div>
</div>

</details>

## 3. Create a client action

Currently, the current user interface is quite small: it is just a systray item.
We certainly need more room to display more of our game. To do that, let us
create a client action. A client action is a main action, managed by the web
client, that displays a component.

1. Create a `client_action.js` (and `xml`) file, with a hello world component.
2. Register that client action in the action registry under the name
   `awesome_clicker.client_action`
3. Add a button on the systray item with the text "Open". Clicking on it should
   open the client action `awesome_clicker.client_action` (use the
   `ActionPlugin` to do that).
4. To avoid disrupting employees workflow, we prefer the client action to open
   within a popover rather than in fullscreen mode. Modify the `doAction` call
   to open it in a popover.

You can use target: `"new"` in the doAction to open the action in a popover:

```js
{
   type: "ir.actions.client",
   tag: "awesome_clicker.client_action",
   target: "new",
   name: "Clicker"
}
```

![Client action](_images/client_action.png)

**See also:**
[How to create a client action](https://www.odoo.com/documentation/master/developer/howtos/javascript_client_action.html#howtos-javascript-client-action)

<details>
<summary>Show solution</summary>

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">    &lt;button class="btn btn-secondary" t-on-click="this.increment"&gt;
        &lt;i class="oi oi-lg" data-icon="add"&gt;&lt;/i&gt;
    &lt;/button&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">    &lt;button class="btn btn-secondary" t-on-click="this.increment"&gt;
        &lt;i class="oi oi-lg" data-icon="add"&gt;&lt;/i&gt;
    &lt;/button&gt;
    &lt;button class="btn btn-secondary" t-on-click="this.openClientAction"&gt;
        Open
    &lt;/button&gt;</code></pre>

</div>
</div>

with a matching `openClientAction()` method on `ClickerSystray`, using the
`ActionPlugin` to open the client action in a popover:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { registry } from "@web/core/registry";
import { Component, signal, useListener } from "@odoo/owl";

export class ClickerSystray extends Component {
    static template = "awesome_clicker.ClickerSystray";

    counter = signal(0);

    setup() {
        useListener(document.body, "click", () => this.counter.set(this.counter() + 1), { capture: true });
    }

    increment() {
        this.counter.set(this.counter() + 9);
    }
}

export const systrayItem = {
    Component: ClickerSystray,
};

registry.category("systray").add("awesome_clicker.ClickerSystray", systrayItem, { sequence: 1000 });</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { registry } from "@web/core/registry";
import { Component, signal, useListener, usePlugin } from "@odoo/owl";
import { ActionPlugin } from "@web/webclient/actions/action_plugin";

export class ClickerSystray extends Component {
    static template = "awesome_clicker.ClickerSystray";

    counter = signal(0);
    action = usePlugin(ActionPlugin);

    setup() {
        useListener(document.body, "click", () => this.counter.set(this.counter() + 1), { capture: true });
    }

    increment() {
        this.counter.set(this.counter() + 9);
    }

    openClientAction() {
        this.action.doAction({
            type: "ir.actions.client",
            tag: "awesome_clicker.client_action",
            target: "new",
            name: "Clicker",
        });
    }
}

export const systrayItem = {
    Component: ClickerSystray,
};

registry.category("systray").add("awesome_clicker.ClickerSystray", systrayItem, { sequence: 1000 });</code></pre>

</div>
</div>

and a new client action, its own "hello world" component:

**static/src/client_action/client_action.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";

class ClickerClientAction extends Component {
    static template = "awesome_clicker.ClickerClientAction";
}

registry.category("actions").add("awesome_clicker.client_action", ClickerClientAction);</code></pre>

</div>
</div>

**static/src/client_action/client_action.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_clicker.ClickerClientAction"&gt;
        Clicker client action
        &lt;div class="modal-footer d-flex justify-content-start gap-2 mt-3"&gt;
            &lt;button class="btn btn-primary" t-on-click="() =&gt; this.env.dialogData.close()"&gt;
                Ok
            &lt;/button&gt;
        &lt;/div&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

A component opened in a popover (`target: "new"`) is rendered inside the
framework's own `Dialog`, so it inherits `this.env.dialogData` from it - no
prop to thread through, `close()` is just there. The `modal-footer` class is
only borrowed for the same look as the dialog's real footer.

</details>

## 4. Move the state to a plugin

For now, our client action is just a hello world component. We want it to
display our game state, but that state is currently only available in the
systray item. So it means that we need to change the location of our state to
make it available for all our components. This is a perfect use case for a
**plugin**: Owl's own mechanism for state and logic shared across the whole
application.

1. Create a `clicker_plugin.js` file with the corresponding plugin: a class
   extending `Plugin`, registered on the `services` resource from
   `@web/core/services` (that's Owl's own list of app-wide plugins the
   framework starts automatically).
2. This plugin should hold a reactive value (the number of clicks) and a few
   methods to update it. Move the systray's click-counting listener into the
   plugin's own `setup()` too - `useListener` works there exactly like in a
   component:
   ```js
   export class ClickerPlugin extends Plugin {
       clicks = signal(0);

       setup() {
           useListener(document.body, "click", () => this.increment(1), { capture: true });
       }

       increment(inc) {
           this.clicks.set(this.clicks() + inc);
       }
   }
   ```
3. Access it in both the systray item and the client action with
   `usePlugin(ClickerPlugin)`. Modify the systray item to remove its own local
   state, and you can remove the +10 clicks button.
4. Display the state in the client action, and add a +10 clicks button in it.

![Increment Button](_images/increment_button.png)

**See also:**
[Owl documentation on plugins](https://odoo.github.io/owl/documentation/v3/owl/reference/plugins.html)

<details>
<summary>Show solution</summary>

**static/src/clicker_plugin.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Plugin, signal, useListener } from "@odoo/owl";
import { services } from "@web/core/services";

export class ClickerPlugin extends Plugin {
    clicks = signal(0);

    setup() {
        useListener(document.body, "click", () => this.increment(1), { capture: true });
    }

    increment(inc) {
        this.clicks.set(this.clicks() + inc);
    }
}

services.add(ClickerPlugin);</code></pre>

</div>
</div>

Local reactive state is a `signal(0)` class field, same as the systray's own
`counter` used to be - read by calling it `this.clicks()` and written with
`.set(...)`, never mutated directly. `useListener` works inside a plugin's
`setup()` just like inside a component's, with the same automatic cleanup.

**static/src/clicker_systray_item/clicker_systray_item.js**, the state moves
out to the plugin:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { registry } from "@web/core/registry";
import { Component, signal, useListener, usePlugin } from "@odoo/owl";
import { ActionPlugin } from "@web/webclient/actions/action_plugin";

export class ClickerSystray extends Component {
    static template = "awesome_clicker.ClickerSystray";

    counter = signal(0);
    action = usePlugin(ActionPlugin);

    setup() {
        useListener(document.body, "click", () => this.counter.set(this.counter() + 1), { capture: true });
    }

    increment() {
        this.counter.set(this.counter() + 9);
    }</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { registry } from "@web/core/registry";
import { Component, usePlugin } from "@odoo/owl";
import { ActionPlugin } from "@web/webclient/actions/action_plugin";
import { ClickerPlugin } from "../clicker_plugin";

export class ClickerSystray extends Component {
    static template = "awesome_clicker.ClickerSystray";

    action = usePlugin(ActionPlugin);
    clicker = usePlugin(ClickerPlugin);</code></pre>

</div>
</div>

**static/src/clicker_systray_item/clicker_systray_item.xml**, the counter's
own line and its button now read from the plugin instead of the removed
local state and method - the `openClientAction` button doesn't change:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8" ?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_clicker.ClickerSystray"&gt;
        &lt;div class="o_nav_entry"&gt;
            Clicks: &lt;t t-out="this.counter()"/&gt;
            &lt;button class="btn btn-secondary" t-on-click="this.increment"&gt;
                &lt;i class="oi oi-lg" data-icon="add"&gt;&lt;/i&gt;
            &lt;/button&gt;
            &lt;button class="btn btn-secondary" t-on-click="this.openClientAction"&gt;
                Open
            &lt;/button&gt;
        &lt;/div&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8" ?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_clicker.ClickerSystray"&gt;
        &lt;div class="o_nav_entry"&gt;
            Clicks: &lt;t t-out="this.clicker.clicks()"/&gt;
            &lt;button class="btn btn-secondary" t-on-click="this.openClientAction"&gt;
                Open
            &lt;/button&gt;
        &lt;/div&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

The `+9` button moves to the client action (see below). Calling
`this.clicker.clicks()` during render tracks it, exactly like the systray's
own `counter` used to.

**static/src/client_action/client_action.js**, the same `usePlugin` in `setup()`:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";

class ClickerClientAction extends Component {
    static template = "awesome_clicker.ClickerClientAction";
}

registry.category("actions").add("awesome_clicker.client_action", ClickerClientAction);</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component, usePlugin } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { ClickerPlugin } from "../clicker_plugin";

class ClickerClientAction extends Component {
    static template = "awesome_clicker.ClickerClientAction";

    clicker = usePlugin(ClickerPlugin);
}

registry.category("actions").add("awesome_clicker.client_action", ClickerClientAction);</code></pre>

</div>
</div>

**static/src/client_action/client_action.xml**, displaying the state and a
button to add 10 clicks - the Ok button and its footer don't change:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_clicker.ClickerClientAction"&gt;
        Clicker client action
        &lt;div class="modal-footer d-flex justify-content-start gap-2 mt-3"&gt;
            &lt;button class="btn btn-primary" t-on-click="() =&gt; this.env.dialogData.close()"&gt;
                Ok
            &lt;/button&gt;
        &lt;/div&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_clicker.ClickerClientAction"&gt;
        &lt;div class="ms-1 mt-1"&gt;
            Clicks: &lt;t t-out="this.clicker.clicks()"/&gt;
            &lt;button class="btn btn-primary ms-1" t-on-click="() =&gt; this.clicker.increment(9)"&gt;
                Increment
            &lt;/button&gt;
        &lt;/div&gt;
        &lt;div class="modal-footer d-flex justify-content-start gap-2 mt-3"&gt;
            &lt;button class="btn btn-primary" t-on-click="() =&gt; this.env.dialogData.close()"&gt;
                Ok
            &lt;/button&gt;
        &lt;/div&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

</details>

## 5. Use a custom hook

Right now, only two components need the clicker plugin, but several more are
about to (the value display, the form controller, the command palette...).
Let us wrap the lookup in a custom hook now, before that fan-out: every future
consumer then depends on `useClicker`, not on `usePlugin(ClickerPlugin)`
directly, so the plugin lookup only ever needs to change in one place.

1. Create and export a `useClicker` hook that wraps that lookup in a simple
   function.
2. Update all current uses of the clicker plugin to the new hook:

   ```js
   clicker = useClicker();
   ```

**See also:**
[Documentation on hooks](https://odoo.github.io/owl/documentation/v3/owl/reference/hooks.html)

<details>
<summary>Show solution</summary>

**static/src/clicker_hook.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { usePlugin } from "@odoo/owl";
import { ClickerPlugin } from "./clicker_plugin";

export function useClicker() {
    return usePlugin(ClickerPlugin);
}</code></pre>

</div>
</div>

Both the systray item and the client action then just do
`clicker = useClicker();` as a class field instead of calling `usePlugin`
directly - everything else (the template expressions, the increment button)
stays exactly as part 4 left it.

</details>

## 6. Humanize the displayed value

We will in the future display large numbers, so let us get ready for that. There
is a `humanNumber` function that format numbers in a easier to comprehend way:
for example, `1234` could be formatted as `1.2k`

1. Use it to display our counters (both in the systray item and the client
   action).
2. Create a `ClickValue` component that displays the value.

Note that Owl allows component that contains just text nodes!

![Humanized Number](_images/humanized_number.png)

**See also:**
[definition of humanNumber function](https://github.com/odoo/odoo/blob/c638913df191dfcc5547f90b8b899e7738c386f1/addons/web/static/src/core/utils/numbers.js#L119)

<details>
<summary>Show solution</summary>

**static/src/clicker_value/clicker_value.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Component } from "@odoo/owl";
import { humanNumber } from "@web/core/utils/numbers";
import { useClicker } from "../clicker_hook";

export class ClickerValue extends Component {
    static template = "awesome_clicker.ClickerValue";

    clicker = useClicker();

    get humanizedClicks() {
        return humanNumber(this.clicker.clicks(), {
            decimals: 1,
        });
    }
}</code></pre>

</div>
</div>

**static/src/clicker_value/clicker_value.xml**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_clicker.ClickerValue"&gt;
        &lt;t t-out="this.humanizedClicks"/&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

Both the systray item and the client action then use `<ClickerValue/>`
(registered in `static components`, imported) in place of their own
`Clicks: <t t-out="this.clicker.clicks()"/>` line.

</details>

## 7. Add a tooltip in ClickValue component

With the `humanNumber` function, we actually lost some precision on our
interface. Let us display the real number as a tooltip.

1. The tooltip needs an html element. Change the `ClickValue` to wrap its value
   in a `<span/>` element
2. Add a dynamic `data-tooltip` attribute to display the exact value.

![Humanized Tooltip](_images/humanized_tooltip.png)

**See also:**
[Documentation in the tooltip service](https://github.com/odoo/odoo/blob/c638913df191dfcc5547f90b8b899e7738c386f1/addons/web/static/src/core/tooltip/tooltip_service.js#L17)

<details>
<summary>Show solution</summary>

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;t t-name="awesome_clicker.ClickerValue"&gt;
    &lt;t t-out="this.humanizedClicks"/&gt;
&lt;/t&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;t t-name="awesome_clicker.ClickerValue"&gt;
    &lt;span t-att-data-tooltip="this.clicker.clicks()" t-out="this.humanizedClicks"/&gt;
&lt;/t&gt;</code></pre>

</div>
</div>

</details>

## 8. Buy ClickBots

Let us make our game even more interesting: once a player get to 1000 clicks for
the first time, the game should unlock a new feature: the player can buy robots
for 1000 clicks. These robots will generate 10 clicks every 10 seconds.

1. Add a `level` number to our state. This is a number that will be incremented
   at some milestones, and unlock new features
2. Add a `clickBots` number to our state. It represents the number of robots
   that have been purchased.
3. Modify the client action to display the number of click bots (only if
   `level >= 1`), with a `Buy` button that is enabled if `clicks >= 1000`. The
   `Buy` button should increment the number of clickbots by 1.
4. Set a 10s interval in the plugin that will increment the number of clicks by
   `10*clickBots`.
5. Make sure the `Buy` button is disabled if the player does not have enough
   clicks.

![Clickbot](_images/clickbot.png)

<details>
<summary>Show solution</summary>

**static/src/clicker_plugin.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Plugin, signal, useListener } from "@odoo/owl";
import { services } from "@web/core/services";

export class ClickerPlugin extends Plugin {
    clicks = signal(0);

    setup() {
        useListener(document.body, "click", () => this.increment(1), { capture: true });
    }

    increment(inc) {
        this.clicks.set(this.clicks() + inc);
    }
}

services.add(ClickerPlugin);</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Plugin, signal, useListener, useEffect } from "@odoo/owl";
import { services } from "@web/core/services";

export class ClickerPlugin extends Plugin {
    clicks = signal(0);
    level = signal(0);
    clickBots = signal(0);

    setup() {
        useListener(document.body, "click", () => this.increment(1), { capture: true });
        useEffect(() => {
            const interval = setInterval(() => {
                this.clicks.set(this.clicks() + this.clickBots() * 10);
            }, 10000);
            return () => clearInterval(interval);
        });
    }

    increment(inc) {
        this.clicks.set(this.clicks() + inc);
        if (this.level() < 1 && this.clicks() >= 1000) {
            this.level.set(1);
        }
    }

    buyClickBot() {
        const clickBotPrice = 1000;
        if (this.clicks() < clickBotPrice) {
            return false;
        }
        this.clicks.set(this.clicks() - clickBotPrice);
        this.clickBots.set(this.clickBots() + 1);
    }
}

services.add(ClickerPlugin);</code></pre>

</div>
</div>

**static/src/client_action/client_action.xml**, a new card once a bot is
unlocked:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;div t-if="this.clicker.level() >= 1" class="ms-1 mt-1"&gt;
    &lt;h2&gt; Bots &lt;/h2&gt;
    &lt;div class="card"&gt;
        &lt;div class="card-header"&gt;
            &lt;t t-out="this.clicker.clickBots()"/&gt;x ClickBots (10 clicks/10seconds)
            &lt;i class="oi" data-icon="rocket_launch"&gt;&lt;/i&gt;
        &lt;/div&gt;
        &lt;div class="card-body"&gt;
            &lt;button t-on-click="() =&gt; this.clicker.buyClickBot()" class="btn btn-primary" t-att-disabled="this.clicker.clicks() lt 1000"&gt;
                Buy ClickBot (1000 clicks)
            &lt;/button&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;</code></pre>

</div>
</div>

**Solution bis**: the `useEffect` call in `setup()` is a reusable shape on its
own - it can be extracted into a custom `useInterval` hook:

```js
import { useEffect } from "@odoo/owl";

export function useInterval(callback, delay) {
    useEffect(() => {
        const interval = setInterval(callback, delay);
        return () => clearInterval(interval);
    });
}
```

`ClickerPlugin.setup()` then reads:

```js
setup() {
    useListener(document.body, "click", () => this.increment(1), { capture: true });
    useInterval(() => {
        this.clicks.set(this.clicks() + this.clickBots() * 10);
    }, 10000);
}
```

</details>

## 9. Notify when a milestone is reached

There is not much feedback that something changed when we reached 1k clicks. Let
us use `EffectPlugin` to communicate that information clearly - `ClickerPlugin`
using another plugin, same as the systray item or the client action use
`ClickerPlugin` itself.

1. Get a handle on `EffectPlugin` in `ClickerPlugin`, with `usePlugin`.
2. Add a `notify(unlock)` method: it uses `EffectPlugin` to display a rainbow
   man, with a message that explains what the player can now buy.
3. Call it when we reach 1000 clicks for the first time.

![Milestones](_images/milestone1.png)

#### See also

- [Owl documentation on plugins](https://odoo.github.io/owl/documentation/v3/owl/reference/plugins.html)

<details>
<summary>Show solution</summary>

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Plugin, signal, useListener, useEffect } from "@odoo/owl";
import { services } from "@web/core/services";

export class ClickerPlugin extends Plugin {
    clicks = signal(0);
    level = signal(0);
    clickBots = signal(0);

    setup() {
        useListener(document.body, "click", () => this.increment(1), { capture: true });
        useEffect(() => {
            const interval = setInterval(() => {
                this.clicks.set(this.clicks() + this.clickBots() * 10);
            }, 10000);
            return () => clearInterval(interval);
        });
    }

    increment(inc) {
        this.clicks.set(this.clicks() + inc);
        if (this.level() < 1 && this.clicks() >= 1000) {
            this.level.set(1);
        }
    }</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Plugin, signal, useListener, useEffect, usePlugin } from "@odoo/owl";
import { services } from "@web/core/services";
import { EffectPlugin } from "@web/core/effects/effect_plugin";

export class ClickerPlugin extends Plugin {
    clicks = signal(0);
    level = signal(0);
    clickBots = signal(0);
    effect = usePlugin(EffectPlugin);

    setup() {
        useListener(document.body, "click", () => this.increment(1), { capture: true });
        useEffect(() => {
            const interval = setInterval(() => {
                this.clicks.set(this.clicks() + this.clickBots() * 10);
            }, 10000);
            return () => clearInterval(interval);
        });
    }

    notify(unlock) {
        this.effect.add({
            message: `Milestone reached! You can now buy ${unlock}`,
            type: "rainbow_man",
        });
    }

    increment(inc) {
        this.clicks.set(this.clicks() + inc);
        if (this.level() < 1 && this.clicks() >= 1000) {
            this.notify("clickbots");
            this.level.set(1);
        }
    }</code></pre>

</div>
</div>

</details>

## 10. Add BigBots

Clearly, we need a way to provide the player with more choices. Let us add a new
type of clickbot: `BigBots`, which are just more powerful: they provide with 100
clicks each 10s, but they cost 5000 clicks.

1. increment `level` when it gets to 5k (so it should be 2)
2. Update the state to keep track of `bigbots`
3. `bigbots` should be available at `level >= 2`
4. Display the corresponding information in the client action

**Tip** If you need to use `<` or `>` in a template as a javascript expression,
be careful since it might clash with the xml parser. To solve that, you can use
one of the special aliases: `gt`, `gte`, `lt` or `lte`. See the
[Owl documentation page on template expressions](https://odoo.github.io/owl/documentation/v3/owl/reference/template_syntax.html#expression-evaluation).

![Bigbots](_images/bigbot.png)

<details>
<summary>Show solution</summary>

Signals stay explicit throughout this part: `clickBots` becomes a `bots`
dict (`clickbot`, `bigbot`), each with a static price/level/increment plus its
own `purchased` signal for the one value that actually changes.
`buyClickBot()` becomes `buyBot(name)`, and the single hardcoded
`this.notify("clickbots")` call becomes a lookup in
`this.milestones[this.level()]`.

**static/src/clicker_plugin.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { Plugin, signal, useListener, useEffect, usePlugin } from "@odoo/owl";
import { services } from "@web/core/services";
import { EffectPlugin } from "@web/core/effects/effect_plugin";

export class ClickerPlugin extends Plugin {
    clicks = signal(0);
    level = signal(0);
    clickBots = signal(0);
    effect = usePlugin(EffectPlugin);

    setup() {
        useListener(document.body, "click", () => this.increment(1), { capture: true });
        useEffect(() => {
            const interval = setInterval(() => {
                this.clicks.set(this.clicks() + this.clickBots() * 10);
            }, 10000);
            return () => clearInterval(interval);
        });
    }

    notify(unlock) {
        this.effect.add({
            message: `Milestone reached! You can now buy ${unlock}`,
            type: "rainbow_man",
        });
    }

    increment(inc) {
        this.clicks.set(this.clicks() + inc);
        if (this.level() < 1 && this.clicks() >= 1000) {
            this.notify("clickbots");
            this.level.set(1);
        }
    }

    buyClickBot() {
        const clickBotPrice = 1000;
        if (this.clicks() < clickBotPrice) {
            return false;
        }
        this.clicks.set(this.clicks() - clickBotPrice);
        this.clickBots.set(this.clickBots() + 1);
    }
}</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Plugin, signal, useListener, useEffect, usePlugin } from "@odoo/owl";
import { services } from "@web/core/services";
import { EffectPlugin } from "@web/core/effects/effect_plugin";

const MILESTONES = [
    { level: 1, clicks: 1000, unlock: "clickbot" },
    { level: 2, clicks: 5000, unlock: "bigbot" },
];

export class ClickerPlugin extends Plugin {
    clicks = signal(0);
    level = signal(0);
    effect = usePlugin(EffectPlugin);

    bots = {
        clickbot: { price: 1000, level: 1, increment: 10, purchased: signal(0) },
        bigbot: { price: 5000, level: 2, increment: 100, purchased: signal(0) },
    };

    setup() {
        useListener(document.body, "click", () => this.increment(1), { capture: true });
        useEffect(() => {
            const interval = setInterval(() => this._tick(), 10000);
            return () => clearInterval(interval);
        });
    }

    _tick() {
        let total = 0;
        for (const bot of Object.values(this.bots)) {
            total += bot.increment * bot.purchased();
        }
        this.clicks.set(this.clicks() + total);
    }

    notify(unlock) {
        this.effect.add({
            message: `Milestone reached! You can now buy ${unlock}`,
            type: "rainbow_man",
        });
    }

    increment(inc) {
        this.clicks.set(this.clicks() + inc);
        const milestone = MILESTONES.find((m) => m.level === this.level() + 1);
        if (milestone && this.clicks() >= milestone.clicks) {
            this.notify(milestone.unlock);
            this.level.set(milestone.level);
        }
    }

    buyBot(name) {
        const bot = this.bots[name];
        if (!bot) {
            throw new Error(`Invalid bot name ${name}`);
        }
        if (this.clicks() < bot.price) {
            return false;
        }
        this.clicks.set(this.clicks() - bot.price);
        bot.purchased.set(bot.purchased() + 1);
    }
}</code></pre>

</div>
</div>

**static/src/client_action/client_action.xml**, looping over the bots instead of one hardcoded card:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;div t-if="this.clicker.level() >= 1" class="ms-1 mt-1"&gt;
    &lt;h2&gt; Bots &lt;/h2&gt;
    &lt;div class="card"&gt;
        &lt;div class="card-header"&gt;
            &lt;t t-out="this.clicker.clickBots()"/&gt;x ClickBots (10 clicks/10seconds)
            &lt;i class="oi" data-icon="rocket_launch"&gt;&lt;/i&gt;
        &lt;/div&gt;
        &lt;div class="card-body"&gt;
            &lt;button t-on-click="() =&gt; this.clicker.buyClickBot()" class="btn btn-primary" t-att-disabled="this.clicker.clicks() lt 1000"&gt;
                Buy ClickBot (1000 clicks)
            &lt;/button&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;div t-if="this.clicker.level() >= 1" class="ms-1 mt-1"&gt;
    &lt;h2&gt; Bots &lt;/h2&gt;
    &lt;div class="d-flex flex-row"&gt;
        &lt;t t-foreach="this.clicker.bots" t-as="bot" t-key="bot"&gt;
            &lt;div t-if="bot_value.level lte this.clicker.level()" class="card me-3"&gt;
                &lt;div class="card-header"&gt;
                    &lt;t t-out="bot_value.purchased()"/&gt;x &lt;t t-out="bot"/&gt; (&lt;t t-out="bot_value.increment"/&gt; clicks/10seconds)
                    &lt;i class="oi" data-icon="rocket_launch"&gt;&lt;/i&gt;
                &lt;/div&gt;
                &lt;div class="card-body"&gt;
                    &lt;button t-on-click="() =&gt; this.clicker.buyBot(bot)" class="btn btn-primary" t-att-disabled="this.clicker.clicks() lt bot_value.price"&gt;
                        Buy &lt;t t-out="bot"/&gt; (&lt;t t-out="bot_value.price"/&gt; clicks)
                    &lt;/button&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/t&gt;
    &lt;/div&gt;
&lt;/div&gt;</code></pre>

</div>
</div>

</details>

## 11. Add a new type of resource: power

Now, to add another scaling point, let us add a new type of resource: a power
multiplier. This is a number that can be increased at level >= 3, and multiplies
the action of the bots (so, instead of providing `N` click, clickbots now
provide us with `power*N` clicks).

1. increment level when the number of clicks gets to 100k (so it should be 3).
2. update the state to keep track of the power (initial value is 1).
3. change bots to use that number as a multiplier.
4. Update the user interface to display and let the user purchase a new power
   level (costs: 50k).

<details>
<summary>Show solution</summary>

A `multiplier` signal (starting at 1), `_tick()` multiplies each bot's
contribution by it, a new `buyMultiplier()` method (costs 50000 clicks), and a
third milestone `{ level: 3, clicks: 100000, unlock: "power multiplier" }`.

**static/src/clicker_plugin.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">const MILESTONES = [
    { level: 1, clicks: 1000, unlock: "clickbot" },
    { level: 2, clicks: 5000, unlock: "bigbot" },
];

export class ClickerPlugin extends Plugin {
    clicks = signal(0);
    level = signal(0);
    effect = usePlugin(EffectPlugin);

    bots = {
        clickbot: { price: 1000, level: 1, increment: 10, purchased: signal(0) },
        bigbot: { price: 5000, level: 2, increment: 100, purchased: signal(0) },
    };

    _tick() {
        let total = 0;
        for (const bot of Object.values(this.bots)) {
            total += bot.increment * bot.purchased();
        }
        this.clicks.set(this.clicks() + total);
    }</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">const MILESTONES = [
    { level: 1, clicks: 1000, unlock: "clickbot" },
    { level: 2, clicks: 5000, unlock: "bigbot" },
    { level: 3, clicks: 100000, unlock: "power multiplier" },
];

export class ClickerPlugin extends Plugin {
    clicks = signal(0);
    level = signal(0);
    multiplier = signal(1);
    effect = usePlugin(EffectPlugin);

    bots = {
        clickbot: { price: 1000, level: 1, increment: 10, purchased: signal(0) },
        bigbot: { price: 5000, level: 2, increment: 100, purchased: signal(0) },
    };

    _tick() {
        let total = 0;
        for (const bot of Object.values(this.bots)) {
            total += bot.increment * bot.purchased() * this.multiplier();
        }
        this.clicks.set(this.clicks() + total);
    }

    buyMultiplier() {
        if (this.clicks() < 50000) {
            return false;
        }
        this.clicks.set(this.clicks() - 50000);
        this.multiplier.set(this.multiplier() + 1);
    }</code></pre>

</div>
</div>

**static/src/client_action/client_action.xml**, a new card once level 3 is reached:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;div t-if="this.clicker.level() >= 3" class="ms-1 mt-1"&gt;
    &lt;h2&gt; Power multiplier &lt;/h2&gt;
    &lt;div class="d-flex flex-row"&gt;
        &lt;div class="card me-3"&gt;
            &lt;div class="card-header"&gt;
                &lt;t t-out="this.clicker.multiplier()"/&gt;x
                &lt;i class="oi" data-icon="flash_on"&gt;&lt;/i&gt;
            &lt;/div&gt;
            &lt;div class="card-body"&gt;
                &lt;button t-on-click="() =&gt; this.clicker.buyMultiplier()" class="btn btn-primary" t-att-disabled="this.clicker.clicks() lt 50000"&gt;
                    Buy Power Multiplier (50000 clicks)
                &lt;/button&gt;
            &lt;/div&gt;
        &lt;/div&gt;
    &lt;/div&gt;
&lt;/div&gt;</code></pre>

</div>
</div>

The bots card's clicks/10s figure also grows a `* this.clicker.multiplier()`
factor: `<t t-out="bot_value.increment * this.clicker.multiplier()"/>`.

</details>

## 12. Define some random rewards

We want the user to obtain sometimes bonuses, to reward using Odoo. A reward is
an object with:

- a `description` string.
- an `apply` function that take the game state in argument and can modify it.
- a `minLevel` number (optional) that describes at which unlock level the bonus
  is available.
- a `maxLevel` number (optional) that describes at which unlock level a bonus is
  no longer available.

1. Define a list of rewards in a new file `click_rewards.js`. For example:

   ```js
   export const rewards = [
     {
       description: "Get 1 click bot",
       apply(clicker) {
         const bot = clicker.bots.clickbot;
         bot.purchased.set(bot.purchased() + 1);
       },
       maxLevel: 3,
     },
     {
       description: "Get 10 click bot",
       apply(clicker) {
         const bot = clicker.bots.clickbot;
         bot.purchased.set(bot.purchased() + 10);
       },
       minLevel: 3,
       maxLevel: 4,
     },
     {
       description: "Increase bot power!",
       apply(clicker) {
         clicker.multiplier.set(clicker.multiplier() + 1);
       },
       minLevel: 3,
     },
   ];
   ```

   You can add whatever you want to that list!

2. Define a function `getReward` that will select a random reward from the list
   of rewards that matches the current unlock level.
3. Extract the code that choose randomly in an array in a function `choose` that
   you can move to another `utils.js` file.

<details>
<summary>Show solution</summary>

**static/src/click_rewards.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">export const rewards = [
    {
        description: "Get 1 click bot",
        apply(clicker) {
            const bot = clicker.bots.clickbot;
            bot.purchased.set(bot.purchased() + 1);
        },
        maxLevel: 3,
    },
    {
        description: "Get 10 click bot",
        apply(clicker) {
            const bot = clicker.bots.clickbot;
            bot.purchased.set(bot.purchased() + 10);
        },
        minLevel: 3,
        maxLevel: 4,
    },
    {
        description: "Increase bot power!",
        apply(clicker) {
            clicker.multiplier.set(clicker.multiplier() + 1);
        },
        minLevel: 3,
    },
];</code></pre>

</div>
</div>

**static/src/utils.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">export function choose(list) {
    return list[Math.floor(Math.random() * list.length)];
}</code></pre>

</div>
</div>

**static/src/clicker_plugin.js**, a `giveReward()` method:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">giveReward() {
    const availableReward = [];
    for (const reward of rewards) {
        if (reward.minLevel <= this.level() || !reward.minLevel) {
            if (reward.maxLevel >= this.level() || !reward.maxLevel) {
                availableReward.push(reward);
            }
        }
    }
    return choose(availableReward);
}</code></pre>

</div>
</div>

(with `import { rewards } from "./click_rewards";` and
`import { choose } from "./utils";` added at the top)

</details>

## 13. Provide a reward when opening a form view

1. Patch the form controller. Each time a form controller is created, it should
   randomly decides (1% chance) if a reward should be given.
2. If the answer is yes, call a method `giveReward` on `ClickerPlugin`.
3. That method should choose a reward, send a sticky notification, with a button
   `Collect` that will then apply the reward, and finally, it should open the
   `clicker` client action.

![Rewar](_images/reward.png)

#### See also

- [Documentation on patching a class](https://www.odoo.com/documentation/master/developer/reference/frontend/patching_code.html#frontend-patching-class)
- [Definition of patch function](https://github.com/odoo/odoo/blob/c638913df191dfcc5547f90b8b899e7738c386f1/addons/web/static/src/core/utils/patch.js#L71)
- [Example of patching a class](https://github.com/odoo/odoo/blob/c638913df191dfcc5547f90b8b899e7738c386f1/addons/web/static/src/core/utils/patch.js#L71)

<details>
<summary>Show solution</summary>

**static/src/clicker_plugin.js**, `giveReward()` shows the notification
itself and opens the client action - two more plugins in a plugin:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">giveReward() {
    const availableReward = [];
    for (const reward of rewards) {
        if (reward.minLevel <= this.level() || !reward.minLevel) {
            if (reward.maxLevel >= this.level() || !reward.maxLevel) {
                availableReward.push(reward);
            }
        }
    }
    return choose(availableReward);
}</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">giveReward() {
    const availableReward = [];
    for (const reward of rewards) {
        if (reward.minLevel <= this.level() || !reward.minLevel) {
            if (reward.maxLevel >= this.level() || !reward.maxLevel) {
                availableReward.push(reward);
            }
        }
    }
    const reward = choose(availableReward);
    const closeNotification = this.notification.add(
        `Congrats you won a reward: "${reward.description}"`,
        {
            type: "success",
            sticky: true,
            buttons: [
                {
                    name: "Collect",
                    onClick: () => {
                        reward.apply(this);
                        closeNotification();
                        this.action.doAction({
                            type: "ir.actions.client",
                            tag: "awesome_clicker.client_action",
                            target: "new",
                            name: "Clicker Game",
                        });
                    },
                },
            ],
        }
    );
}</code></pre>

</div>
</div>

with `action = usePlugin(ActionPlugin)` and
`notification = usePlugin(NotificationPlugin)` added as fields, next to
`effect`.

**static/src/form_controller/form_controller_patch.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { FormController } from "@web/views/form/form_controller";
import { patch } from "@web/core/utils/patch";
import { useClicker } from "../clicker_hook";

const FormControllerPatch = {
    setup() {
        super.setup(...arguments);
        if (Math.random() < 0.01) {
            const clicker = useClicker();
            clicker.giveReward();
        }
    },
};

patch(FormController.prototype, FormControllerPatch);</code></pre>

</div>
</div>

</details>

## 14. Add commands in command palette

Let us now provide more interesting ways to interact with our game.

1. Add a command `Open Clicker Game` to the command palette.
2. Add another command: `Buy 1 click bot`.

![Command Palette](_images/command_palette.png)

**See also:**
[Example of use of command provider registry](https://github.com/odoo/odoo/blob/c638913df191dfcc5547f90b8b899e7738c386f1/addons/web/static/src/core/debug/debug_providers.js#L10)

<details>
<summary>Show solution</summary>

**static/src/clicker_provider.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { usePlugin } from "@odoo/owl";
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
});</code></pre>

</div>
</div>

`provide()` runs inside the command palette's own plugin scope, so
`usePlugin` works directly.

</details>

## 15. Add yet another resource: trees

It is now time to introduce a completely new type of resources. Here is one that
should not be too controversial: trees. We will now allow the user to plant
(collect?) fruit trees. A tree costs 1 million clicks, but it will provide us
with fruits (either pears or cherries).

1. Update the state to keep track of various types of trees: pear/cherries, and
   their fruits.
2. Add a function that computes the total number of trees and fruits.
3. Define a new unlock level at `clicks >= 1 000 000`.
4. Update the client user interface to display the number of trees and fruits,
   and also, to buy trees.
5. Increment the fruit number by 1 for each tree every 30s.

<details>
<summary>Show solution</summary>

**static/src/clicker_plugin.js**: a `trees` dict (pearTree, cherryTree, each
1000000 clicks, unlocked at level 4, with a `purchased` signal) and a
`fruits` dict of signals, grown by their own `_tickFruits()`, on its own
30s interval:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">bots = {
    clickbot: { price: 1000, level: 1, increment: 10, purchased: signal(0) },
    bigbot: { price: 5000, level: 2, increment: 100, purchased: signal(0) },
};</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">bots = {
    clickbot: { price: 1000, level: 1, increment: 10, purchased: signal(0) },
    bigbot: { price: 5000, level: 2, increment: 100, purchased: signal(0) },
};

trees = {
    pearTree: { price: 1000000, level: 4, produce: "pear", purchased: signal(0) },
    cherryTree: { price: 1000000, level: 4, produce: "cherry", purchased: signal(0) },
};

fruits = {
    pear: signal(0),
    cherry: signal(0),
};</code></pre>

</div>
</div>

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">setup() {
    useListener(document.body, "click", () => this.increment(1), { capture: true });
    useEffect(() => {
        const interval = setInterval(() => this._tick(), 10000);
        return () => clearInterval(interval);
    });
}</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">setup() {
    useListener(document.body, "click", () => this.increment(1), { capture: true });
    useEffect(() => {
        const interval = setInterval(() => this._tick(), 10000);
        return () => clearInterval(interval);
    });
    useEffect(() => {
        const interval = setInterval(() => this._tickFruits(), 30000);
        return () => clearInterval(interval);
    });
}

_tickFruits() {
    for (const tree of Object.values(this.trees)) {
        const fruit = this.fruits[tree.produce];
        fruit.set(fruit() + tree.purchased());
    }
}

buyTree(name) {
    const tree = this.trees[name];
    if (!tree) {
        throw new Error(`Invalid tree name ${name}`);
    }
    if (this.clicks() < tree.price) {
        return false;
    }
    this.clicks.set(this.clicks() - tree.price);
    tree.purchased.set(tree.purchased() + 1);
}</code></pre>

</div>
</div>

plus a fourth milestone `{ level: 4, clicks: 1000000, unlock: "pear tree & cherry tree" }`.

**static/src/client_action/client_action.xml**, a new section once level 4 is reached:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;div t-if="this.clicker.level() >= 4" class="ms-1 mt-1"&gt;
    &lt;h2&gt; Trees &lt;/h2&gt;
    &lt;div class="d-flex flex-row"&gt;
        &lt;t t-foreach="this.clicker.trees" t-as="tree" t-key="tree"&gt;
            &lt;div t-if="tree_value.level lte this.clicker.level()" class="card me-3"&gt;
                &lt;div class="card-header"&gt;
                    &lt;t t-out="tree_value.purchased()"/&gt;x &lt;t t-out="tree"/&gt; (1x &lt;t t-out="tree_value.produce"/&gt; /30seconds)
                    &lt;i class="oi" data-icon="park"&gt;&lt;/i&gt;
                &lt;/div&gt;
                &lt;div class="card-body"&gt;
                    &lt;button t-on-click="() =&gt; this.clicker.buyTree(tree)" class="btn btn-primary" t-att-disabled="this.clicker.clicks() lt tree_value.price"&gt;
                        Buy &lt;t t-out="tree"/&gt; (&lt;t t-out="tree_value.price"/&gt; clicks)
                    &lt;/button&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/t&gt;
    &lt;/div&gt;

    &lt;h2&gt; Fruits &lt;/h2&gt;
    &lt;div class="d-flex flex-row"&gt;
        &lt;t t-foreach="this.clicker.fruits" t-as="fruit" t-key="fruit"&gt;
            &lt;div class="card me-3"&gt;
                &lt;div class="card-header"&gt;
                    &lt;t t-out="fruit_value()"/&gt;x &lt;t t-out="fruit"/&gt;
                &lt;/div&gt;
            &lt;/div&gt;
        &lt;/t&gt;
    &lt;/div&gt;
&lt;/div&gt;</code></pre>

</div>
</div>

</details>

## 16. Use a dropdown menu for the systray item

Our game starts to become interesting. But for now, the systray only displays
the total number of clicks. We want to see more information: the total number of
trees and fruits. Also, it would be useful to have a quick access to some
commands and some more information. Let us use a dropdown menu!

1. Replace the systray item by a dropdown menu.
2. It should display the numbers of clicks, trees, and fruits, each with a nice
   icon.
3. Clicking on it should open a dropdown menu that displays more detailed
   information: each types of trees and fruits.
4. Also, a few dropdown items with some commands: open the clicker game, buy a
   clickbot, ...

![Dropdown](_images/dropdown.png)

<details>
<summary>Show solution</summary>

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">import { registry } from "@web/core/registry";
import { Component, usePlugin } from "@odoo/owl";
import { ActionPlugin } from "@web/webclient/actions/action_plugin";
import { useClicker } from "../clicker_hook";
import { ClickerValue } from "../clicker_value/clicker_value";

export class ClickerSystray extends Component {
    static template = "awesome_clicker.ClickerSystray";
    static components = { ClickerValue };

    action = usePlugin(ActionPlugin);
    clicker = useClicker();

    openClientAction() {
        this.action.doAction({
            type: "ir.actions.client",
            tag: "awesome_clicker.client_action",
            target: "new",
            name: "Clicker",
        });
    }
}</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { registry } from "@web/core/registry";
import { Component, usePlugin } from "@odoo/owl";
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
            name: "Clicker",
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
}</code></pre>

</div>
</div>

**static/src/clicker_systray_item/clicker_systray_item.xml**, nothing else
touched it since part 1:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8" ?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_clicker.ClickerSystray"&gt;
        &lt;div class="o_nav_entry"&gt;
            Clicks: &lt;t t-out="this.counter()"/&gt;
            &lt;button class="btn btn-secondary" t-on-click="this.increment"&gt;
                &lt;i class="oi oi-lg" data-icon="add"&gt;&lt;/i&gt;
            &lt;/button&gt;
        &lt;/div&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-markup">&lt;?xml version="1.0" encoding="UTF-8" ?&gt;
&lt;templates xml:space="preserve"&gt;
    &lt;t t-name="awesome_clicker.ClickerSystray"&gt;
        &lt;div class="o_nav_entry"&gt;
            &lt;Dropdown&gt;
                &lt;button&gt;
                    &lt;ClickerValue/&gt; &lt;i class="oi oi-fw" data-icon="arrow_selector_tool"&gt;&lt;/i&gt;,
                    &lt;t t-out="this.numberTrees"/&gt; &lt;i class="oi oi-fw" data-icon="park"&gt;&lt;/i&gt;,
                    &lt;t t-out="this.numberFruits"/&gt; &lt;i class="oi oi-fw" data-icon="eco"&gt;&lt;/i&gt;
                &lt;/button&gt;
                &lt;t t-set-slot="content"&gt;
                    &lt;DropdownItem&gt;
                        &lt;button class="btn btn-secondary" t-on-click="this.openClientAction"&gt; Open the clicker game &lt;/button&gt;
                    &lt;/DropdownItem&gt;
                    &lt;DropdownItem&gt;
                        &lt;button class="btn btn-secondary" t-on-click="() =&gt; this.clicker.buyBot('clickbot')"&gt; Buy a ClickBot &lt;/button&gt;
                    &lt;/DropdownItem&gt;
                    &lt;DropdownItem t-foreach="this.clicker.trees" t-as="tree" t-key="tree"&gt;
                        &lt;t t-out="tree_value.purchased()"/&gt;x
                        &lt;t t-out="tree"/&gt;
                    &lt;/DropdownItem&gt;
                    &lt;DropdownItem t-foreach="this.clicker.fruits" t-as="fruit" t-key="fruit"&gt;
                        &lt;t t-out="fruit_value()"/&gt;x
                        &lt;t t-out="fruit"/&gt;
                    &lt;/DropdownItem&gt;
                &lt;/t&gt;
            &lt;/Dropdown&gt;
        &lt;/div&gt;
    &lt;/t&gt;
&lt;/templates&gt;</code></pre>

</div>
</div>

</details>

## 17. Use a Notebook component

We now keep track of a lot more information. Let us improve our client interface
by organizing the information and features in various tabs, with the `Notebook`
component:

1. Use the `Notebook` component.
2. All `click` content should be displayed in one tab.
3. All tree/fruits content should be displayed in another tab.

![Notebook](_images/notebook.png)

#### See also

- [Odoo: Documentation on Notebook component](https://www.odoo.com/documentation/master/developer/reference/frontend/owl_components.html#frontend-owl-notebook)
- [Owl: Documentation on slots](https://odoo.github.io/owl/documentation/v3/owl/reference/slots.html)
- [Tests of Notebook component](https://github.com/odoo/odoo/blob/c638913df191dfcc5547f90b8b899e7738c386f1/addons/web/static/tests/core/notebook_tests.js#L27)

<details>
<summary>Show solution</summary>

The "Bots"/"Power multiplier" content and the "Trees"/"Fruits" content each
move into their own `<Notebook>` tab. The outer `<div t-if="...level() >= N">`
wrapper around each group is replaced by `isVisible` on its `<t t-set-slot>` -
the "Power multiplier" div keeps its own `t-if` though, since `level() >= 3`
is a finer condition than the "clicks" tab's own `level() >= 1`.

**static/src/client_action/client_action.js**, one more import:

```javascript
import { Notebook } from "@web/core/notebook/notebook";
```

and `Notebook` added to `static components`.

**static/src/client_action/client_action.xml**

```xml
<Notebook>
    <t t-set-slot="clicks" title="'Clicks'" isVisible="this.clicker.level() >= 1">
        <div class="ms-1 mt-1">
            <!-- the "Bots" section, unchanged -->
        </div>
        <div t-if="this.clicker.level() >= 3" class="ms-1 mt-1">
            <!-- the "Power multiplier" section, unchanged -->
        </div>
    </t>
    <t t-set-slot="trees" title="'Trees and Fruits'" isVisible="this.clicker.level() >= 4">
        <div class="ms-1 mt-1">
            <!-- the "Trees" and "Fruits" sections, unchanged -->
        </div>
    </t>
</Notebook>
```

</details>

## 18. Persist the game state

You certainly noticed a big flaw in our game: it is transient. The game state is
lost each time the user closes the browser tab. Let us fix that, with a
`ClickerStoragePlugin` wrapping `localStorage` - another plugin `ClickerPlugin`
depends on for one of its edges, same as `EffectPlugin`/`ActionPlugin`. Since
it's specific to the clicker's own state shape, the serializing and loading
logic itself belongs there too, not in `ClickerPlugin`.

1. Create a `ClickerStoragePlugin` with `save(clicker)`/`load(clicker)`
   methods, reading and writing `window.localStorage` as JSON.
2. In `ClickerPlugin`, call `save()` from a `useEffect` that reads the state -
   that way it re-runs and saves on every single change, not just on a timer.
3. When `ClickerPlugin` starts, it should `load()` the state from storage (if
   any), or keep its own defaults otherwise.

<details>
<summary>Show solution</summary>

**static/src/clicker_storage_plugin.js**: since the state is spread across
several signals (some of them nested, like each bot's own `purchased`),
serializing means reading every signal into a plain object, and loading means
setting each one back - there's no single `Object.assign` shortcut like there
would be for plain properties. `bots` and `trees` share the same shape (a
`purchased` signal per entry), `fruits` is a flat dict of signals - two small
helpers per shape avoid writing the same `Object.entries`/`Object.fromEntries`
dance three times.

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">import { Plugin } from "@odoo/owl";
import { services } from "@web/core/services";

const STORAGE_KEY = "clickerState";

function dumpPurchased(dict) {
    return Object.fromEntries(Object.entries(dict).map(([name, v]) => [name, v.purchased()]));
}

function loadPurchased(dict, saved) {
    for (const [name, purchased] of Object.entries(saved)) {
        dict[name].purchased.set(purchased);
    }
}

function dumpSignals(dict) {
    return Object.fromEntries(Object.entries(dict).map(([name, s]) => [name, s()]));
}

function loadSignals(dict, saved) {
    for (const [name, value] of Object.entries(saved)) {
        dict[name].set(value);
    }
}

export class ClickerStoragePlugin extends Plugin {
    save(clicker) {
        const json = {
            clicks: clicker.clicks(),
            level: clicker.level(),
            multiplier: clicker.multiplier(),
            bots: dumpPurchased(clicker.bots),
            trees: dumpPurchased(clicker.trees),
            fruits: dumpSignals(clicker.fruits),
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
    }

    load(clicker) {
        const value = window.localStorage.getItem(STORAGE_KEY);
        if (!value) {
            return;
        }
        const saved = JSON.parse(value);
        clicker.clicks.set(saved.clicks);
        clicker.level.set(saved.level);
        clicker.multiplier.set(saved.multiplier);
        loadPurchased(clicker.bots, saved.bots);
        loadPurchased(clicker.trees, saved.trees);
        loadSignals(clicker.fruits, saved.fruits);
    }
}

services.add(ClickerStoragePlugin);</code></pre>

</div>
</div>

`save`/`load` take the clicker instance as an argument, rather than
`ClickerStoragePlugin` reaching for `ClickerPlugin` itself with `usePlugin` -
that would be circular, since `ClickerPlugin` already depends on
`ClickerStoragePlugin`.

**static/src/clicker_plugin.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">effect = usePlugin(EffectPlugin);
action = usePlugin(ActionPlugin);
notification = usePlugin(NotificationPlugin);</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">effect = usePlugin(EffectPlugin);
action = usePlugin(ActionPlugin);
notification = usePlugin(NotificationPlugin);
storage = usePlugin(ClickerStoragePlugin);</code></pre>

</div>
</div>

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">setup() {
    useListener(document.body, "click", () => this.increment(1), { capture: true });
    useEffect(() => {
        const interval = setInterval(() => this._tick(), 10000);
        return () => clearInterval(interval);
    });
    useEffect(() => {
        const interval = setInterval(() => this._tickFruits(), 30000);
        return () => clearInterval(interval);
    });
}</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">setup() {
    this.storage.load(this);
    useListener(document.body, "click", () => this.increment(1), { capture: true });
    useEffect(() => this.storage.save(this));
    useEffect(() => {
        const interval = setInterval(() => this._tick(), 10000);
        return () => clearInterval(interval);
    });
    useEffect(() => {
        const interval = setInterval(() => this._tickFruits(), 30000);
        return () => clearInterval(interval);
    });
}</code></pre>

</div>
</div>

`useEffect(() => this.storage.save(this))` auto-tracks every signal `save()`
reads (`clicks`, `level`, `multiplier`, every bot/tree's `purchased`, every
fruit) - it reruns, and re-saves, whenever any one of them changes. `_tick()`
itself no longer calls `save()` explicitly - its own `clicks.set(...)` already
triggers the same effect.

(with `import { ClickerStoragePlugin } from "./clicker_storage_plugin";`
added at the top.)

</details>

## 19. Introduce state migration system

Once you persist state somewhere, a new problem arises: what happens when you
update your code, so the shape of the state changes, and the user opens its
browser with a state that was created with an old version? Welcome to the world
of migration issues!

It is probably wise to tackle the problem early. What we will do here is add a
version number to the state, and introduce a system to automatically update the
states if it is not up to date.

1. Add a version number to the state.
2. Define an (empty) list of migrations. A migration is an object with a
   `fromVersion` number, a `toVersion` number, and a `apply` function.
3. Whenever `ClickerStoragePlugin` loads the state, it should check the
   version number. If the state is not uptodate, it should apply all necessary
   migrations.

The version number is purely a storage-format concern - it only exists in the
serialized JSON, `ClickerPlugin` itself never needs to know its own version.

<details>
<summary>Show solution</summary>

**static/src/clicker_migration.js**

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript"></code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">export const CURRENT_VERSION = 1.0;
export const migrations = [];

export function migrate(localState) {
    if (localState?.version < CURRENT_VERSION) {
        for (const migration of migrations) {
            if (localState.version === migration.fromVersion) {
                migration.apply(localState);
                localState.version = migration.toVersion;
            }
        }
        localState.version = CURRENT_VERSION;
    }
    return localState;
}</code></pre>

</div>
</div>

**static/src/clicker_storage_plugin.js**: `save()` stamps the current
version, `load()` migrates before applying:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">save(clicker) {
    const json = {
        clicks: clicker.clicks(),
        level: clicker.level(),
        multiplier: clicker.multiplier(),
        bots: dumpPurchased(clicker.bots),
        trees: dumpPurchased(clicker.trees),
        fruits: dumpSignals(clicker.fruits),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
}

load(clicker) {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) {
        return;
    }
    const saved = JSON.parse(value);
    clicker.clicks.set(saved.clicks);</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">save(clicker) {
    const json = {
        version: CURRENT_VERSION,
        clicks: clicker.clicks(),
        level: clicker.level(),
        multiplier: clicker.multiplier(),
        bots: dumpPurchased(clicker.bots),
        trees: dumpPurchased(clicker.trees),
        fruits: dumpSignals(clicker.fruits),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json));
}

load(clicker) {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) {
        return;
    }
    const saved = migrate(JSON.parse(value));
    clicker.clicks.set(saved.clicks);</code></pre>

</div>
</div>

(with `import { CURRENT_VERSION, migrate } from "./clicker_migration";` added
at the top.)

</details>

## 20. Add another type of trees

To test our migration system, let us add a new type of trees: peaches.

1. Add `peach` trees in the model and in the UI.
2. Increment the state version number.
3. Define a migration.

![Peach tree](_images/peach_tree.png)

<details>
<summary>Show solution</summary>

**static/src/clicker_plugin.js**: a `peachTree` added to `trees` (1500000
clicks) and `peach` added to `fruits` - the client action's `t-foreach`
already loops over both dicts, so the UI needs no further changes.

**static/src/clicker_migration.js**, bumping the version and migrating
existing saved state that predates peach trees. The stored shape only ever
holds each tree/fruit's count (its static price/level/produce lives in
`ClickerPlugin` itself, not in storage), so the migration only needs to add
that one number:

<div class="diff-cols">
<div class="before">
<h4>Before</h4>

<pre><code class="language-javascript">export const CURRENT_VERSION = 1.0;
export const migrations = [];

export function migrate(localState) {
    if (localState?.version < CURRENT_VERSION) {
        for (const migration of migrations) {
            if (localState.version === migration.fromVersion) {
                migration.apply(localState);
                localState.version = migration.toVersion;
            }
        }
        localState.version = CURRENT_VERSION;
    }
    return localState;
}</code></pre>

</div>
<div class="after">
<h4>After</h4>

<pre><code class="language-javascript">export const CURRENT_VERSION = 2.0;
export const migrations = [
    {
        fromVersion: 1.0,
        toVersion: 2.0,
        apply: (state) => {
            state.trees.peachTree = 0;
            state.fruits.peach = 0;
        },
    },
];

export function migrate(localState) {
    if (localState?.version < CURRENT_VERSION) {
        for (const migration of migrations) {
            if (localState.version === migration.fromVersion) {
                migration.apply(localState);
                localState.version = migration.toVersion;
            }
        }
        localState.version = CURRENT_VERSION;
    }
    return localState;
}</code></pre>

</div>
</div>

That's the whole game: local component state as a signal, moved to a plugin
shared by every component that needs it, other plugins depended on for its
own edges (`EffectPlugin`, `ActionPlugin`, `NotificationPlugin`,
`ClickerStoragePlugin`), a patched core class, a command provider, and state
persisted to (and migrated in) local storage.

</details>
