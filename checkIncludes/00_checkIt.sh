#!/bin/sh

RESULTS=results.txt
date > $RESULTS
echo "" >> $RESULTS

# Check bootstrap-vue-icons.js 2.15.0 (not used atm)
SOURCE=https://unpkg.com/bootstrap-vue@2.15.0/dist/bootstrap-vue-icons.js
SOURCETEMP=bootstrap-vue-icons.js_2.15.0
INSTALLED=../docs/js/bootstrap-vue-icons.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
fi
rm $SOURCETEMP
echo "" >> $RESULTS

# Check bootstrap-vue-icons.min.js 2.15.0
SOURCE=https://unpkg.com/bootstrap-vue@2.15.0/dist/bootstrap-vue-icons.min.js
SOURCETEMP=bootstrap-vue-icons.min.js_2.15.0
INSTALLED=../docs/js/bootstrap-vue-icons.min.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
fi
rm $SOURCETEMP
echo "" >> $RESULTS

# Check bootstrap-vue.js 2.15.0 (not used atm)
SOURCE=https://unpkg.com/bootstrap-vue@2.15.0/dist/bootstrap-vue.js
SOURCETEMP=bootstrap-vue.js_2.15.0
INSTALLED=../docs/js/bootstrap-vue.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
fi
rm $SOURCETEMP
echo "" >> $RESULTS

# Check bootstrap-vue.min.js 2.15.0
SOURCE=https://unpkg.com/bootstrap-vue@2.15.0/dist/bootstrap-vue.min.js
SOURCETEMP=bootstrap-vue.min.js_2.15.0
INSTALLED=../docs/js/bootstrap-vue.min.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
fi
rm $SOURCETEMP
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
fi
rm $SOURCETEMP
echo "" >> $RESULTS

# Check moment.min.js
SOURCE=https://unpkg.com/moment@2.24.0/min/moment.min.js
SOURCETEMP=moment.min.js_2.24.0
INSTALLED=../docs/js/moment.min.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
fi
rm $SOURCETEMP
echo "" >> $RESULTS

# Check vue-router.js 3.2.0 (not used atm)
SOURCE=https://unpkg.com/vue-router@3.2.0/dist/vue-router.js
SOURCETEMP=vue-router.js_3.2.0
INSTALLED=../docs/js/vue-router.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
fi
rm $SOURCETEMP
echo "" >> $RESULTS

# Check vue-router.min.js 3.2.0
SOURCE=https://unpkg.com/vue-router@3.2.0/dist/vue-router.min.js
SOURCETEMP=vue-router.min.js_3.2.0
INSTALLED=../docs/js/vue-router.min.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
fi
rm $SOURCETEMP
echo "" >> $RESULTS

# Check vue.js 2.6.11
SOURCE=https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.js
SOURCETEMP=vue.js_2_6_11
INSTALLED=../docs/js/vue.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
fi
rm $SOURCETEMP
echo "" >> $RESULTS

# Check vue.min.js 2.6.11 (not used atm)
SOURCE=https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.min.js
SOURCETEMP=vue.min.js_2_6_11
INSTALLED=../docs/js/vue.min.js
echo "Checking installed ${INSTALLED} vs ${SOURCE}" >> $RESULTS
wget $SOURCE -O $SOURCETEMP
echo "- shasum -a 256 ${INSTALLED} ${SOURCETEMP}" >> $RESULTS
shasum -a 256 ${INSTALLED} ${SOURCETEMP} | sed 's/^/  - /' >> $RESULTS
if diff $SOURCETEMP $INSTALLED >& /dev/null; then
    echo "- Installed ${INSTALLED} is identical to ${SOURCE}" >> $RESULTS
else
    echo "- Installed ${INSTALLED} differs from ${SOURCE}" >> $RESULTS
fi
rm $SOURCETEMP

echo "\nNote: ../docs/js/vuex-router-sync is a snippet of code see https://stackoverflow.com/questions/44171210/what-is-vuex-router-sync-for\n" >> $RESULTS

# Check vuex.js
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
fi
rm $SOURCETEMP
echo "" >> $RESULTS

cat $RESULTS
