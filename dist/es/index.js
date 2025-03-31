const p = ({ props: s, shadowRoot: t }) => {
  Object.entries(s).forEach(([e, n]) => {
    if (e.startsWith("on") && typeof n == "function") {
      const o = e.slice(2).toLowerCase();
      t.querySelector(s.tag || "div")?.addEventListener(o, n);
    }
  });
}, a = ({ style: s, tag: t }) => {
  if (Object.keys(s).length === 0) return "";
  const e = Object.entries(s).map(([n, o]) => `${n.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${o};`).join(" ");
  return `<style>${t} { ${e} }</style>`;
}, h = ({ props: s }) => Object.entries(s).filter(
  ([t]) => !["content", "tag", "style", "children"].includes(t) && !t.startsWith("on")
).map(([t, e]) => `${t}="${e}"`).join(" "), l = ({ props: s, shadowRoot: t, generateStyle: e }) => {
  const { content: n = "", tag: o = "div", children: r = [] } = s;
  t.innerHTML = `
      ${e()}
      <${o} ${h({ props: s })}>
        ${n.length > 0 ? n : ""}
        ${r.length > 0 ? "<slot></slot>" : ""}
      </${o}>
    `;
  const c = t.querySelector("slot");
  r.forEach((i) => c.appendChild(i));
}, u = (s, ...t) => {
  const e = document.querySelector(s);
  e && e.append(...t);
};
class d extends HTMLElement {
  _props;
  constructor(t = {}) {
    super(), this.attachShadow({ mode: "open" }), this._props = t;
  }
  #t() {
    return p({
      props: this.props,
      shadowRoot: this.shadowRoot
    });
  }
  #s() {
    const { style: t = {}, tag: e = "div" } = this.props;
    return a({ style: t, tag: e });
  }
  #e() {
    return l({
      props: this._props,
      shadowRoot: this.shadowRoot,
      generateStyle: () => this.#s()
    });
  }
  connectedCallback() {
    this.#e(), this.#t();
  }
  setState(t) {
    this.props = {
      ...this._props,
      ...t
    };
  }
  get props() {
    return this._props;
  }
  set props(t) {
    this._props = t, this.#e(), this.#t();
  }
}
const m = new Proxy({}, {
  get(s, t) {
    const e = `em-${t.toLowerCase()}`;
    return customElements.get(e) || customElements.define(
      e,
      class extends d {
        constructor(n) {
          super(n);
        }
      }
    ), (n) => {
      const o = document.createElement(e);
      return o.props = n, o;
    };
  }
});
export {
  m as em,
  u as mount
};
//# sourceMappingURL=index.js.map
