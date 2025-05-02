const punksModule = {
  namespaced: true,
  state: {
    attributes: [],

    addresses: [],
    addressesIndex: {},
    txHashes: [],
    txHashesIndex: {},

    numberOfEvents: null,
    owners: [],
    bids: {},
    offers: {},

    sync: {
      info: null,
      completed: null,
      total: null,
      halt: false,
    },
  },
  getters: {
    attributes: state => state.attributes,

    addresses: state => state.addresses,
    addressesIndex: state => state.addressesIndex,
    txHashes: state => state.txHashes,
    txHashesIndex: state => state.txHashesIndex,

    numberOfEvents: state => state.numberOfEvents,
    owners: state => state.owners,
    bids: state => state.bids,
    offers: state => state.offers,

    sync: state => state.sync,
  },
  mutations: {
    setAttributes(state, attributes) {
      // console.log(now() + " punksModule - mutations.setAttributes - attributes: " + JSON.stringify(attributes));
      state.attributes = attributes;
    },
    setLookups(state, { addresses, addressesIndex, txHashes, txHashesIndex }) {
      // console.log(now() + " punksModule - mutations.setLookups - { addresses, addressesIndex, txHashes, txHashesIndex }: " + JSON.stringify({ addresses, addressesIndex, txHashes, txHashesIndex }));
      state.addresses = addresses;
      state.addressesIndex = addressesIndex;
      state.txHashes = txHashes;
      state.txHashesIndex = txHashesIndex;
    },
    setEventInfo(state, { numberOfEvents, owners, bids, offers }) {
      console.log(now() + " tokenModule - mutations.setEventInfo - numberOfEvents: " + JSON.stringify(numberOfEvents));
      state.numberOfEvents = numberOfEvents;
      state.owners = owners;
      state.bids = bids;
      state.offers = offers;
    },

    setSyncInfo(state, info) {
      console.log(now() + " punksModule - mutations.setSyncInfo - info: " + info);
      state.sync.info = info;
    },
    setSyncCompleted(state, completed) {
      console.log(now() + " punksModule - mutations.setSyncCompleted - completed: " + completed);
      state.sync.completed = completed;
    },
    setSyncTotal(state, total) {
      console.log(now() + " punksModule - mutations.setSyncTotal - total: " + total);
      state.sync.total = total;
    },
    setSyncHalt(state, halt) {
      console.log(now() + " punksModule - mutations.setSyncHalt - halt: " + halt);
      state.sync.halt = halt;
    },
  },
  actions: {
    async startup(context) {
      console.log(now() + " punksModule - actions.startup");
      const chainId = store.getters["chainId"];
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      let attributes = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punks_attributes", {});
      context.commit('setAttributes', attributes);

      const addresses = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_addresses", []);
      const addressesIndex = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_addressesIndex", {});
      const txHashes = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_txHashes", []);
      const txHashesIndex = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_txHashesIndex", {});
      context.commit('setLookups', { addresses, addressesIndex, txHashes, txHashesIndex });

      const info = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_data", {});
      const numberOfEvents = info.numberOfEvents || null;
      const owners = info.owners || [];
      const bids = info.bids || {};
      const offers = info.offers || {};
      context.commit('setEventInfo', { numberOfEvents, owners, bids, offers });

      db.close();
    },
    async syncPunks(context, forceUpdate) {
      console.log(now() + " punksModule - actions.syncPunks - forceUpdate: " + forceUpdate);
      const chainId = store.getters["chainId"];
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CRYPTOPUNKS_HELPER_ADDRESS, CRYPTOPUNKS_HELPER_ABI, provider);
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      let attributes = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punks_attributes", []);
      if (Object.keys(attributes).length == 0 || forceUpdate) {
        attributes = [];
        const rawAttributes = await contract.getAttributes(0, 10000);
        const traitsLookup = {};
        for (const [trait, traitData] of Object.entries(CRYPTOPUNKS_TRAITS)) {
          for (const item of traitData) {
            traitsLookup[item] = trait;
          }
        }
        for (const [index, attribute] of rawAttributes.entries()) {
          const attributeList = attribute.split(", ");
          const list = [];
          for (const option of attributeList) {
            const modifiedOption = option; // .replace(/ \d$/, "");
            const trait = traitsLookup[modifiedOption] || null;
            if (!trait) {
              console.error("Punk " + index + " " + modifiedOption);
            } else {
              list.push([ trait, modifiedOption ]);
            }
          }
          attributes[index] = list;
        }
        // console.log("attributes: " + JSON.stringify(attributes, null, 2));
        await dbSaveCacheData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punks_attributes", attributes);
      }
      context.commit('setAttributes', attributes);
      db.close();
    },
    setSyncHalt(context) {
      console.log(moment().format("HH:mm:ss") + " punksModule - actions.setSyncHalt");
      context.commit('setSyncHalt', true);
    },
    async syncPunksEvents(context, forceUpdate) {
      function getAddressIndex(address) {
        if (!(address in addressesIndex)) {
          addressesIndex[address] = addresses.length;
          addresses.push(address);
        }
        return addressesIndex[address];
      }
      function getTxHashIndex(txHash) {
        if (!(txHash in txHashesIndex)) {
          txHashesIndex[txHash] = txHashes.length;
          txHashes.push(txHash);
        }
        return txHashesIndex[txHash];
      }

      async function processLogs(fromBlock, toBlock, logs) {
        console.log(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", logs.length: " + logs.length);
        const records = [];
        let lastTransferTo = null; // acceptBidForPunk() emits PunkBought with toAddress = 0x0, so using last Transfer to address
        for (const log of logs) {
          if (!log.removed) {
            let info = null;
            const logData = punkInterface.parseLog(log);
            const event = PUNKEVENT_STRING_TO_INT[logData.eventFragment.name];
            if (event == PUNKEVENT_ASSIGN) {
              const [ to, punkId ] = logData.args;
              // if (punkId == 0) {
              //   console.error(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - TRACE ASSIGN logData: " + JSON.stringify(logData));
              // }
              info = [event, getAddressIndex(to), parseInt(punkId) ];
            } else if (event == PUNKEVENT_TRANSFER) {
              const [ from, to, value ] = logData.args;
              lastTransferTo = to;
              //   console.error(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - TRACE TRANSFER logData: " + JSON.stringify(logData));
              info = [event, getAddressIndex(from), getAddressIndex(to), parseInt(value) ];
            } else if (event == PUNKEVENT_PUNKTRANSFER) {
              const [ from, to, punkId ] = logData.args;
              // if (punkId == 0) {
              //   console.error(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - TRACE PUNKTRANSFER logData: " + JSON.stringify(logData));
              // }
              info = [event, getAddressIndex(from), getAddressIndex(to), parseInt(punkId) ];
            } else if (event == PUNKEVENT_PUNKOFFERED) {
              const [ punkId, minValue, toAddress ] = logData.args;
              // if (punkId == 0) {
              //   console.error(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - TRACE PUNKOFFERED logData: " + JSON.stringify(logData));
              // }
              info = [event, parseInt(punkId), ethers.BigNumber.from(minValue).toString(), getAddressIndex(toAddress) ];
            } else if (event == PUNKEVENT_PUNKBIDENTERED) {
              const [ punkId, value, fromAddress ] = logData.args;
              // if (punkId == 0) {
              //   console.error(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - TRACE PUNKBIDENTERED logData: " + JSON.stringify(logData));
              // }
              info = [event, parseInt(punkId), ethers.BigNumber.from(value).toString(), getAddressIndex(fromAddress) ];
            } else if (event == PUNKEVENT_PUNKBIDWITHDRAWN) {
              const [ punkId, value, fromAddress ] = logData.args;
              // if (punkId == 0) {
              //   console.error(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - TRACE PUNKBIDWITHDRAWN logData: " + JSON.stringify(logData));
              // }
              info = [event, parseInt(punkId), ethers.BigNumber.from(value).toString(), getAddressIndex(fromAddress) ];
            } else if (event == PUNKEVENT_PUNKBOUGHT) {
              const [ punkId, value, fromAddress, toAddress ] = logData.args;
              // if (punkId == 0) {
              //   console.error(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - TRACE PUNKBOUGHT logData: " + JSON.stringify(logData));
              // }
              info = [event, parseInt(punkId), ethers.BigNumber.from(value).toString(), getAddressIndex(fromAddress), getAddressIndex(toAddress == ADDRESS0 ? lastTransferTo : toAddress) ];
            } else if (event == PUNKEVENT_PUNKNOLONGERFORSALE) {
              const [ punkId ] = logData.args;
              // if (punkId == 0) {
              //   console.error(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - TRACE PUNKNOLONGERFORSALE logData: " + JSON.stringify(logData));
              // }
              info = [event, parseInt(punkId) ];
            }
            if (info) {
              records.push({
                chainId,
                address: log.address,
                blockNumber: log.blockNumber,
                logIndex: log.logIndex,
                info: [ getTxHashIndex(log.transactionHash), log.transactionIndex, ...info ],
              });
            }
          }
        }
        // console.log(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", records: " + JSON.stringify(records, null, 2));
        if (records.length > 0) {
          await dbSaveCacheData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_addresses", addresses);
          await dbSaveCacheData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_addressesIndex", addressesIndex);
          await dbSaveCacheData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_txHashes", txHashes);
          await dbSaveCacheData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_txHashesIndex", txHashesIndex);
          await db.punkEvents.bulkAdd(records).then(function(lastKey) {
            console.log(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - bulkAdd lastKey: " + JSON.stringify(lastKey));
            }).catch(Dexie.BulkError, function(e) {
              console.log(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - bulkAdd e: " + JSON.stringify(e.failures, null, 2));
            });
        }
      }

      async function getTokenLogsFromRange(fromBlock, toBlock) {
        console.log(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.getTokenLogsFromRange - fromBlock: " + fromBlock + ", toBlock: " + toBlock);
        if (context.state.sync.halt) {
          return;
        }
        try {
          const logs = await provider.getLogs({
            address: CRYPTOPUNKSMARKET_V2_ADDRESS,
            fromBlock,
            toBlock,
            topics: [],
          });
          // console.log(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.getTokenLogsFromRange - logs: " + JSON.stringify(logs, null, 2));
          await processLogs(fromBlock, toBlock, logs);
          context.commit('setSyncCompleted', toBlock);
        } catch (e) {
          console.error(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.getTokenLogsFromRange - Error: " + e.message);
          const mid = parseInt((fromBlock + toBlock) / 2);
          await getTokenLogsFromRange(fromBlock, mid);
          await getTokenLogsFromRange(parseInt(mid) + 1, toBlock);
        }
      }

      console.log(now() + " punksModule - actions.syncPunksEvents - forceUpdate: " + forceUpdate);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const chainId = store.getters["chainId"];
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      // const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);
      const punkInterface = new ethers.utils.Interface(CRYPTOPUNKSMARKET_V2_ABI);

      const addresses = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_addresses", []);
      const addressesIndex = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_addressesIndex", {});
      const txHashes = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_txHashes", []);
      const txHashesIndex = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_txHashesIndex", {});

      const address0Index = getAddressIndex(ADDRESS0);
      const tokenIndex = getAddressIndex(CRYPTOPUNKSMARKET_V2_ADDRESS);

      let info = {};
      const block = await provider.getBlock();
      const latestBlockNumber = block && block.number || null;
      // const latestBlockNumber = parseInt(3914495) + 10000;
      context.commit('setSyncTotal', latestBlockNumber);
      context.commit('setSyncCompleted', 0);
      context.commit('setSyncInfo', "Syncing punk events");
      const latest = await db.punkEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, CRYPTOPUNKSMARKET_V2_ADDRESS, Dexie.minKey, Dexie.minKey],[chainId, CRYPTOPUNKSMARKET_V2_ADDRESS, Dexie.maxKey, Dexie.maxKey]).last();
      // console.log(now() + " punksModule - actions.syncTokenEvents - latest: " + JSON.stringify(latest, null, 2));
      const startBlock = latest ? parseInt(latest.blockNumber) + 1: 0;
      console.log(now() + " punksModule - actions.syncTokenEvents - startBlock: " + startBlock + ", latestBlockNumber: " + latestBlockNumber);
      await getTokenLogsFromRange(startBlock, latestBlockNumber);
      context.commit('setLookups', { addresses, addressesIndex, txHashes, txHashesIndex });

      db.close();
      context.dispatch("collateEventData");
      context.commit('setSyncInfo', null);
      context.commit('setSyncHalt', false);
    },
    async collateEventData(context) {
      console.log(now() + " punksModule - actions.collateEventData");
      const chainId = store.getters["chainId"];
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);

      const BATCH_SIZE = 100000;
      let rows = 0;
      let done = false;
      const owners = [];
      const bids = {};
      const offers = {};
      do {
        const data = await db.punkEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, CRYPTOPUNKSMARKET_V2_ADDRESS, Dexie.minKey, Dexie.minKey],[chainId, CRYPTOPUNKSMARKET_V2_ADDRESS, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(BATCH_SIZE).toArray();
        for (const item of data) {
          const info = item.info;
          if (info[2] == PUNKEVENT_ASSIGN) {
            // console.log(now() + " punksModule - actions.collateEventData - ASSIGN blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
            owners[info[4]] = info[3];
          } else if (info[2] == PUNKEVENT_TRANSFER) {
            // console.log(now() + " punksModule - actions.collateEventData - TRANSFER blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
          } else if (info[2] == PUNKEVENT_PUNKTRANSFER) {
            // console.log(now() + " punksModule - actions.collateEventData - PUNKTRANSFER blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
            owners[info[5]] = info[4];
          } else if (info[2] == PUNKEVENT_PUNKOFFERED) {
            // event PunkOffered(uint indexed punkIndex, uint minValue, address indexed toAddress);
            // [241748,28,3,6456,"25000000000000000000",0]
            if (info[3] == 6456) {
              console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKOFFERED blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
            }
            offers[info[3]] = [ info[4], info[5] ];
            // TODO
          } else if (info[2] == PUNKEVENT_PUNKBIDENTERED) {
            // event PunkBidEntered(uint indexed punkIndex, uint value, address indexed fromAddress);
            if (info[3] == 6456) {
              console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKBIDENTERED blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
            }
            bids[info[3]] = [ info[4], info[5] ];
            // TODO
          } else if (info[2] == PUNKEVENT_PUNKBIDWITHDRAWN) {
            // event PunkBidWithdrawn(uint indexed punkIndex, uint value, address indexed fromAddress);
            if (info[3] == 6456) {
              console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKBIDWITHDRAWN blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
            }
            delete bids[info[3]];
            // TODO
          } else if (info[2] == PUNKEVENT_PUNKBOUGHT) {
            // event PunkBought(uint indexed punkIndex, uint value, address indexed fromAddress, address indexed toAddress);
            if (info[3] == 6456) {
              console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKBOUGHT blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
            }
            owners[info[3]] = info[6];
            // TODO: Cancel offers
          } else if (info[2] == PUNKEVENT_PUNKNOLONGERFORSALE) {
            // event PunkNoLongerForSale(uint indexed punkIndex);
            if (info[3] == 6456) {
              console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKNOLONGERFORSALE blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
            }
            delete offers[info[3]];
            // TODO
          } else {
            // console.log(now() + " punksModule - actions.collateEventData - OTHER blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
          }
        }
        rows = parseInt(rows) + data.length;
        console.log(now() + " punksModule - actions.collateEventData - rows: " + rows);
        done = data.length < BATCH_SIZE;
      } while (!done);
      console.log(now() + " punksModule - actions.collateEventData - rows: " + rows);
      // console.log(now() + " punksModule - actions.collateEventData - Object.keys(owners).length: " + Object.keys(owners).length);
      // console.log(now() + " punksModule - actions.collateEventData - owners: " + JSON.stringify(owners, null, 2));
      console.log(now() + " punksModule - actions.collateEventData - Object.keys(bids).length: " + Object.keys(bids).length);
      console.log(now() + " punksModule - actions.collateEventData - bids: " + JSON.stringify(bids, null, 2));
      // console.log(now() + " punksModule - actions.collateEventData - Object.keys(offers).length: " + Object.keys(offers).length);
      // console.log(now() + " punksModule - actions.collateEventData - offers: " + JSON.stringify(offers, null, 2));
      // context.commit('setEventInfo', { numberOfEvents: rows, balances, tokens, approvals, approvalForAlls });
      context.commit('setEventInfo', { numberOfEvents: rows, owners, bids, offers });
      // TODO: Persist numberOfEvents?
      await dbSaveCacheData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_data", { numberOfEvents: rows, owners, bids, offers });
      db.close();
    },
  },
};
