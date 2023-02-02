# Contributing
- [Contributing](#contributing)
  - [Coding style (Linter)](#coding-style-linter)
  - [Submitting an issue](#submitting-an-issue)
  - [Submiting Pull Request (PR)](#submiting-pull-request-pr)
    - [Prior to PR-submission : assert coding style and build](#prior-to-pr-submission--assert-coding-style-and-build)
    - [PR Submission](#pr-submission)

## Coding style (Linter)

The JavaScript files coding style is defined with [eslint](https://eslint.org/) through the [.eslintrc.js configuration file](.eslintrc.js).
It can be checked (e.g. prior to a commit) with the `npm run eslint` command.
Notice that UD-Viz coding style uses a unix `linebreak-style` (aka `LF` as newline character).

## Submitting an issue

- Create an issue with explicit name and a description
- Put labels:
  - At least one of task category, priority and component related (package, widget...)  
- If it's a bug report add step to reproduce.


## Submiting Pull Request (PR) 

### Prior to PR-submission : assert coding style and build

- Commit (`git commit`) with representative messages (commit messages end-up collected in the PR message and eventually release explanations).
- Make sure your code is mature for a review.  
- `npm run assert-code` must end up with no error.
- `npm audit` without vulnerabilities higher than *low*.


⚠️ When your PR is open each push on your branch will trigger Travis CI jobs.

> `npm run assert-code` Run `npm run eslint` and `npm run test`. Also ran by CI. See [here](./Readme.md#continuous-integration-travis-ci) for more information. 

Before submitting a pull request, and because [UD-Viz still misses some tests](https://github.com/VCityTeam/UD-SV/issues/34),
**non-regression testing must be done manually**.
A developer must thus at least check that all the
[demo examples](https://github.com/VCityTeam/UD-Viz/tree/master/examples)
(refer to [their online deployment](https://ud-viz.vcityliris.data.alpha.grandlyon.com/)) are still effective.
> Note that you should interact with ui (user interface) for complete test. 
### PR Submission

When creating a PR make sure to provide a correct description and labels.

