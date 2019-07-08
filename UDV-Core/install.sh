## This script only works when invocated where it stands...
cd "$(dirname "$0")" || exit

mkdir dist
pushd dist
git clone https://github.com/Crejak/itowns.git
pushd itowns
git checkout fix/material
npm install
# The following command was automatically launched by 'npm install' as the
# 'prepublish' script. However, Itowns moved this command  to the 
# 'prepublishOnly' script which is only launched before 'npm publish'. 
# More infos: https://docs.npmjs.com/misc/scripts
npm run build && npm run transpile 
npm pack
popd
popd
# Installs the tarball produced by `npm pack`.
npm install dist/itowns/itowns-2.12.0.tgz
npm install
### The following is only needed in server mode (since in devel mode
# npm start already takes care of that stage).
npm run build
