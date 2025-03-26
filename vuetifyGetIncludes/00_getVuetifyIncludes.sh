#!/bin/sh

# Get vue[.min].js 3.5.13
SOURCE=https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.js
DEST=../new_docs/js/vue_3.5.13.js
wget $SOURCE -O $DEST
SOURCE=https://cdn.jsdelivr.net/npm/vue@3.5.13/dist/vue.global.min.js
DEST=../new_docs/js/vue_3.5.13.min.js
wget $SOURCE -O $DEST

# Get vuex[.min].js 4.1.0
SOURCE=https://cdn.jsdelivr.net/npm/vuex@4.1.0/dist/vuex.global.js
DEST=../new_docs/js/vuex_4.1.0.js
wget $SOURCE -O $DEST
SOURCE=https://cdn.jsdelivr.net/npm/vuex@4.1.0/dist/vuex.global.min.js
DEST=../new_docs/js/vuex_4.1.0.min.js
wget $SOURCE -O $DEST

# Get vuetify[.min].css 3.7.18
SOURCE=https://cdn.jsdelivr.net/npm/vuetify@3.7.18/dist/vuetify.css
DEST=../new_docs/css/vuetify_3.7.18.css
wget $SOURCE -O $DEST
SOURCE=https://cdn.jsdelivr.net/npm/vuetify@3.7.18/dist/vuetify.min.css
DEST=../new_docs/css/vuetify_3.7.18.min.css
wget $SOURCE -O $DEST

# Get vuetify[.min].js 3.7.18
SOURCE=https://cdn.jsdelivr.net/npm/vuetify@3.7.18/dist/vuetify.js
DEST=../new_docs/js/vuetify_3.7.18.js
wget $SOURCE -O $DEST
SOURCE=https://cdn.jsdelivr.net/npm/vuetify@3.7.18/dist/vuetify.min.js
DEST=../new_docs/js/vuetify_3.7.18.min.js
wget $SOURCE -O $DEST
