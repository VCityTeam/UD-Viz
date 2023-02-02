# Documentation

This documentation is generated using [JSDOC](https://jsdoc.app/) and [Clean-Jsdoc-Theme](https://github.com/ankitskvmdam/clean-jsdoc-theme).

## Getting started

To **generate** the documentation :

```bash
git clone https://github.com/VCityTeam/UD-Viz.git
cd UD-Viz
npm install
npm run host # This command serve local doc at http://localhost:8000/docs/html/
npm run docs # Generate doc
```

The produced documentation should be in the docs/html repository.

> The latest released version is hosted by _Github Pages_ here : https://vcityteam.github.io/UD-Viz/html/index.html

## Contribute

To add static files (documentation not generated with sources), simply put in the [static](./static/) directory.

### Add documentation in sources

Refer to [JSDOC](https://jsdoc.app/) syntax. You can run `npm run dev-docs` command to regenerate documentation each time you change packages' sources.
