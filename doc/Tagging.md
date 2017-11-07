### Numbering
They are already too many version numbers:
 - the master UDV-Core package version number that is locate in `UDV-Core/package.json` (look for the "version" key).
 - the [git tags](https://github.com/MEPP-team/UDV/tags)
 - the "info" field of `UDV-Core/examples/Demo.html` that should not mention any version "number/tag" (since there is no reason to distinguish it from the one of the package).
 - the "info" field of `UDV-Core/examples/Vilo3D/index.html` that refers to the [git tags](https://github.com/MEPP-team/UDV/tags) Vilo3D-Demo-1.0, Vilo3D-Demo-1.1 since Vilo3d development is currently frozen.

### Tagging process
From your local repository (the one on your desktop), proceed with the [tagging process at the git level](https://git-scm.com/book/en/v2/Git-Basics-Tagging) 
  - `git remote -v` command describes the situation in which you should now be, which should be similar to
     ```
       origin        https://github.com/<yourGithubLogin>/UDV.git (fetch)
       origin        https://github.com/<yourGithubLogin>/UDV.git (push)
       upstream https://github.com/MEPP-team/UDV.git (fetch)
       upstream https://github.com/MEPP-team/UDV.git (push)
     ```  
  -  `git log` command will enable you to make sure that your `VERSION_SHA1` is indeed present in the log list (it should be the top entry if you didn't do push other commits in between)
  - `git tag -a <version_number> VERSION_SHA1` command tags the version on your local repository (e.g. `git tag -a v0.4.0 d5304fb5c8e`): provide some message when asked (for example use the version number as message).
  -  `git push origin --tags` command pushes the new tag to your forked repository. Note that tags don't get "pushed" with other commits and you do need to push tags separately. You should now see this new tag:
     * with the `git ls-remote --tags` on the command line or
     * on the release entry on your forked repository on github (`releases` appears on the right side of the `commit` button).
  - `git push upstream --tags`eventually pushes the tag on the master repository which you should be able to assert:
     * `git ls-remote --tags https://github.com/MEPP-team/UDV.git` on the command line
     * on the [releases page](https://github.com/MEPP-team/UDV/releases) of the original project on github
