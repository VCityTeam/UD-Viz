## Release creation process

1. Create a new branch for the release, e.g. `release-x.x.x` from the `master` branch.
2. Change the monorepo version `npm run pre-publish x.x.x`. It will change the version in all package.json and generate a Changelog file with all commits' names since the last release. (See the script [here](../../bin/prePublish.js)) 
3. Pick relevant commit message in ./docs/static/ChangelogDiff.txt to put them in ./docs/static/Changelog.md (Reformulate if necessary)
4. Run `npm run docs`
5. Follow the [prior PR submission](./Contributing.md#prior-to-pr-submission)
6. Push your branch to the main repository (This branch will be used to create the release tag)
7. Create a PR
8. Assign yourself to the PR
9. Have a reviewer approve your PR
10. Create a github release (through the GUI)
    - copy the new content given in [`Changelog.md`](https://github.com/VCityTeam/UD-Viz/blob/master/docs/static/Changelog.md) : this duplication doesn't seem to be [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) but the Release comments are hosted by github (and will be lost if you migrate to e.g. gitlab) and are not browsable offline.
    - you might consider using the "Auto-generate release notes" feature
    - note that creating a github release creates an underlying git tag (which can previously be created with a [git tag](https://stackoverflow.com/questions/38675829/how-to-create-releases-for-public-or-private-repository-in-github))

## Publish the package

In order to publish the package to [npmjs](https://www.npmjs.com/) package repository

1. Authenticate on npmjs with `npm login` and use the vcity account together with proper credentials.
   Note: because the npmjs authentication mode of the `vcity`account is currently configured to [One-Time-Password (OTP) over email](https://docs.npmjs.com/receiving-a-one-time-password-over-email) you will need to be part of the `vcity@liris.cnrs.fr` email alias forwarder to receive the OTP and be patient about it (the reception delay can be up to a couple minutes).
1. `npm publish --workspaces --access=public`
