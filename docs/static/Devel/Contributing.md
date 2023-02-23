# Contributing

- [Contributing](#contributing)
  - [Coding style (Linter)](#coding-style-linter)
  - [Submitting an issue](#submitting-an-issue)
  - [Submiting Pull Request (PR)](#submiting-pull-request-pr)
    - [Prior to PR-submission](#prior-to-pr-submission)
    - [PR Submission](#pr-submission)

## Coding style (Linter)

The JavaScript files coding style is defined with [eslint](https://eslint.org/) through the [.eslintrc.js configuration file](/.eslintrc.js).
It can be checked (e.g. prior to a commit) with the `npm run eslint` command.
Notice that UD-Viz coding style uses a unix `linebreak-style` (aka `LF` as newline character).

## Submitting an issue

- Create an issue with explicit name and a description
- Add at least one label of task category, priority and related component (package, widget...)
- If it's a bug report add steps to reproduce.

## Submiting Pull Request (PR)

### Prior to PR-submission

- Commit (`git commit`) with representative messages (commit messages end-up collected in the PR message and eventually release explanations).
- Make sure your code is mature for a review.
- `git rebase origin/master`, in order to resolve merge conflicts to master. Doc : [git-rebase](https://git-scm.com/docs/git-rebase). If you are not able to resolve all of the conflicts of your rebase, please open a new [discussion](https://github.com/VCityTeam/UD-Viz/discussions).
- `npm run assert-code` must finish with no errors.
- `npm audit` must finish without vulnerabilities higher than _low_.

⚠️ When your PR is open each push on your branch will trigger Travis CI jobs.

> `npm run assert-code` will `npm run eslint` and `npm run test`. Also ran by CI. See [here](../../../Readme.md#npm-scripts) for more information.

Before submitting a pull request, and because [UD-Viz still misses some tests](https://github.com/VCityTeam/UD-SV/issues/34),
**non-regression testing must be done manually**.
A developer must thus at least check that all the
[demo examples](/packages/browser/examples/)
(they should function similar to [their online deployment](https://ud-viz.vcityliris.data.alpha.grandlyon.com/)) are still effective.

> Note that you should interact with ui (user interface) for complete tests.

### PR Submission

Once your PR is ready to be submitted here are the steps to follow:

- Create a PR via the Github interface
- Describe synthetically the PR via the title and the description
- Add labels if necessary
- Link the related issues. (The linked issues are automatically closed when the PR is rebased and merged)
- Add one or more reviewers.
- Iterate over potential change requests until the PR is approved.
- Click on `Rebase and merge` button
- Delete the branch
