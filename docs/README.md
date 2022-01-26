## Documentation

This documentation is generated using [JSDOC](https://jsdoc.app/) and [Clean-Jsdoc-Theme](https://github.com/ankitskvmdam/clean-jsdoc-theme).

To generate the documentation : 

```bash
git clone https://github.com/VCityTeam/UD-Viz.git
cd UD-Viz
npm install
npm run docs
```

The produced documentation should be in the Docs/html repository.

## Tips 

- The static files (in the static directory) are meant to be put in the [static](./static) directory.

- Markdown file next to code are not generated for now

- This file is considered as the entry point for github pages : there is a redirection to the index.html file at the end.


<script>window.onload = function() {
    location.href = "./html/index.html";
}</script>
