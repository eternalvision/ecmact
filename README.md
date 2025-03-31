<p align="center">
  <img src="./public/ecmact.png" alt="ECMact Logo" width="300" />
</p>

# ECMACT

ECMact is a lightweight component-based UI library using native Web Components. It provides a declarative API for creating dynamic and reactive DOM elements with built-in style and event handling.

---

## 🚀 Installation

```bash
npm install ecmact
```

---

## ✨ Usage Example

```js
import { em, mount } from "ecmact";

let count = 0;

const card = em.Card({
  content: "Click me!",
  onclick: () => {
    count++;
    card.setState({
      content: `You clicked ${count} time${count === 1 ? "" : "s"}`,
    });
  },
  style: {
    padding: "20px",
    backgroundColor: "#cceeff",
    borderRadius: "10px",
    textAlign: "center",
    cursor: "pointer",
  },
});

mount("body", card);
```

---

## 🧱 API

### `em.[ComponentName](props)`

Creates a new component instance. You can use any name (e.g. `Card`, `Paragraph`, `Button`, etc.) — it automatically registers a custom element `em-[componentname]`.

#### `props` (object)

| Property                  | Type            | Description                                                 |
| ------------------------- | --------------- | ----------------------------------------------------------- |
| `tag`                   | `string`      | The HTML tag to render (optional, default is `"div"`).    |
| `content`               | `string`      | Inner text/HTML content (optional).                         |
| `children`              | `component[]` | Nested components (optional).                               |
| `style`                 | `object`      | CSS styles as an object (optional).                         |
| `props`                 | `object`      | HTML element attributes (e.g.`placeholder`,`src`, etc). |
| `onclick`(or any event) | `function`    | Event listeners (optional).                                 |

---

### `mount(target, ...components)`

Mounts one or more components into the DOM.

* `target`: A CSS selector or DOM element (e.g. `"body"` or `"#app"`).
* `components`: Any number of components created via `em.ComponentName()`.

---

## 🧠 Component State

Each component has a `setState(newProps)` method that updates its props and re-renders the content.

```js
card.setState({ content: "Updated!" });
```

---

## 🧩 Example Components

```js
const heading = em.Heading({
  tag: "h1",
  content: "Welcome to ECMact",
  style: { textAlign: "center", color: "#333" },
});

const button = em.Button({
  content: "Click me",
  onclick: () => alert("Hello!"),
  style: { padding: "10px", backgroundColor: "#4CAF50", color: "#fff" },
});
```

---

## 🧪 Development

The `ecmact` core is built using:

* Native Web Components (`HTMLElement`)
* Shadow DOM encapsulation
* Custom event + style handling

You can extend components easily or register custom ones using the same proxy-based approach.
