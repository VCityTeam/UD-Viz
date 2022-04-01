## Release creation process

1.  Change the package version number :
    - edit the [`package.json file`](https://github.com/VCityTeam/UD-Viz/blob/master/package.json#L3) to change the "version" entry
      - Note: the usage [`npm version`](https://docs.npmjs.com/updating-your-published-package-version-number) should be discouraged at first because it seems to automatically realize a `git commit` and creates a corresponding `git commit` which can be confusing
    - edit the [`index.html file`](https://github.com/VCityTeam/UD-Viz/blob/master/index.html#L15) to change the version number.
1.  Remove package-lock.json, run an `npm install` and commit the updated package-lock.json
1.  Provide content to [`Changelog.md`](../Changelog.md) ([using a Changelog reference](https://softwareengineering.stackexchange.com/questions/83797/is-there-a-point-to-including-a-change-log-in-every-code-file-when-you-are-usi)):
    collecting this content out of git commit messages can be done with something similar to
    ` git log | grep -v ^commit | grep -v ^Author | grep -v ^Date | grep -vi merge | grep . | head -n 150 > ChangelogDiff.md`
1.  Update doc with `npm run docs`
1.  Follow the [process to push](https://github.com/VCityTeam/UD-Viz/blob/master/Readme.md#anchor-devel-pushing-process) the above changes
1.  Create the associated pull request using the following comment template and have it accepted
```
## Description


## PR Checklist
- [ ] Change the package version number :
    - edit the [`package.json file`](https://github.com/VCityTeam/UD-Viz/blob/master/package.json#L3) to change the "version" entry
      - Note: the usage [`npm version`](https://docs.npmjs.com/updating-your-published-package-version-number) should be discouraged at first because it seems to automatically realize a `git commit` and creates a corresponding `git commit` which can be confusing
    - edit the [`index.html file`](https://github.com/VCityTeam/UD-Viz/blob/master/index.html#L15) to change the version number.
- [ ] Remove package-lock.json, run an `npm install` and commit the updated package-lock.json
- [ ] Provide content to [`Changelog.md`](../Changelog.md) ([using a Changelog reference](https://softwareengineering.stackexchange.com/questions/83797/is-there-a-point-to-including-a-change-log-in-every-code-file-when-you-are-usi)):
    collecting this content out of git commit messages can be done with something similar to
    ` git log | grep -v ^commit | grep -v ^Author | grep -v ^Date | grep -vi merge | grep . | head -n 150 > ChangelogDiff.md`
- [ ] Update doc with `npm run docs`
- [ ] Follow the [process to push](https://github.com/VCityTeam/UD-Viz/blob/master/Readme.md#anchor-devel-pushing-process) the above changes
- [ ] Assign yourself to the PR
- [ ] Add a reviewer to the PR
```
7.  Create a github release (through the GUI)
    - copy the new content given in [`Changelog.md`](https://github.com/VCityTeam/UD-Viz/blob/master/Doc/Changelog.md) : this duplication doesn't seem to be [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) but the Release comments are hosted by github (and will be lost if you migrate to e.g. gitlab) and are not browsable offline.
    - you might consider using the "Auto-generate release notes" feature
    - note that creating a github release creates an underlying git tag (which can previously be created with a [git tag](https://stackoverflow.com/questions/38675829/how-to-create-releases-for-public-or-private-repository-in-github))

## Publish the package (optional)

In order to publish the package to [npmjs](https://www.npmjs.com/) package repository

1. Authenticate on npmjs with `npm login` and use the vcity account together with proper credentials.
   Note: because the npmjs authentication mode of the `vcity`account is currently configured to [One-Time-Password (OTP) over email](https://docs.npmjs.com/receiving-a-one-time-password-over-email) you will need to be part of the `vcity@liris.cnrs.fr` email alias forwarder to receive the OTP and be patient about it (the reception delay can be up to a couple minutes).
1. `npm publish`
