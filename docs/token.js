const Token = {
  template: `
    <div>
      <v-container fluid class="pa-1">
        <v-toolbar density="compact" class="mt-1">
          <h4 class="ml-2">Token</h4>
          <render-address v-if="address" :address="address"></render-address>
          <p class="ml-5 text-caption text--disabled">
            {{ type && type.substring(0, 3) == "erc" && type.replace(/erc/, "ERC-") || "Not a token contract" }} {{ symbol }} {{ name && ("'" + name + "'") || "" }} {{ decimals }}
          </p>
          <v-spacer></v-spacer>
          <v-btn v-if="sync.info == null" @click="syncToken();" color="primary" icon v-tooltip="'Sync Token Info'">
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
          <v-btn v-if="sync.info == null" @click="syncTokenEvents();" color="primary" icon v-tooltip="'Sync Token Events'">
            <v-icon>mdi-download</v-icon>
          </v-btn>
          <!-- <v-btn v-if="sync.info == null" @click="syncTokenEvents();" color="primary" icon v-tooltip="'Retrieve Timestamps'">
            <v-icon>mdi-clock-outline</v-icon>
          </v-btn> -->
          <v-btn v-if="sync.info == null" :disabled="!reservoir" @click="syncTokenMetadata();" color="primary" icon v-tooltip="'Sync Token Metadata'">
            <v-icon>mdi-image-outline</v-icon>
          </v-btn>
          <v-btn v-if="sync.info != null" @click="setSyncHalt();" color="primary" icon v-tooltip="'Halt syncing'">
            <v-icon>mdi-stop</v-icon>
          </v-btn>
          <v-progress-circular v-if="sync.info != null" color="primary" :model-value="sync.total ? (parseInt(sync.completed * 100 / sync.total)) : 0" :size="30" :width="6" v-tooltip="sync.info + ': Block #' + commify0(sync.completed) + ' of ' + commify0(sync.total)"></v-progress-circular>
          <v-spacer></v-spacer>
          <v-tabs v-model="settings.tab" @update:modelValue="saveSettings();" right color="deep-purple-accent-4">
            <v-tab prepend-icon="mdi-text-long" text="Info" value="info" class="lowercase-btn"></v-tab>
            <v-tab v-if="type == 'erc721' || type == 'erc1155'" prepend-icon="mdi-cards-playing-heart-multiple-outline" text="Tokens" value="tokens" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-account-multiple-outline" text="Owners" value="owners" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-check-outline" text="Approvals" value="approvals" class="lowercase-btn"></v-tab>
            <v-tab prepend-icon="mdi-math-log" text="Events" value="events" class="lowercase-btn"></v-tab>
          </v-tabs>
        </v-toolbar>
        <v-tabs-window v-model="settings.tab">
          <v-tabs-window-item value="info">
            <v-card>
              <v-card-text>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Address:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <render-address v-if="address" :address="address"></render-address>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Type:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="type" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ type && type.replace(/erc/, "ERC-") || "" }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="type == 'erc20'" no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Symbol:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="symbol" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ symbol }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Name:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="name" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ name }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="type == 'erc20'" no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Decimals:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="decimals" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ decimals }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row v-if="type == 'erc20'" no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Total Supply:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn v-if="totalSupply" variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ totalSupply && formatUnits(totalSupply) || "" }}
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row no-gutters dense>
                  <v-col cols="2" align="right">
                    <p class="my-2">Number of Events:</p>
                  </v-col>
                  <v-col cols="6" align="left">
                    <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ numberOfEvents != null && commify0(numberOfEvents) || "Click [Sync Token Events] above" }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
          <v-tabs-window-item value="tokens">
            <v-card>
              <v-card-text class="ma-0 pa-0">
                <v-toolbar flat color="transparent" density="compact">
                  <v-btn icon @click="settings.tokens.showFilter = !settings.tokens.showFilter; saveSettings();" color="primary" class="lowercase-btn" v-tooltip="'Attributes filter'">
                    <v-icon :icon="settings.tokens.showFilter ? 'mdi-filter' : 'mdi-filter-outline'"></v-icon>
                  </v-btn>
                  <v-spacer></v-spacer>
                  <div v-for="(attributeData, attribute) of (settings.attributes[address] || {})">
                    <v-btn v-for="(optionData, option) of attributeData" size="x-small" variant="elevated" append-icon="mdi-close" @click="updateAttributes({ address, attribute, option, value: false });" class="ma-1 pa-1 lowercase-btn">
                      {{ attribute }}: {{ option }}
                      <template v-slot:append>
                        <v-icon color="primary"></v-icon>
                      </template>
                    </v-btn>
                  </div>
                  <v-spacer></v-spacer>
                  <v-select
                    v-model="settings.tokens.sortOption"
                    :items="tokensSortOptions"
                    variant="plain"
                    density="compact"
                    class="mt-3 mr-3"
                    style="max-width: 200px;"
                    @update:modelValue="saveSettings();"
                  ></v-select>
                  <v-btn-toggle v-model="settings.tokens.view" variant="plain" class="mr-3" @update:modelValue="saveSettings();" density="compact">
                    <v-btn icon value="large">
                      <v-icon color="primary">mdi-grid-large</v-icon>
                    </v-btn>
                    <v-btn icon value="medium">
                      <v-icon color="primary">mdi-grid</v-icon>
                    </v-btn>
                    <v-btn icon value="list">
                      <v-icon color="primary">mdi-format-list-bulleted-square</v-icon>
                    </v-btn>
                  </v-btn-toggle>
                  <p class="mr-1 text-caption text--disabled">
                    {{ commify0(nftFilteredTokens.length) }}
                  </p>
                  <v-pagination
                    v-model="settings.tokens.currentPage"
                    :length="Math.ceil((parseInt(nftFilteredTokens.length)) / settings.tokens.itemsPerPage)"
                    total-visible="0"
                    density="comfortable"
                    show-first-last-page
                    class="mr-1"
                    @update:modelValue="saveSettings();"
                    color="primary"
                  >
                  </v-pagination>
                </v-toolbar>
                <v-row no-gutters dense>
                  <v-col v-if="settings.tokens.showFilter" cols="2">
                    <v-card>
                      <v-expansion-panels flat>
                        <v-expansion-panel v-for="attribute in nftAttributesList" class="ma-0 pa-0">
                          <v-expansion-panel-title>
                            {{ attribute.attribute }}
                          </v-expansion-panel-title>
                          <v-expansion-panel-text class="ma-0 pa-0">
                            <div v-for="option in attribute.options" class="ma-0 pa-0">
                              <v-list-item class="ma-0 pa-0">
                                <v-list-item-title style="font-size: 12px !important;">
                                  {{ option.value }}
                                </v-list-item-title>
                                <template v-slot:prepend="{ isSelected, select }">
                                  <v-list-item-action class="flex-column align-end">
                                    <v-checkbox-btn
                                      :model-value="settings.attributes[address] && settings.attributes[address][attribute.attribute] && settings.attributes[address][attribute.attribute][option.value] || false"
                                      @update:modelValue="updateAttributes({ address, attribute: attribute.attribute, option: option.value, value: $event })"
                                    >
                                    </v-checkbox-btn>
                                  </v-list-item-action>
                                </template>
                                <template v-slot:append="{ isSelected, select }">
                                  <v-list-item-action class="flex-column align-end">
                                    <small class="mt-0 text-high-emphasis opacity-60">{{ option.count }}</small>
                                  </v-list-item-action>
                                </template>
                              </v-list-item>
                            </div>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-card>
                  </v-col>
                  <v-col :cols="settings.tokens.showFilter ? 10 : 12" align="left">
                    <v-row v-if="settings.tokens.view != 'list'" dense class="d-flex flex-wrap" align="stretch">
                      <v-col v-for="(item, index) in nftFilteredTokensPaged" :key="index" align="center">
                        <v-card class="pb-2" :max-width="settings.tokens.view != 'medium' ? 260 : 130">
                          <v-img :src="item.image" :width="settings.tokens.view != 'medium' ? 260 : 130" cover class="align-end text-white">
                            <v-card-title v-if="settings.tokens.view == 'large'" class="text-left" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); font-size: 1em;">{{ item.name }}</v-card-title>
                            <v-card-title v-if="settings.tokens.view == 'medium'" class="text-left" style="text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); font-size: 0.7em;">{{ item.name }}</v-card-title>
                          </v-img>
                          <v-card-text class="ma-0 pa-0 px-2 pt-1 d-flex">
                            <div v-if="type == 'erc721'">
                              <render-address :address="item.owner" :addresses="addresses" miniAddress noXPadding></render-address>
                            </div>
                            <div class="mt-2">
                              {{ Object.keys(item.owners || {}).length + ' owners' }}
                            </div>
                            <v-spacer></v-spacer>
                            <div v-if="item.price" v-tooltip="'Price on ' + item.price.source + ' ~ ' + commify2(item.price.amountUSD) + ' USD'" class="mt-2">
                              {{ item.price.amount + " " + item.price.currency }}
                            </div>
                          </v-card-text>
                          <v-card-subtitle v-if="settings.tokens.view == 'large'" class="ma-0 px-2 pt-0 d-flex">
                            <div v-if="item.lastSale" v-tooltip="'Last sale @ ' + formatTimestamp(item.lastSale.timestamp) + ' ~ ' + commify2(item.lastSale.amountUSD) + ' USD'">
                              <small class="mb-4 text-high-emphasis opacity-60">{{ item.lastSale.amount + " " + item.lastSale.currency }}</small>
                            </div>
                            <v-spacer></v-spacer>
                            <div v-if="item.topBid" v-tooltip="'Top bid on ' + item.topBid.source + ' ~ ' + commify2(item.topBid.amountUSD) + ' USD'">
                              <small class="mb-4 text-high-emphasis opacity-60">{{ item.topBid.amount + " " + item.topBid.currency }}</small>
                            </div>
                          </v-card-subtitle>
                          <!-- <v-card-text>
                            <div>Whitehaven Beach</div>
                            <div>Whitsunday Island, Whitsunday Islands</div>
                          </v-card-text> -->
                          <!-- <v-card-actions>
                            <v-btn color="orange" text="Share"></v-btn>
                            <v-btn color="orange" text="Explore"></v-btn>
                          </v-card-actions> -->
                          <!-- <v-card-actions>
                            <div class="flex-column align-start">
                              <small class="mb-4 text-high-emphasis opacity-60">{{ 'item.action' }}</small>
                              <v-spacer></v-spacer>
                              <v-icon color="yellow-darken-3">mdi-star</v-icon>
                            </div>
                            <v-spacer></v-spacer>
                            <div class="flex-column align-end">
                              <small class="mb-4 text-high-emphasis opacity-60">{{ 'item.action' }}</small>
                              <v-spacer></v-spacer>
                              <v-icon color="yellow-darken-3" class="text-right">mdi-star</v-icon>
                            </div>
                          </v-card-actions> -->
                        </v-card>
                      </v-col>
                    </v-row>

                    <v-data-table
                      v-if="settings.tokens.view == 'list'"
                      :items="nftFilteredTokens"
                      :headers="nftTokensHeaders"
                      v-model:sort-by="settings.tokens.sortBy"
                      v-model:items-per-page="settings.tokens.itemsPerPage"
                      v-model:page="settings.tokens.currentPage"
                      @update:options="saveSettings();"
                      density="comfortable"
                      hide-default-footer
                    >
                      <template v-slot:item.rowNumber="{ index }">
                        {{ (settings.tokens.currentPage - 1) * settings.tokens.itemsPerPage + index + 1 }}
                      </template>
                      <template v-slot:item.owner="{ item }">
                        <render-address :address="item.owner" :addresses="addresses" :token="address" noXPadding></render-address>
                      </template>
                    </v-data-table>
                    <v-toolbar flat color="transparent" density="compact">
                      <v-spacer></v-spacer>
                      <v-select
                        v-model="settings.tokens.itemsPerPage"
                        :items="itemsPerPageOptions"
                        variant="plain"
                        density="compact"
                        class="mt-2 mr-2"
                        style="max-width: 70px;"
                        @update:modelValue="saveSettings();"
                      ></v-select>
                      <v-pagination
                        v-model="settings.tokens.currentPage"
                        :length="Math.ceil((parseInt(nftFilteredTokens.length)) / settings.tokens.itemsPerPage)"
                        total-visible="0"
                        density="comfortable"
                        show-first-last-page
                        class="mr-1"
                        @update:modelValue="saveSettings();"
                        color="primary"
                      >
                      </v-pagination>
                    </v-toolbar>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-tabs-window-item>
          <v-tabs-window-item value="owners">
            <v-row v-if="type == 'erc20'" no-gutters dense>
              <v-col cols="7">
                <v-data-table
                  :items="erc20OwnersList"
                  :headers="erc20OwnersHeaders"
                  v-model:sort-by="settings.erc20Owners.sortBy"
                  v-model:items-per-page="settings.erc20Owners.itemsPerPage"
                  v-model:page="settings.erc20Owners.currentPage"
                  @update:options="saveSettings();"
                  density="comfortable"
                >
                  <template v-slot:item.rowNumber="{ index }">
                    {{ (settings.erc20Owners.currentPage - 1) * settings.erc20Owners.itemsPerPage + index + 1 }}
                  </template>
                  <template v-slot:item.address="{ item }">
                    <render-address :address="item.address" :addresses="addresses" :token="address" noXPadding></render-address>
                  </template>
                  <template v-slot:item.balance="{ item }">
                    {{ formatUnits(item.balance, decimals) }}
                  </template>
                </v-data-table>
                <!-- <pre v-if="type == 'erc721' || type == 'erc1155'">
nftOwnersList: {{ nftOwnersList }}
                  <br />
nftTotalSupply: {{ nftTotalSupply }}
                  <br />
tokens: {{ tokens }}
                </pre> -->
              </v-col>
              <v-col cols="5">
                <apexchart type="pie" :options="erc20OwnersChartOptions" :series="erc20OwnersChartSeries" class="ml-5 mt-5"></apexchart>
              </v-col>
            </v-row>
            <!-- <pre v-if="type == 'erc1155'">
nftTotalSupply: {{ nftTotalSupply }}
              <br />
nftOwnersList: {{ nftOwnersList }}
            </pre> -->
            <v-data-table
              v-if="type == 'erc721' || type == 'erc1155'"
              :items="nftOwnersList"
              :headers="nftOwnersHeaders"
              v-model:sort-by="settings.nftOwners.sortBy"
              v-model:items-per-page="settings.nftOwners.itemsPerPage"
              v-model:page="settings.nftOwners.currentPage"
              @update:options="saveSettings();"
              density="comfortable"
            >
              <template v-slot:item.rowNumber="{ index }">
                {{ (settings.nftOwners.currentPage - 1) * settings.nftOwners.itemsPerPage + index + 1 }}
              </template>
              <template v-slot:item.address="{ item }">
                <render-address :address="item.address" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
              </template>
              <template v-slot:item.count="{ item }">
                {{ item.count }}
              </template>
              <template v-slot:item.tokens="{ item }">
                <span v-if="type == 'erc721'">
                  <v-row dense class="my-2">
                    <v-col v-for="(token, index) in item.tokens" :key="index">
                      <render-token-id :tokenId="token" :token="address" :metadata="metadata"></render-token-id>
                    </v-col>
                  </v-row>
                </span>
                <span v-else>
                  <v-row dense class="my-2">
                    <v-col v-for="(token, index) in item.tokens" :key="index">
                      <render-token-id :tokenId="token.tokenId" :count="token.count" :token="address" :metadata="metadata"></render-token-id>
                    </v-col>
                  </v-row>
                </span>
              </template>
            </v-data-table>

          </v-tabs-window-item>
          <v-tabs-window-item value="approvals">
            <v-data-table
              :items="approvalsList"
              :headers="getApprovalsHeaders"
              v-model:sort-by="settings.approvals.sortBy"
              v-model:items-per-page="settings.approvals.itemsPerPage"
              v-model:page="settings.approvals.currentPage"
              @update:options="saveSettings();"
              density="comfortable"
            >
            <template v-slot:item.rowNumber="{ index }">
              {{ (settings.approvals.currentPage - 1) * settings.approvals.itemsPerPage + index + 1 }}
            </template>
            <template v-slot:item.blockNumber="{ item }">
              <render-block-number :block="item.blockNumber" noXPadding></render-block-number>
            </template>
            <template v-slot:item.txHash="{ item }">
              <render-tx-hash :txHash="item.txHash" :txHashes="txHashes" shortTxHash noXPadding></render-tx-hash>
            </template>
            <template v-slot:item.event="{ item }">
              <v-btn variant="text" class="lowercase-btn ma-0 px-0">
                {{ item.event }}
              </v-btn>
            </template>
            <template v-slot:item.address1="{ item }">
              <render-address :address="item.owner" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
            </template>
            <template v-slot:item.address2="{ item }">
              <span v-if="type == 'erc20'">
                <render-address :address="item.spender" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
              </span>
              <span v-else-if="type == 'erc721'">
                <span v-if="item.event == 'Approval'">
                  {{ item.tokenId }}
                </span>
                <span v-else-if="item.event == 'ApprovalForAll'">
                  <render-address :address="item.operator" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                </span>
              </span>
              <span v-else-if="type == 'erc1155'">
                <render-address :address="item.operator" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
              </span>
            </template>
            <template v-slot:item.value1="{ item }">
              <span v-if="type == 'erc20'">
                <!-- {{ item.tokens }} -->

                <span v-if="item.tokens.toString().length > 40" v-tooltip="formatUnits(item.tokens, decimals)">
                  <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                    &infin;
                  </v-btn>
                </span>
                <span v-else>
                  <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                    {{ formatUnits(item.tokens, decimals) }}
                  </v-btn>
                </span>

              </span>
              <span v-else-if="type == 'erc721'">
                <span v-if="item.event == 'Approval'">
                  <render-address :address="item.approved" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                </span>
                <span v-else-if="item.event == 'ApprovalForAll'">
                  <v-btn variant="text" class="lowercase-btn ma-0 px-0"  style="min-width: 0px;">
                    {{ item.approved }}
                  </v-btn>
                </span>
              </span>
              <span v-else-if="type == 'erc1155'">
                <v-btn variant="text" class="lowercase-btn ma-0 px-0"  style="min-width: 0px;">
                  {{ item.approved }}
                </v-btn>
              </span>
            </template>
            </v-data-table>
          </v-tabs-window-item>
          <v-tabs-window-item value="events">
            <!-- <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              :items-per-page-options="itemsPerPageOptions"
              :headers="blocksHeaders"
              :items="blocks"
              :items-length="blockNumber + 1"
              :loading="loading"
              :search="live && blockNumber.toString() || null"
              item-value="name"
              @update:options="loadEvents"
              v-model:page="currentPage"
              density="comfortable"
            > -->
            <v-data-table-server
              v-if="address"
              :headers="getEventsHeaders"
              :items-length="numberOfEvents || 0"
              :items="eventItems"
              :search="numberOfEvents && numberOfEvents.toString() || null"
              @update:options="loadEvents"
              :items-per-page-options="itemsPerPageOptions"
            >
              <template v-slot:item.blockNumber="{ item }">
                <render-block-number :block="item.blockNumber" noXPadding></render-block-number>
              </template>
              <template v-slot:item.txHash="{ item }">
                <render-tx-hash :txHash="item.info[0]" :txHashes="txHashes" shortTxHash noXPadding></render-tx-hash>
              </template>
              <template v-slot:item.event="{ item }">
                <v-btn variant="text" class="lowercase-btn ma-0 px-0">
                  {{ eventTypes[item.info[2]] }}
                </v-btn>
              </template>

              <template v-slot:item.address1="{ item }">
                <span v-if="type == 'erc20'">
                  <span v-if="item.info[2] == 0">
                    <render-address :address="item.info[3]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else>
                    <render-address :address="item.info[3]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                </span>
                <span v-else-if="type == 'erc721'">
                  <span v-if="item.info[2] == 0">
                    <render-address :address="item.info[3]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else-if="item.info[2] == 3">
                    <render-address :address="item.info[3]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else>
                    <render-address :address="item.info[3]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                </span>
                <span v-else>
                  <span v-if="item.info[2] == 1">
                    <render-address :address="item.info[4]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else-if="item.info[2] == 2">
                    <render-address :address="item.info[4]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else-if="item.info[2] == 4">
                    <render-address :address="item.info[3]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                </span>
              </template>

              <template v-slot:item.address2="{ item }">
                <span v-if="type == 'erc20'">
                  <span v-if="item.info[2] == 0">
                    <render-address :address="item.info[4]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else>
                    <render-address :address="item.info[4]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                </span>
                <span v-else-if="type == 'erc721'">
                  <span v-if="item.info[2] == 0">
                    <render-address :address="item.info[4]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else-if="item.info[2] == 3">
                    <render-address :address="item.info[4]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else>
                    <render-address :address="item.info[4]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                </span>
                <span v-else>
                  <span v-if="item.info[2] == 1">
                    <render-address :address="item.info[5]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else-if="item.info[2] == 2">
                    <render-address :address="item.info[5]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                  <span v-else-if="item.info[2] == 4">
                    <render-address :address="item.info[4]" :addresses="addresses" :token="address" shortAddress noXPadding></render-address>
                  </span>
                </span>
              </template>

              <template v-slot:item.value1="{ item }">
                <v-row justify="end">
                  <span v-if="type == 'erc20'">
                    <span v-if="item.info[5].toString().length > 40" v-tooltip="formatUnits(item.info[5], decimals)">
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        &infin;
                      </v-btn>
                    </span>
                    <span v-else>
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        {{ formatUnits(item.info[5], decimals) }}
                      </v-btn>
                    </span>
                  </span>
                  <span v-else-if="type == 'erc721'">
                    <span v-if="item.info[2] == 0">
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        <render-token-id :tokenId="item.info[5]" :token="address" :metadata="metadata"></render-token-id>
                        <!-- {{ item.info[5] }} -->
                      </v-btn>
                    </span>
                    <span v-else-if="item.info[2] == 3">
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        <render-token-id :tokenId="item.info[5]" :token="address" :metadata="metadata"></render-token-id>
                        <!-- {{ item.info[5] }} -->
                      </v-btn>
                    </span>
                    <span v-else>
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        {{ item.info[5] }}
                      </v-btn>
                    </span>
                  </span>
                  <span v-else>
                    <span v-if="item.info[2] == 1">
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        {{ item.info[6] }}
                      </v-btn>
                    </span>
                    <span v-else-if="item.info[2] == 2">
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        {{ item.info[6].join(',') }}
                      </v-btn>
                    </span>
                    <span v-else-if="item.info[2] == 4">
                      <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                        {{ item.info[5] }}
                      </v-btn>
                    </span>
                  </span>
                </v-row>
              </template>

              <template v-slot:item.value2="{ item }">
                <span v-if="type == 'erc1155'">
                  <span v-if="item.info[2] == 1">
                    <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ item.info[7] }}
                    </v-btn>
                  </span>
                  <span v-else-if="item.info[2] == 2">
                    <v-btn variant="text" class="lowercase-btn ma-0 px-2" style="min-width: 0px;">
                      {{ item.info[7].join(',') }}
                    </v-btn>
                  </span>
                </span>
              </template>
            </v-data-table-server>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-container>
    </div>
  `,
  props: ['inputAddress'],
  data: function () {
    return {
      initialised: false,
      settings: {
        tab: null,
        erc20Owners: {
          sortBy: [{ key: "balances", order: "desc" }],
          itemsPerPage: 10,
          currentPage: 1,
          top: 20,
        },
        tokens: {
          showFilter: false,
          view: "large",
          sortOption: "tokenidasc",
          itemsPerPage: 10,
          currentPage: 1,
        },
        nftOwners: {
          sortBy: [{ key: "count", order: "desc" }],
          itemsPerPage: 10,
          currentPage: 1,
          top: 20,
        },
        approvals: {
          sortBy: [{ key: "blockNumber", order: "desc" }],
          itemsPerPage: 10,
          currentPage: 1,
        },
        attributes: {}, // address -> attribute -> option -> selected?
        version: 8,
      },
      eventTypes: [
        "Transfer",
        "TransferSingle",
        "TransferBatch",
        "Approval",
        "ApprovalForAll",
      ],
      eventItems: [],
      itemsPerPageOptions: [
        { value: 5, title: "5" },
        { value: 10, title: "10" },
        { value: 20, title: "20" },
        { value: 30, title: "30" },
        { value: 40, title: "40" },
        { value: 50, title: "50" },
        { value: 100, title: "100" },
      ],
      tokensSortOptions: [
        { value: "tokenidasc", title: "▲ Token Id" },
        { value: "tokeniddsc", title: "▼ Token Id" },
      ],
      erc20OwnersHeaders: [
        { title: '#', value: 'rowNumber', align: 'end', sortable: false },
        { title: 'Address', value: 'address', sortable: true, sortRaw: (a, b) => a.address.localeCompare(b.address) },
        { title: 'Balance', value: 'balance', align: 'end', sortable: true, sortRaw: (a, b) => ethers.BigNumber.from(a.balance).sub(b.balance) },
        { title: '%', value: 'percent', align: 'end', sortable: false },
      ],
      nftTokensHeaders: [
        { title: '#', value: 'rowNumber', align: 'end', sortable: false },
        { title: 'Token Id', value: 'tokenId', align: 'end', sortable: false },
        { title: 'Name', value: 'name', sortable: false },
        { title: 'Owner', value: 'owner', sortable: false },
      ],
      nftOwnersHeaders: [
        { title: '#', value: 'rowNumber', align: 'end', sortable: false },
        { title: 'Address', value: 'address', sortable: true, sortRaw: (a, b) => a.address.localeCompare(b.address) },
        { title: 'Count', value: 'count', align: 'end', sortable: true, sortRaw: (a, b) => a.count - b.count },
        { title: '%', value: 'percent', align: 'end', sortable: false },
        { title: 'Tokens', value: 'tokens', sortable: false },
      ],
    };
  },
  computed: {
    chainId() {
      return store.getters['chainId'];
    },
    address() {
      return store.getters['token/address'];
    },
    version() {
      return store.getters['token/info'].version || null;
    },
    implementation() {
      return store.getters['token/info'].implementation || null;
    },
    type() {
      return store.getters['token/info'].type || null;
    },
    name() {
      return store.getters['token/info'].name || null;
    },
    symbol() {
      return store.getters['token/info'].symbol || null;
    },
    decimals() {
      return store.getters['token/info'].decimals || null;
    },
    totalSupply() {
      return store.getters['token/info'].totalSupply || null;
    },
    addresses() {
      return store.getters['token/addresses'];
    },
    txHashes() {
      return store.getters['token/txHashes'];
    },
    numberOfEvents() {
      return store.getters['token/numberOfEvents'];
    },
    balances() {
      return store.getters['token/balances'];
    },
    tokens() {
      return store.getters['token/tokens'];
    },
    approvals() {
      return store.getters['token/approvals'];
    },
    approvalForAlls() {
      return store.getters['token/approvalForAlls'];
    },
    metadata() {
      return store.getters['token/metadata'];
    },
    sync() {
      return store.getters['token/sync'];
    },
    explorer() {
      return store.getters['explorer'];
    },
    reservoir() {
      return store.getters['reservoir'];
    },
    getEventsHeaders() {
      if (this.type == "erc20") {
        return [
          { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'From / Owner', value: 'address1', sortable: false },
          { title: 'To / Spender', value: 'address2', sortable: false },
          { title: 'Tokens', value: 'value1', align: 'end', sortable: false },
        ];
      } else if (this.type == "erc721") {
        return [
          { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'From / Owner / Account', value: 'address1', sortable: false },
          { title: 'To / Approved / Operator', value: 'address2', sortable: false },
          { title: 'Token Id / Token Id / Approved', value: 'value1', align: 'end', sortable: false },
        ];
      } else {
        return [
          { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'From / Owner', value: 'address1', sortable: false },
          { title: 'To / Operator', value: 'address2', sortable: false },
          { title: 'Token Id / Approved', value: 'value1', align: 'end', sortable: false },
          { title: 'Tokens', value: 'value2', align: 'end', sortable: false },
        ];
      }
    },
    getApprovalsHeaders() {
      if (this.type == "erc20") {
        return [
          { title: '#', value: 'rowNumber', align: 'end', sortable: false },
          // { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'Owner', value: 'address1', sortable: false },
          { title: 'Spender', value: 'address2', sortable: false },
          { title: 'Tokens', value: 'value1', align: 'end', sortable: false },
        ];
      } else if (this.type == "erc721") {
        return [
          { title: '#', value: 'rowNumber', align: 'end', sortable: false },
          // { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'Owner', value: 'address1', sortable: false },
          { title: 'Token Id / Operator', value: 'address2', sortable: false },
          { title: 'Approved', value: 'value1', sortable: false },
        ];
      } else {
        return [
          { title: '#', value: 'rowNumber', align: 'end', sortable: false },
          // { title: 'When', value: 'when', sortable: false },
          { title: 'Block #', value: 'blockNumber', sortable: true },
          { title: 'Tx Hash', value: 'txHash', sortable: false },
          { title: 'Event', value: 'event', sortable: false },
          { title: 'Owner', value: 'address1', sortable: false },
          { title: 'Operator', value: 'address2', sortable: false },
          { title: 'Approved', value: 'value1', sortable: false },
        ];
      }
    },
    erc20OwnersList() {
      const results = [];
      for (const [address, balance] of Object.entries(this.balances)) {
        const percent = ethers.BigNumber.from(balance).mul(1000000).div(this.totalSupply) / 10000.0;
        results.push({ address, balance, percent });
      }
      results.sort((a, b) => {
        return ethers.BigNumber.from(b.balance).sub(a.balance);
      });
      return results;
    },
    nftTotalSupply() {
      let result = 0;
      if (this.type == "erc721") {
        result = Object.keys(this.tokens).length;
      } else if (this.type == "erc1155") {
        for (const [tokenId, ownerData] of Object.entries(this.tokens)) {
          for (const [owner, count] of Object.entries(ownerData)) {
            result += parseInt(count);
          }
        }
      }
      return result;
    },
    nftAttributes() {
      const results = {};
      if (this.type == "erc721" || this.type == "erc1155") {
        for (const [tokenId, tokenData] of Object.entries(this.metadata.tokens || {})) {
          for (const attribute of tokenData.attributes) {
            if (!(attribute.key in results)) {
              results[attribute.key] = {};
            }
            if (!(attribute.value in results[attribute.key])) {
              results[attribute.key][attribute.value] = [];
            }
            results[attribute.key][attribute.value].push(parseInt(tokenId));
          }
        }
      }
      return results;
    },
    nftAttributesList() {
      const results = [];
      for (const [attribute, attributeInfo] of Object.entries(this.nftAttributes)) {
        const array = [];
        for (const [value, info] of Object.entries(attributeInfo)) {
          array.push({ value, count: info.length });
        }
        array.sort((a, b) => {
          return a.count - b.count;
        });
        results.push({ attribute, options: array });
      }
      results.sort((a, b) => {
        return a.attribute.localeCompare(b.attribute);
      });
      return results;
    },
    nftFilteredTokens() {
      const results = [];
      if (this.type == "erc721" || this.type == "erc1155") {
        if (this.settings.attributes[this.address]) {
          let tokenIds = null;
          for (const [attribute, attributeData] of Object.entries(this.settings.attributes[this.address])) {
            let attributeTokenIds = null;
            for (const [option, optionData] of Object.entries(attributeData)) {
              if (!attributeTokenIds) {
                attributeTokenIds = new Set(this.nftAttributes[attribute][option]);
              } else {
                attributeTokenIds = new Set([...attributeTokenIds, ...this.nftAttributes[attribute][option]]);
              }
            }
            if (!tokenIds) {
              tokenIds = attributeTokenIds;
            } else {
              const newTokenIds = new Set();
              for (const tokenId of tokenIds) {
                if ((attributeTokenIds.has(tokenId))) {
                  newTokenIds.add(tokenId);
                }
              }
              tokenIds = newTokenIds;
            }
          }
          for (const tokenId of tokenIds) {
            if (this.type == "erc721") {
              results.push({ tokenId, ...this.metadata.tokens[tokenId], owner: this.tokens[tokenId] || null });
            } else {
              results.push({ tokenId, ...this.metadata.tokens[tokenId], owners: this.tokens[tokenId] || null, owner: undefined });
            }
          }
        } else {
          for (const [tokenId, tokenData] of Object.entries(this.metadata.tokens || {})) {
            if (this.type == "erc721") {
              results.push({ tokenId, ...this.metadata.tokens[tokenId], owner: this.tokens[tokenId] || null });
            } else {
              results.push({ tokenId, ...this.metadata.tokens[tokenId], owners: this.tokens[tokenId] || null, owner: undefined });
            }
          }
        }
      }
      if (this.settings.tokens.sortOption == "tokenidasc") {
        results.sort((a, b) => {
          return a.tokenId - b.tokenId;
        });
      } else if (this.settings.tokens.sortOption == "tokeniddsc") {
        results.sort((a, b) => {
          return b.tokenId - a.tokenId;
        });
      }
      return results;
    },
    nftFilteredTokensPaged() {
      const results = this.nftFilteredTokens.slice((this.settings.tokens.currentPage - 1) * this.settings.tokens.itemsPerPage, this.settings.tokens.currentPage * this.settings.tokens.itemsPerPage);
      console.log(now() + " Token - computed.nftFilteredTokensPaged - results: " + JSON.stringify(results, null, 2));
      return results;
    },
    nftOwnersList() {
      const results = [];
      // console.log(now() + " Token - computed.nftOwnersList - this.tokens: " + JSON.stringify(this.tokens, null, 2));
      if (this.type == "erc721") {
        const totalSupply = this.nftTotalSupply;
        const owners = {};
        for (const [tokenId, owner] of Object.entries(this.tokens)) {
          if (!(owner in owners)) {
            owners[owner] = [];
          }
          owners[owner].push(tokenId);
        }
        // console.log(now() + " Token - computed.nftOwnersList - owners: " + JSON.stringify(owners, null, 2));
        for (const [address, tokens] of Object.entries(owners)) {
          const percent = tokens.length * 100.0 / totalSupply ;
          results.push({ address, count: tokens.length, percent: parseFloat(percent.toFixed(4)), tokens });
        }
      } else if (this.type == "erc1155") {
        const totalSupply = this.nftTotalSupply;
        const owners = {};
        for (const [tokenId, ownerData] of Object.entries(this.tokens)) {
          for (const [owner, count] of Object.entries(ownerData)) {
            if (!(owner in owners)) {
              owners[owner] = [];
            }
            owners[owner].push({ tokenId, count });
          }
        }
        // console.log(now() + " Token - computed.nftOwnersList - owners: " + JSON.stringify(owners, null, 2));
        for (const [address, tokenInfo] of Object.entries(owners)) {
          let count = 0;
          for (const item of tokenInfo) {
            // console.log("  " + JSON.stringify(item));
            count += parseInt(item.count);
          }
          // console.log(address + " => " + count + " " + JSON.stringify(tokenInfo));
          const percent = count * 100.0 / totalSupply ;
          results.push({ address, count, percent: percent.toFixed(4), tokens: tokenInfo });
        }

      }
      results.sort((a, b) => {
        return b.count - a.count;
      });
      // console.log(now() + " Token - computed.nftOwnersList - results: " + JSON.stringify(results, null, 2));
      return results;
    },
    approvalsList() {
      const results = [];
      // console.log(now() + " Token - computed.approvalsList - this.approvals: " + JSON.stringify(this.approvals, null, 2));
      // console.log(now() + " Token - computed.approvalsList - this.approvalForAlls: " + JSON.stringify(this.approvalForAlls, null, 2));
      if (this.type == "erc20") {
        for (const [owner, ownerData] of Object.entries(this.approvals)) {
          for (const [spender, data] of Object.entries(ownerData)) {
            results.push({ event: "Approval", owner, spender, ...data });
          }
        }
      } else if (this.type == "erc721") {
        for (const [owner, ownerData] of Object.entries(this.approvals)) {
          for (const [tokenId, data] of Object.entries(ownerData)) {
            results.push({ event: "Approval", owner, tokenId, ...data });
          }
        }
        for (const [owner, ownerData] of Object.entries(this.approvalForAlls)) {
          for (const [operator, data] of Object.entries(ownerData)) {
            results.push({ event: "ApprovalForAll", owner, operator, ...data });
          }
        }
      } else if (this.type == "erc1155") {
        for (const [owner, ownerData] of Object.entries(this.approvalForAlls)) {
          for (const [operator, data] of Object.entries(ownerData)) {
            results.push({ event: "ApprovalForAll", owner, operator, ...data });
          }
        }
      }
      results.sort((a, b) => {
        return b.blockNumber - a.blockNumber;
      });
      // console.log(now() + " Token - computed.approvalsList - results: " + JSON.stringify(results, null, 2));
      return results;
    },
    erc20OwnersChartSeries() {
      const series = [];
      let other = 0;
      for (const [index, row] of this.erc20OwnersList.entries()) {
        const value = parseFloat(ethers.utils.formatUnits(row.balance, this.decimals));
        if (index < this.settings.erc20Owners.top) {
          series.push(value);
        } else {
          other += value;
        }
      }
      if (other > 0) {
        series.push(other);
      }
      // console.log(now() + " Token - computed.erc20OwnersChartSeries - series: " + JSON.stringify(series));
      return series;
    },
    erc20OwnersChartOptions() {
      const labels = [];
      let other = 0;
      let otherPercent = 0;
      for (const [index, row] of this.erc20OwnersList.entries()) {
        const value = parseFloat(ethers.utils.formatUnits(row.balance, this.decimals));
        if (index < this.settings.erc20Owners.top) {
          labels.push(this.addresses[row.address].substring(0, 10) + " " + row.percent.toFixed(4) + "%");
        } else {
          other += value;
          otherPercent += row.percent;
        }
      }
      if (other > 0) {
        labels.push("Other " + otherPercent.toFixed(4) + "%");
      }
      // console.log(now() + " Token - computed.erc20OwnersChartOptions - labels: " + JSON.stringify(labels));
      return {
        chart: {
          width: 540,
          type: 'pie',
        },
        labels,
        // responsive: [{
        //   breakpoint: 480,
        //   options: {
        //     chart: {
        //       width: 200
        //     },
        //     legend: {
        //       position: 'bottom'
        //     }
        //   }
        // }],
      }
    },
  },
  methods: {
    syncToken() {
      console.log(now() + " Token - methods.syncToken - address: " + this.address);
      store.dispatch('token/loadToken', { inputAddress: this.address, forceUpdate: true });
    },
    syncTokenEvents() {
      console.log(now() + " Token - methods.syncTokenEvents - address: " + this.address);
      store.dispatch('token/syncTokenEvents', { inputAddress: this.address, forceUpdate: true });
    },
    syncTokenMetadata() {
      console.log(now() + " Token - methods.syncTokenMetadata - address: " + this.address);
      store.dispatch('token/syncTokenMetadata', this.address);
    },
    setSyncHalt() {
      console.log(now() + " Token - methods.setSyncHalt");
      store.dispatch('token/setSyncHalt');
    },

    async loadEvents({ page, itemsPerPage, sortBy }) {
      const sort = !sortBy || sortBy.length == 0 || (sortBy[0].key == "blockNumber" && sortBy[0].order == "desc") ? "desc" : "asc";
      console.log(now() + " Token - methods.loadEvents - page: " + page + ", itemsPerPage: " + itemsPerPage + ", sortBy: " + JSON.stringify(sortBy) + ", sort: " + sort);
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const address = store.getters["token/address"];
      console.log(now() + " Token - methods.loadEvents - address: " + address);
      if (address) {
        const chainId = store.getters["chainId"];
        const row = (page - 1) * itemsPerPage;
        let data;
        if (sort == "asc") {
          data = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, address, Dexie.minKey, Dexie.minKey],[chainId, address, Dexie.maxKey, Dexie.maxKey]).offset(row).limit(itemsPerPage).toArray();
        } else {
          data = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, address, Dexie.minKey, Dexie.minKey],[chainId, address, Dexie.maxKey, Dexie.maxKey]).reverse().offset(row).limit(itemsPerPage).toArray();
        }
        this.eventItems = data;
      }
      db.close();
    },

    updateAttributes(event) {
      console.log(now() + " Token - methods.updateAttributes - event: " + JSON.stringify(event));
      if (event.value) {
        if (!(event.address in this.settings.attributes)) {
          this.settings.attributes[event.address] = {};
        }
        if (!(event.attribute in this.settings.attributes[event.address])) {
          this.settings.attributes[event.address][event.attribute] = {};
        }
        if (!(event.option in this.settings.attributes[event.address][event.attribute])) {
          this.settings.attributes[event.address][event.attribute][event.option] = event.value;
        }
      } else {
        if (this.settings.attributes[event.address][event.attribute][event.option]) {
          delete this.settings.attributes[event.address][event.attribute][event.option];
        }
        if (Object.keys(this.settings.attributes[event.address][event.attribute]).length == 0) {
          delete this.settings.attributes[event.address][event.attribute];
        }
        if (Object.keys(this.settings.attributes[event.address]).length == 0) {
          delete this.settings.attributes[event.address];
        }
      }
      this.saveSettings();
    },

    formatUnits(e, decimals) {
      if (e) {
        return ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
      }
      return null;
    },
    formatTimestamp(ts) {
      if (ts != null) {
        return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
      }
      return null;
    },
    commify0(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return null;
    },
    commify2(n) {
      if (n != null) {
        return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
      }
      return null;
    },
    saveSettings() {
      // console.log(now() + " Token - methods.saveSettings - settings: " + JSON.stringify(this.settings, null, 2));
      if (this.initialised) {
        localStorage.explorerTokenSettings = JSON.stringify(this.settings);
      }
    },
    copyToClipboard(str) {
      navigator.clipboard.writeText(str);
    },
  },
  beforeCreate() {
    console.log(now() + " Token - beforeCreate");
	},
  mounted() {
    console.log(now() + " Token - mounted - inputAddress: " + this.inputAddress);

    if ('explorerTokenSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.explorerTokenSettings);
      // console.log(now() + " Token - mounted - tempSettings: " + JSON.stringify(tempSettings));
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
      }
    }
    this.initialised = true;
    console.log(now() + " Token - mounted - this.settings: " + JSON.stringify(this.settings));

    const t = this;
    setTimeout(function() {
      store.dispatch('token/loadToken', { inputAddress: t.inputAddress, forceUpdate: false });
    }, 100);
	},
  unmounted() {
    console.log(now() + " Token - unmounted");
	},
  destroyed() {
    console.log(now() + " Token - destroyed");
	},
};
