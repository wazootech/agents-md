import { type Answers, visibleQuestions, withDefaults } from "./tree.ts";
import { rules } from "./rules.ts";
import {
  decodeAnswers,
  encodeAnswers,
  generate,
  LINE_BUDGET,
} from "./generate.ts";

const form = document.getElementById("wizard") as HTMLFormElement;
const preview = document.getElementById("preview") as HTMLPreElement;
const meter = document.getElementById("meter") as HTMLParagraphElement;
const why = document.getElementById("why") as HTMLUListElement;

let answers: Answers = decodeAnswers(location.hash.slice(1));

function field(
  q: ReturnType<typeof visibleQuestions>[number],
  value: string,
): HTMLElement {
  const wrap = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.textContent = q.label;
  wrap.append(legend);
  if (q.hint) {
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = q.hint;
    wrap.append(p);
  }
  if (q.type === "text") {
    const input = document.createElement("input");
    input.name = q.id;
    input.value = value;
    input.setAttribute("aria-label", q.label);
    input.addEventListener("input", () => update(q.id, input.value));
    wrap.append(input);
  } else {
    for (const c of q.choices ?? []) {
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = q.id;
      radio.value = c.value;
      radio.checked = value === c.value;
      radio.addEventListener("change", () => update(q.id, c.value, true));
      label.append(radio, ` ${c.label}`);
      wrap.append(label);
    }
  }
  return wrap;
}

function update(id: string, value: string, rerender = false) {
  answers = { ...answers, [id]: value };
  history.replaceState(null, "", `#${encodeAnswers(answers)}`);
  if (rerender) renderForm();
  renderOutput();
}

function renderForm() {
  const full = withDefaults(answers);
  const active = document.activeElement as HTMLInputElement | null;
  const focused = active?.name;
  form.replaceChildren(
    ...visibleQuestions(full).map((q) => field(q, full[q.id])),
  );
  if (focused) {
    form.querySelector<HTMLInputElement>(`[name="${focused}"]`)?.focus();
  }
}

function renderOutput() {
  const full = withDefaults(answers);
  const md = generate(answers);
  preview.textContent = md;
  const n = md.split("\n").length - 1;
  meter.textContent = `${n} / ${LINE_BUDGET} lines`;
  meter.dataset.over = String(n > LINE_BUDGET);
  why.replaceChildren(
    ...rules.filter((r) => !r.when || r.when(full)).map((r) => {
      const li = document.createElement("li");
      li.textContent = `${r.section}: ${r.why}`;
      return li;
    }),
  );
}

document.getElementById("copy")!.addEventListener("click", async (e) => {
  const btn = e.currentTarget as HTMLButtonElement;
  try {
    await navigator.clipboard.writeText(generate(answers));
    btn.textContent = "Copied";
  } catch {
    btn.textContent = "Copy failed";
  }
  setTimeout(() => (btn.textContent = "Copy"), 1500);
});

document.getElementById("download")!.addEventListener("click", () => {
  const url = URL.createObjectURL(
    new Blob([generate(answers)], { type: "text/markdown" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "AGENTS.md";
  a.click();
  URL.revokeObjectURL(url);
});

globalThis.addEventListener("hashchange", () => {
  answers = decodeAnswers(location.hash.slice(1));
  renderForm();
  renderOutput();
});

renderForm();
renderOutput();
