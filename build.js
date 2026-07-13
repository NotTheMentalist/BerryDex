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
<div class="pokedex">
  <header>
    <div class="lens-row">
      <div class="lens"></div>
      <div class="leds"><span class="led led-red"></span><span class="led led-yellow"></span><span class="led led-green"></span></div>
    </div>
    <a class="home" href="${base}index.html"><h1>BerryDex</h1></a>
    <p class="tagline">Pok&eacute;mon berries, their real-world fruits, and things to cook with them</p>
  </header>
  <div class="hinge"></div>
  <main class="screen-bezel">
    <div class="plaque">
      <p class="plaque-label">DOT MATRIX WITH BERRY FLAVOR</p>
      <div class="plaque-battery"><span class="battery-led"></span><span class="battery-text">BATTERY</span></div>
      <div class="screen">
${body}
      </div>
    </div>
    <div class="bezel-foot"><span class="led led-red big"></span><span class="speaker"></span></div>
  </main>
  <footer>
    <p>Data lives in plain YAML files — <a href="https://github.com/NotTheMentalist/BerryDex">source and issues on GitHub</a>. Suggest a recipe or a better berry name!</p>
    <p>Sprites &copy; Nintendo / Game Freak, via <a href="https://github.com/PokeAPI/sprites">Pok&eacute;API</a>. Fan project, not affiliated.</p>
  </footer>
</div>
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
    <span class="num">#${String(b.number).padStart(3, "0")}</span>
    <span class="name">${esc(b.name)}</span>
    <span class="fruit">${esc(b.fruit)}</span>
    <span class="count${b.recipes.length ? " has-recipes" : ""}">${recipeCount(b)}</span>
  </a>`
    )
    .join("\n");
  return page({
    title: "BerryDex",
    body: `<p class="cta-row"><a class="cta" href="contribute.html">I want to submit a recipe!</a></p>
<div class="grid">
${cards}
</div>`,
  });
}

const REPO = "https://github.com/NotTheMentalist/BerryDex";

function contributePage() {
  // No trailing comments: whatever is here ends up verbatim in the
  // contributor's committed file, and the hints outlive their usefulness.
  const template = `name: Mango Sticky Rice
link: https://example.com/mango-sticky-rice
berries: [mago]
notes: "Optional: tips, substitutions, or commentary."
contributed_by: "your name, handle, or shout-out"`;
  const newFileUrl =
    `${REPO}/new/main/recipes?filename=my-recipe.yaml&value=` +
    encodeURIComponent(template);
  const issueUrl =
    `${REPO}/issues/new?title=` +
    encodeURIComponent("Recipe suggestion: ") +
    `&body=` +
    encodeURIComponent(
      "**Recipe name:**\n\n**Link:**\n\n**Which berries (real-world fruits) does it use?**\n\n**Notes (optional):**\n\n**How you want to be credited (optional):**\n"
    );

  return page({
    title: "Submit a recipe — BerryDex",
    body: `<article class="contribute">
  <h2>Submit a recipe</h2>
  <p>Every recipe on this site is a tiny text file in the
  <a href="${REPO}/tree/main/recipes">recipes/</a> folder, which means anyone
  with a GitHub account can add one.</p>
  <p><strong>Entr&eacute;es and hors d'oeuvres — not desserts.</strong> The
  whole point is fruit turning up somewhere surprising: pork loin, not pie.
  Pick your comfort level:</p>

  <h3>Level 1 — just tell us about it</h3>
  <p>No Git, no YAML, no fuss: <a href="${issueUrl}">open an issue</a> with the
  recipe name and link, and someone will add it for you (and credit you).</p>

  <h3>Level 2 — GitHub's web editor</h3>
  <p><a href="${newFileUrl}">Click here to start a new recipe file</a> —
  GitHub opens its in-browser editor with a template already filled in:</p>
  <pre><code>${esc(template)}</code></pre>
  <ol>
    <li>Rename the file after your dish (keep the <code>.yaml</code> ending).</li>
    <li>Fill in the fields. Only <code>name</code>, <code>link</code>, and
        <code>berries</code> are required. <code>berries</code> takes the
        filenames from <a href="${REPO}/tree/main/berries">berries/</a> —
        <code>[mago]</code> for one, <code>[pinap, cheri]</code> if the dish
        uses both.</li>
    <li>Hit <strong>Commit changes&hellip;</strong> — GitHub will fork the
        project and open a pull request for you automatically. That's it.</li>
  </ol>
  <p>You can also fix typos or improve a berry's real-world fruit guess the
  same way: browse to any file in
  <a href="${REPO}/tree/main/berries">berries/</a> and press the pencil icon.
  GitHub Desktop works too, if that's more your speed.</p>

  <h3>Level 3 — iykyk</h3>
  <p>Clone, branch, add your file under <code>recipes/</code>, and open a PR.
  <code>node build.js</code> validates your file locally; CI runs the same
  check on the PR, so a misspelled berry slug gets caught with a readable
  error. See <a href="${REPO}/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</a>
  for the full format, including linked credits
  (<code>contributed_by: {name, url}</code>) and photos.</p>
</article>
<p class="back"><a href="index.html">&larr; All berries</a></p>`,
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
          // Purely additive: a recipe nobody has cooked yet is just a recipe,
          // so an absent `confirmed:` block renders nothing at all.
          if (r.confirmed) {
            const c = r.confirmed === true ? {} : r.confirmed;
            const when = c.date ? ` <span class="cooked-date">${esc(c.date)}</span>` : "";
            li += `\n    <p class="cooked"><span class="cooked-badge">&#10003; Made in the BerryDex kitchen</span>${when}</p>`;
            if (c.verdict) li += `\n    <p class="verdict">${esc(c.verdict)}</p>`;
          }
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
      <h2><span class="num">#${String(b.number).padStart(3, "0")}</span> ${esc(b.name)} Berry</h2>
      <p class="fruit-line">Real-world equivalent: <strong>${esc(b.fruit)}</strong></p>
      ${b.name_origin ? `<p class="origin">${esc(b.name_origin)}</p>` : ""}
    </div>
  </div>
  ${
    b.effect
      ? `<p class="effect"><span class="effect-tag">In-game effect</span> ${esc(b.effect)}</p>`
      : ""
  }
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
fs.writeFileSync(path.join(DIST, "contribute.html"), contributePage());
for (const b of berries) {
  fs.writeFileSync(path.join(DIST, "berry", `${b.slug}.html`), berryPage(b));
}
fs.copyFileSync(path.join(ROOT, "static", "style.css"), path.join(DIST, "style.css"));
fs.cpSync(path.join(ROOT, "images"), path.join(DIST, "images"), { recursive: true });

console.log(`Built ${berries.length} berries → dist/`);
