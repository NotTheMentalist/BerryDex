# Contributing to BerryDex

Thanks for helping fill out the BerryDex! The two most useful contributions are
**recipes** and **better real-world fruit identifications** — several berries are
marked "Uncertain — suggestions welcome!" in their files.

## Where the data lives

- Every **berry** is a YAML file in [`berries/`](berries/) (number, name,
  sprite, real-world fruit, name origin).
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

## Suggesting a fruit identification or name origin

Update the `fruit:` and `name_origin:` fields, and please include your reasoning
in the PR/issue (Bulbapedia's name-origin sections are a good source).

## Previewing locally

```sh
npm install
node build.js
# open dist/index.html in a browser
```

The site rebuilds and deploys automatically when a PR is merged to `main`.
