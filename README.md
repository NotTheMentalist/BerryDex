# 🍒 BerryDex

### **→ [notthementalist.github.io/BerryDex](https://notthementalist.github.io/BerryDex/) ←**

A static catalog of all 64 mainline Pokémon berries — number, name, in-game
sprite, in-game effect, the real-world fruit each name is (mis)spelled or
anagrammed from, and community-contributed recipes for cooking with the real
thing. Savory dishes where fruit turns up unexpectedly are the house specialty.

**Add a recipe!** Recipes are small YAML files in [`recipes/`](recipes/) —
see [CONTRIBUTING.md](CONTRIBUTING.md), or just use the site's
[submit-a-recipe page](https://notthementalist.github.io/BerryDex/contribute.html).
No YAML skills required: opening an issue with a recipe name + link works too.

## How it works

- `berries/*.yaml` — one file per berry (number, name, sprite, fruit, origin, effect)
- `recipes/*.yaml` — one file per recipe; each lists the berries it uses, so a
  dish can span several (a pineapple-and-cherry ham is a Pinap *and* Cheri recipe)
- `images/berries/` — item sprites from [PokéAPI/sprites](https://github.com/PokeAPI/sprites)
- `build.js` — generates the site into `dist/`, and fails the build if a recipe
  names a berry that doesn't exist
- `.github/workflows/deploy.yml` — builds and deploys to GitHub Pages on every push to `main`

## Local development

```sh
npm install
node build.js
# open dist/index.html
```

## Credits

Berry sprites © Nintendo / Game Freak, served via the PokéAPI sprites
repository. This is a fan project, not affiliated with or endorsed by Nintendo,
Game Freak, or The Pokémon Company.
