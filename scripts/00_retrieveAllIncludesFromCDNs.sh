#!/bin/sh

# Get vue[.prod].js 3.5.13
SOURCE=https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.js
# SOURCE=https://unpkg.com/vue@3.5.13/dist/vue.global.js
DEST=../docs/js/vue_3.5.13.js
wget $SOURCE -O $DEST
SOURCE=https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.prod.js
# SOURCE=https://unpkg.com/vue@3.5.13/dist/vue.global.prod.js
DEST=../docs/js/vue_3.5.13.prod.js
wget $SOURCE -O $DEST

# Get vuex[.min].js 4.1.0
SOURCE=https://cdn.jsdelivr.net/npm/vuex@4.1.0/dist/vuex.global.js
DEST=../docs/js/vuex_4.1.0.js
wget $SOURCE -O $DEST
SOURCE=https://cdn.jsdelivr.net/npm/vuex@4.1.0/dist/vuex.global.min.js
DEST=../docs/js/vuex_4.1.0.min.js
wget $SOURCE -O $DEST

# Get vue-router[.min].js 4.5.0
SOURCE=https://cdn.jsdelivr.net/npm/vue-router@4.5.0/dist/vue-router.global.js
DEST=../docs/js/vue-router_4.5.0.js
wget $SOURCE -O $DEST
SOURCE=https://cdn.jsdelivr.net/npm/vue-router@4.5.0/dist/vue-router.global.min.js
DEST=../docs/js/vuex_4.5.0.min.js
wget $SOURCE -O $DEST

# Get vuetify[.min].css 3.7.18
SOURCE=https://cdn.jsdelivr.net/npm/vuetify@3.7.18/dist/vuetify.css
DEST=../docs/css/vuetify_3.7.18.css
wget $SOURCE -O $DEST
SOURCE=https://cdn.jsdelivr.net/npm/vuetify@3.7.18/dist/vuetify.min.css
DEST=../docs/css/vuetify_3.7.18.min.css
wget $SOURCE -O $DEST

# Get vuetify[.min].js 3.7.18
SOURCE=https://cdn.jsdelivr.net/npm/vuetify@3.7.18/dist/vuetify.js
DEST=../docs/js/vuetify_3.7.18.js
wget $SOURCE -O $DEST
SOURCE=https://cdn.jsdelivr.net/npm/vuetify@3.7.18/dist/vuetify.min.js
DEST=../docs/js/vuetify_3.7.18.min.js
wget $SOURCE -O $DEST

# Get dexie[.min].js 3.0.3
# SOURCE=https://unpkg.com/dexie@3.0.3/dist/dexie.js
SOURCE=https://cdn.jsdelivr.net/npm/dexie@3.0.3/dist/dexie.js
DEST=../docs/js/dexie_3.0.3.js
wget $SOURCE -O $DEST
# SOURCE=https://unpkg.com/dexie@3.0.3/dist/dexie.min.js
SOURCE=https://cdn.jsdelivr.net/npm/dexie@3.0.3/dist/dexie.min.js
DEST=../docs/js/dexie_3.0.3.min.js
wget $SOURCE -O $DEST

# Get ethers[.min].js 5.8.0
SOURCE=https://cdnjs.cloudflare.com/ajax/libs/ethers/5.8.0/ethers.umd.js
DEST=../docs/js/ethers_5.8.0.umd.js
wget $SOURCE -O $DEST
SOURCE=https://cdnjs.cloudflare.com/ajax/libs/ethers/5.8.0/ethers.umd.min.js
DEST=../docs/js/ethers_5.8.0.umd.min.js
wget $SOURCE -O $DEST

# Get moment[.min].js 2.24.0
SOURCE=https://cdn.jsdelivr.net/npm/moment@2.24.0/moment.js
DEST=../docs/js/moment_2.24.0.js
wget $SOURCE -O $DEST
SOURCE=https://cdn.jsdelivr.net/npm/moment@2.24.0/min/moment.min.js
DEST=../docs/js/moment_2.24.0.min.js
wget $SOURCE -O $DEST

# Get materialdesignicons[.min].css 7.4.47
SOURCE=https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/7.4.47/css/materialdesignicons.css
DEST=../docs/css/materialdesignicons_7.4.47.css
wget $SOURCE -O $DEST
SOURCE=https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/7.4.47/css/materialdesignicons.min.css
DEST=../docs/css/materialdesignicons_7.4.47.min.css
wget $SOURCE -O $DEST

# Get materialdesignicons-webfont.woff2 7.4.47
SOURCE=https://cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/7.4.47/fonts/materialdesignicons-webfont.woff2
DEST=../docs/fonts/materialdesignicons-webfont.woff2
wget $SOURCE -O $DEST

# Get prism[.min].css 1.24.1
SOURCE=https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.css
DEST=../docs/css/prism_1.24.1.css
wget $SOURCE -O $DEST
SOURCE=https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.min.css
DEST=../docs/css/prism_1.24.1.min.css
wget $SOURCE -O $DEST

# Get prism[.min].js 1.24.1
SOURCE=https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/prism.js
DEST=../docs/js/prism_1.24.1.js
wget $SOURCE -O $DEST
SOURCE=https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/prism.min.js
DEST=../docs/js/prism_1.24.1.min.js
wget $SOURCE -O $DEST

# Get prism-solidity[.min].js 1.24.1
SOURCE=https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-solidity.js
DEST=../docs/js/prism-solidity_1.24.1.js
wget $SOURCE -O $DEST
SOURCE=https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-solidity.min.js
DEST=../docs/js/prism-solidity_1.24.1.min.js
wget $SOURCE -O $DEST

# Get apexcharts[.min].js 4.5.0
SOURCE=https://cdn.jsdelivr.net/npm/apexcharts@4.5.0/dist/apexcharts.js
DEST=../docs/js/apexcharts_4.5.0.js
wget $SOURCE -O $DEST
SOURCE=https://cdn.jsdelivr.net/npm/apexcharts@4.5.0/dist/apexcharts.min.js
DEST=../docs/js/apexcharts_4.5.0.min.js
wget $SOURCE -O $DEST

# Get vue3-apexcharts@1.8.0
SOURCE=https://cdn.jsdelivr.net/npm/vue3-apexcharts@1.8.0/dist/vue3-apexcharts.umd.cjs
DEST=../docs/js/vue3-apexcharts_1.8.0.js
wget $SOURCE -O $DEST
