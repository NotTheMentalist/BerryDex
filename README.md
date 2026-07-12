# 🍒 BerryDex

A static catalog of all 64 mainline Pokémon berries — number, name, in-game
sprite, the real-world fruit each name is (mis)spelled or anagrammed from, and
community-contributed recipes for cooking with the real thing.

**Add a recipe!** Every berry is one small YAML file in [`berries/`](berries/) —
see [CONTRIBUTING.md](CONTRIBUTING.md). No YAML skills required: opening an
issue with a recipe name + link works too.

## How it works

- `berries/*.yaml` — one file per berry (the entire dataset)
- `images/berries/` — item sprites from [PokéAPI/sprites](https://github.com/PokeAPI/sprites)
- `build.js` — generates the site into `dist/`
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
