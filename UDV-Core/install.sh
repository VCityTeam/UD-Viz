## This script only works when invocated where it stands...
cd "$(dirname "$0")" || exit

mkdir dist
pushd dist
git clone https://github.com/jailln/itowns.git
pushd itowns
git checkout 3dtiles-temporal
npm install
npm pack
popd
popd
npm install dist/itowns/itowns-2.2.0.tgz
npm install
