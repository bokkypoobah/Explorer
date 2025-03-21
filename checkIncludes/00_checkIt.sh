#!/bin/sh

RESULTS=results.txt
date > $RESULTS
echo "" >> $RESULTS

# Check Dexie
SOURCE=https://unpkg.com/dexie@3.0.3/dist/dexie.js
SOURCETEMP=dexie.js_3.0.3
INSTALLED=../docs/js/dexie.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
    # diff $SOURCETEMP $INSTALLED >> $RESULTS
fi
rm $SOURCETEMP
echo "" >> $RESULTS

# Check moment.js
SOURCE=https://unpkg.com/moment@2.24.0
SOURCETEMP=moment.js_2.24.0
INSTALLED=../docs/js/moment.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
    # diff $SOURCETEMP $INSTALLED >> $RESULTS
fi
rm $SOURCETEMP
echo "" >> $RESULTS

# Check vuex.min.js
SOURCE=https://unpkg.com/vuex@3.6.2/dist/vuex.js
SOURCETEMP=vuex.js_3.6.2
INSTALLED=../docs/js/vuex.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
    # diff $SOURCETEMP $INSTALLED >> $RESULTS
fi
rm $SOURCETEMP
echo "" >> $RESULTS

# Check vuex.min.js (not used atm)
SOURCE=https://unpkg.com/vuex@3.6.2/dist/vuex.min.js
SOURCETEMP=vuex.min.js_3.6.2
INSTALLED=../docs/js/vuex.min.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
    # diff $SOURCETEMP $INSTALLED >> $RESULTS
fi
rm $SOURCETEMP
echo "" >> $RESULTS

# Check ethers.js
SOURCE=https://cdnjs.cloudflare.com/ajax/libs/ethers/5.8.0/ethers.umd.min.js
SOURCETEMP=ethers-5.8.0.umd.min.js
INSTALLED=../docs/js/ethers-5.8.0.umd.min.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
    # diff $SOURCETEMP $INSTALLED >> $RESULTS
fi
rm $SOURCETEMP

cat $RESULTS
