## This script only works when invocated where it stands...
cd "$(dirname "$0")" || exit

mkdir dist
cd dist
#git clone https://github.com/sophiaab/itowns.git
#git clone https://github.com/jailln/itowns.git
git clone https://github.com/itowns/itowns.git
cd itowns
git checkout example_fix_747
npm install
npm pack
cd ..
cd ..
npm install dist/itowns/itowns-2.2.0.tgz
npm install
### The following is only needed in server mode (since in devel mode
# npm start already takes care of that stage).
npm run build
