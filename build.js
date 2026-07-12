#!/usr/bin/env node
// BerryDex build script: reads berries/*.yaml and writes a static site to dist/.
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadDir(dir) {
  return fs
    .readdirSync(path.join(ROOT, dir))
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map((f) => {
      const data = yaml.load(fs.readFileSync(path.join(ROOT, dir, f), "utf8"));
      data.slug = path.basename(f).replace(/\.ya?ml$/, "");
      return data;
    });
}

// Loads berries and recipes, validates recipe files, and attaches each recipe
// to every berry it references. Validation failures exit non-zero so a bad PR
// fails CI with a readable message instead of silently dropping the recipe.
function loadData() {
  const berries = loadDir("berries").sort((a, b) => a.number - b.number);
  const bySlug = new Map(berries.map((b) => [b.slug, b]));
  for (const b of berries) b.recipes = [];

  const errors = [];
  for (const r of loadDir("recipes")) {
    if (!r.name) errors.push(`recipes/${r.slug}.yaml: missing "name"`);
    if (!r.link) errors.push(`recipes/${r.slug}.yaml: missing "link"`);
    if (!Array.isArray(r.berries) || r.berries.length === 0) {
      errors.push(`recipes/${r.slug}.yaml: "berries" must list at least one berry slug`);
      continue;
    }
    for (const slug of r.berries) {
      const berry = bySlug.get(slug);
      if (!berry) {
        errors.push(
          `recipes/${r.slug}.yaml: unknown berry "${slug}" (use the berry's filename from berries/, e.g. "cheri")`
        );
      } else {
        berry.recipes.push(r);
      }
    }
  }
  if (errors.length) {
    console.error("Recipe validation failed:\n  " + errors.join("\n  "));
    process.exit(1);
  }
  return berries;
}

function page({ title, body, depth = 0 }) {
  const base = "../".repeat(depth);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<link rel="stylesheet" href="${base}style.css">
</head>
<body>
<header>
  <a class="home" href="${base}index.html"><h1>🍒 BerryDex</h1></a>
  <p class="tagline">Pok&eacute;mon berries, their real-world fruits, and things to cook with them</p>
</header>
<main>
${body}
</main>
<footer>
  <p>Data lives in plain YAML files — <a href="https://github.com/NotTheMentalist/BerryDex">suggest a recipe or berry name on GitHub</a>!</p>
  <p>Sprites &copy; Nintendo / Game Freak, via <a href="https://github.com/PokeAPI/sprites">Pok&eacute;API</a>. Fan project, not affiliated.</p>
</footer>
</body>
</html>`;
}

function recipeCount(b) {
  const n = b.recipes.length;
  return n === 0 ? "no recipes yet" : n === 1 ? "1 recipe" : `${n} recipes`;
}

function indexPage(berries) {
  const cards = berries
    .map(
      (b) => `  <a class="card" href="berry/${esc(b.slug)}.html">
    <img src="${esc(b.sprite)}" alt="${esc(b.name)} Berry sprite" width="48" height="48">
    <span class="num">#${String(b.number).padStart(2, "0")}</span>
    <span class="name">${esc(b.name)}</span>
    <span class="fruit">${esc(b.fruit)}</span>
    <span class="count${b.recipes.length ? " has-recipes" : ""}">${recipeCount(b)}</span>
  </a>`
    )
    .join("\n");
  return page({
    title: "BerryDex",
    body: `<div class="grid">\n${cards}\n</div>`,
  });
}

function berryPage(b) {
  const recipes = b.recipes.length
    ? `<ul class="recipes">\n${b.recipes
        .map((r) => {
          let li = `  <li>\n    <a class="recipe-link" href="${esc(r.link)}">${esc(r.name)}</a>`;
          const others = r.berries.filter((s) => s !== b.slug);
          if (others.length)
            li += `\n    <p class="also">Also uses: ${others
              .map((s) => `<a href="${esc(s)}.html">${esc(s[0].toUpperCase() + s.slice(1))} Berry</a>`)
              .join(", ")}</p>`;
          if (r.notes) li += `\n    <p class="notes">${esc(r.notes)}</p>`;
          if (r.contributed_by) {
            const c = r.contributed_by;
            const who =
              typeof c === "object" && c.url
                ? `<a href="${esc(c.url)}">${esc(c.name || c.url)}</a>`
                : esc(typeof c === "object" ? c.name : c);
            li += `\n    <p class="credit">Contributed by ${who}</p>`;
          }
          if (r.photo)
            li += `\n    <img class="recipe-photo" src="${esc(r.photo)}" alt="Photo for ${esc(r.name)}">`;
          return li + `\n  </li>`;
        })
        .join("\n")}\n</ul>`
    : `<p class="empty">No recipes yet for the ${esc(b.fruit)}. <a href="https://github.com/NotTheMentalist/BerryDex">Suggest one on GitHub!</a></p>`;

  return page({
    title: `${b.name} Berry — BerryDex`,
    depth: 1,
    body: `<article class="berry">
  <div class="berry-head">
    <img src="../${esc(b.sprite)}" alt="${esc(b.name)} Berry sprite" width="96" height="96">
    <div>
      <h2><span class="num">#${String(b.number).padStart(2, "0")}</span> ${esc(b.name)} Berry</h2>
      <p class="fruit-line">Real-world equivalent: <strong>${esc(b.fruit)}</strong></p>
      ${b.name_origin ? `<p class="origin">${esc(b.name_origin)}</p>` : ""}
    </div>
  </div>
  <h3>Recipes</h3>
  ${recipes}
</article>
<p class="back"><a href="../index.html">&larr; All berries</a></p>`,
  });
}

// --- build ---
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "berry"), { recursive: true });

const berries = loadData();
fs.writeFileSync(path.join(DIST, "index.html"), indexPage(berries));
for (const b of berries) {
  fs.writeFileSync(path.join(DIST, "berry", `${b.slug}.html`), berryPage(b));
}
fs.copyFileSync(path.join(ROOT, "static", "style.css"), path.join(DIST, "style.css"));
fs.cpSync(path.join(ROOT, "images"), path.join(DIST, "images"), { recursive: true });

console.log(`Built ${berries.length} berries → dist/`);
