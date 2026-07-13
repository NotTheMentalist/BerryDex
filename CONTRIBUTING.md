# Contributing to BerryDex

Thanks for helping fill out the BerryDex! The two most useful contributions are
**recipes** and **better real-world fruit identifications** — several berries are
marked "Uncertain — suggestions welcome!" in their files.

## What belongs here

**Entrées and hors d'oeuvres — not desserts.** Fruit in a pie is expected;
fruit in the main course is the whole point. Orange in a chipotle pork
marinade, apple in mulligatawny, grapes roasted alongside chicken: that's the
register we're after. Sweets are a fine thing and there are a million sites
for them.

Recipes are also *made*, not just collected. If one sounds good, the maintainer
will likely cook it and report back — see **Made in the kitchen** below. That's
a bonus, not a bar: your recipe goes up either way.

Recipes whose name ends in **"(Sample Recipe)"** were AI-generated to
demonstrate the format, not vouched for by a human cook. They're fair game:
if you've made something better for that fruit, feel free to replace one
outright — and if you've actually cooked a sample recipe and it holds up,
a PR simply dropping the marker (with a note in the description) is a
welcome contribution too.

## Made in the kitchen

When a recipe here has actually been cooked, it grows a `confirmed:` block and
the site shows a "Made in the BerryDex kitchen" badge with the verdict:

```yaml
confirmed:
  date: 2026-07-13
  verdict: "Cut the sugar by half; a six-hour marinade was plenty."
```

This is purely additive. A recipe **without** the block isn't flagged, doubted,
or marked as lesser anywhere on the site — it's simply a recipe, like any other.
The badge only means someone stood at a stove and has opinions.

## Where the data lives

- Every **berry** is a YAML file in [`berries/`](berries/) (number, name,
  sprite, real-world fruit, name origin, in-game effect):

  ```yaml
  number: 41
  name: Chople
  sprite: images/berries/chople-berry.png
  fruit: "Chile pepper"
  name_origin: "From “chipotle”."
  effect: "Halves the damage of a super-effective Fighting-type move."
  ```
- Every **recipe** is its own YAML file in [`recipes/`](recipes/), and lists
  which berries it belongs to. One recipe can span several berries — a
  pineapple upside-down cake is a Pinap *and* Cheri recipe.

## Adding a recipe

1. Create a new file in `recipes/`, named after the dish
   (e.g. `recipes/mango-sticky-rice.yaml`). You never need to touch the
   berry files.
2. Only `name`, `link`, and `berries` are required:

   ```yaml
   name: Mango Sticky Rice
   link: https://example.com/mango-sticky-rice
   berries: [mago]      # berry filenames from berries/, e.g. [pinap, cheri]
   notes: "Optional: any tips, substitutions, or commentary."   # optional
   photo: "https://example.com/photo.jpg"                       # optional
   contributed_by: "your name, handle, or shout-out"            # optional
   ```

   `contributed_by` is your spot to take credit — a plain string, or a
   name + URL if you'd like it linked:

   ```yaml
   contributed_by:
     name: YourHandle
     url: https://github.com/YourHandle
   ```

3. Recipes should be for the berries' **real-world fruit equivalents**.
4. Open a pull request — the build checks your file and will tell you if a
   berry slug is misspelled. If editing YAML isn't your thing, just
   [open an issue](../../issues/new) with the recipe name and link and someone
   will add it.

## Fixing a berry: fruit, name origin, or in-game effect

Edit the berry's file in `berries/` — no new files needed:

- `fruit:` and `name_origin:` — the real-world fruit and where the (mis)spelling
  or anagram comes from. Several berries say "Uncertain — suggestions welcome!";
  please include your reasoning in the PR or issue (Bulbapedia's name-origin
  sections are a good source).
- `effect:` — what the berry does in the games. These follow Generation III–IV
  behavior; corrections and clarifications for later generations are welcome.

## Previewing locally

```sh
npm install
node build.js
# open dist/index.html in a browser
```

The site rebuilds and deploys automatically when a PR is merged to `main`.
