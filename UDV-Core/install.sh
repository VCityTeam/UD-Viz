## This script only works when invocated where it stands...
cd "$(dirname "$0")" || exit

mkdir dist
pushd dist
git clone https://github.com/iTowns/itowns.git
# Checkout to a specific commit which is currently after the last iTowns 
# release to have a recent 3D Tiles feature (onTileContentLoaded)
git checkout bb44243799bc76f7e133e55fea8525743436674b
pushd itowns
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
npm install dist/itowns/itowns-2.13.1.tgz
npm install
### The following is only needed in server mode (since in devel mode
# npm start already takes care of that stage).
npm run build
