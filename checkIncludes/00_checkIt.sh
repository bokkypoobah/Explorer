#!/bin/sh

RESULTS=results.txt
date > $RESULTS

# Check Dexie
SOURCE=https://unpkg.com/dexie@3.0.3/dist/dexie.js
SOURCETEMP=dexie.js_3.0.3
INSTALLED=../docs/js/dexie.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
    # diff $SOURCETEMP $INSTALLED >> $RESULTS
fi
rm $SOURCETEMP

# Check moment.js
SOURCE=https://unpkg.com/moment@2.24.0
SOURCETEMP=moment.js_2.24.0
INSTALLED=../docs/js/moment.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
    # diff $SOURCETEMP $INSTALLED >> $RESULTS
fi
rm $SOURCETEMP

# Check vuex.js
SOURCE=https://unpkg.com/vuex@3.6.2/dist/vuex.js
SOURCETEMP=vuex.js_3.6.2
INSTALLED=../docs/js/vuex.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
    # diff $SOURCETEMP $INSTALLED >> $RESULTS
fi
rm $SOURCETEMP

cat $RESULTS
