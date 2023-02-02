####

#### Prior to PR-submission<a name="anchor-devel-pushing-process"></a> 1: assert coding style and build

Before pushing (`git push`) to the origin repository please make sure to run

```bash
npm run travis
```

(or equivalently `npm run eslint` and `npm run build`) in order to assert that the coding style is correct (`eslint`) and that bundle (production) build (`webpack`) is still effective. When failing to do so the CI won't check.

Note that when committing (`git` commit`) you should make sure to provide representative messages because commit messages end-up collected in the PR message and eventually release explanations.

#### Coding style (Linter)

The JavaScript files coding style is defined with [eslint](https://eslint.org/) through the [.eslintrc.js configuration file](.eslintrc.js).
It can be checked (e.g. prior to a commit) with the `npm run eslint` command.
Notice that UD-Viz coding style uses a unix `linebreak-style` (aka `LF` as newline character).

### Prior to PR-submission<a name="anchor-devel-pushing-process"></a> 2: functional testing

Before submitting a pull request, and because [UD-Viz still misses some tests](https://github.com/VCityTeam/UD-SV/issues/34),
**non-regression testing must be done manually**.
A developer must thus at least) check that all the
[demo examples](https://github.com/VCityTeam/UD-Viz/tree/master/examples)
(refer to [their online deployment](https://ud-viz.vcityliris.data.alpha.grandlyon.com/)) are still effective.

#### PR Submission

When creating a PR (Pull Request) make sure to provide a correct description

| ├── node # UD-Viz Node-side framework
