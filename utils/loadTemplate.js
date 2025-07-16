import fs from "fs";
import path from "path";

export function loadTemplate(name, vars = {}) {
  const filePath = path.join(process.cwd(), "service", `${name}.html`);
  let html = fs.readFileSync(filePath, "utf-8");

  for (const key in vars) {
    html = html.replaceAll(`{{${key}}}`, vars[key]);
  }

  return html;
}
