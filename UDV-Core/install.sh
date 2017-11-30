## This script only works when invocated where it stands...
cd "$(dirname "$0")" || exit

mkdir dist
cd dist
git clone https://github.com/jailln/itowns.git
cd itowns
git checkout 3dtiles-temporal
npm install
