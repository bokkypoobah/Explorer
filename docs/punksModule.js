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
    last: {},

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
    last: state => state.last,

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
    setEventInfo(state, { numberOfEvents, owners, bids, offers, last }) {
      console.log(now() + " tokenModule - mutations.setEventInfo - numberOfEvents: " + JSON.stringify(numberOfEvents));
      state.numberOfEvents = numberOfEvents;
      state.owners = owners;
      state.bids = bids;
      state.offers = offers;
      state.last = last || {};
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
      const last = info.last || {};
      context.commit('setEventInfo', { numberOfEvents, owners, bids, offers, last });

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

      // event Assign(address indexed to, uint256 punkIndex);
      // event Transfer(address indexed from, address indexed to, uint256 value);
      // event PunkTransfer(address indexed from, address indexed to, uint256 punkIndex);
      // event PunkOffered(uint indexed punkIndex, uint minValue, address indexed toAddress);
      // event PunkBidEntered(uint indexed punkIndex, uint value, address indexed fromAddress);
      // event PunkBidWithdrawn(uint indexed punkIndex, uint value, address indexed fromAddress);
      // event PunkBought(uint indexed punkIndex, uint value, address indexed fromAddress, address indexed toAddress);
      // event PunkNoLongerForSale(uint indexed punkIndex);
      // id, [from, to, value, buyOrAcceptBid ]

      let lastTransferTo_ = null; // acceptBidForPunk() emits PunkBought with toAddress = 0x0, so using last Transfer to address

      async function processLogs(fromBlock, toBlock, logs) {
        console.log(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", logs.length: " + logs.length);
        const records = [];
        for (const log of logs) {
          if (!log.removed) {
            let data = null;
            const logData = punkInterface.parseLog(log);
            const type = PUNKEVENT_STRING_TO_INT[logData.eventFragment.name];
            if (type == PUNKEVENT_ASSIGN) {
              const [ to_, id_ ] = logData.args;
              data = { id: parseInt(id_), to: getAddressIndex(to_) };
            } else if (type == PUNKEVENT_TRANSFER) {
              // Ignoring Transfer events, save the transfer to for acceptBidForPunk where the to value is set to 0x0
              const [ from_, to_, value_ ] = logData.args;
              lastTransferTo_ = to_;
            } else if (type == PUNKEVENT_PUNKTRANSFER) {
              const [ from_, to_, id_ ] = logData.args;
              data = { id: parseInt(id_), from: getAddressIndex(from_), to: getAddressIndex(to_) };
            } else if (type == PUNKEVENT_PUNKOFFERED) {
              const [ id_, minValue_, toAddress_ ] = logData.args;
              data = { id: parseInt(id_), to: getAddressIndex(toAddress_), value: ethers.BigNumber.from(minValue_).toString() };
            } else if (type == PUNKEVENT_PUNKBIDENTERED) {
              const [ id_, value_, fromAddress_ ] = logData.args;
              data = { id: parseInt(id_), from: getAddressIndex(fromAddress_), value: ethers.BigNumber.from(value_).toString() };
            } else if (type == PUNKEVENT_PUNKBIDWITHDRAWN) {
              const [ id_, value_, fromAddress_ ] = logData.args;
              data = { id: parseInt(id_), from: getAddressIndex(fromAddress_), value: ethers.BigNumber.from(value_).toString() };
            } else if (type == PUNKEVENT_PUNKBOUGHT) {
              const [ id_, value_, fromAddress_, toAddress_ ] = logData.args;
              // buyOrAcceptBid = 0 if buyPunk and 1 if acceptBidForPunk - there's a bug in the contract that sets toAddress_ to 0x0, so using last Transfer to_
              data = { id: parseInt(id_), from: getAddressIndex(fromAddress_), to: getAddressIndex(toAddress_ == ADDRESS0 ? lastTransferTo_ : toAddress_), value: ethers.BigNumber.from(value_).toString(), buyOrAcceptBid: toAddress_ == ADDRESS0 ? 1 : 0 };
            } else if (type == PUNKEVENT_PUNKNOLONGERFORSALE) {
              const [ id_ ] = logData.args;
              data = { id: parseInt(id_) };
            }
            if (data) {
              records.push({
                chainId,
                address: log.address,
                blockNumber: log.blockNumber,
                logIndex: log.logIndex,
                txHash: getTxHashIndex(log.transactionHash),
                txIndex: log.transactionIndex,
                type,
                ...data,
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
      const last = {};
      do {
        const data = await db.punkEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, CRYPTOPUNKSMARKET_V2_ADDRESS, Dexie.minKey, Dexie.minKey],[chainId, CRYPTOPUNKSMARKET_V2_ADDRESS, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(BATCH_SIZE).toArray();
        for (const item of data) {
          // const info = item.info;
          if (item.type == PUNKEVENT_ASSIGN) {
            // console.log(now() + " punksModule - actions.collateEventData - ASSIGN blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
            owners[item.id] = item.to;
          } else if (item.type == PUNKEVENT_TRANSFER) {
            // console.log(now() + " punksModule - actions.collateEventData - TRANSFER blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
          } else if (item.type == PUNKEVENT_PUNKTRANSFER) {
            // console.log(now() + " punksModule - actions.collateEventData - PUNKTRANSFER blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
            owners[item.id] = item.to;
          } else if (item.type == PUNKEVENT_PUNKOFFERED) {
            // event PunkOffered(uint indexed punkIndex, uint minValue, address indexed toAddress);
            // if (info[3] == 1234) {
            //   console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKOFFERED blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
            // }
            offers[item.id] = { to: item.to, value: item.value };
          } else if (item.type == PUNKEVENT_PUNKBIDENTERED) {
            // event PunkBidEntered(uint indexed punkIndex, uint value, address indexed fromAddress);
            // if (info[3] == 1234) {
            //   console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKBIDENTERED blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
            // }
            bids[item.id] = { from: item.from, value: item.value };
          } else if (item.type == PUNKEVENT_PUNKBIDWITHDRAWN) {
            // event PunkBidWithdrawn(uint indexed punkIndex, uint value, address indexed fromAddress);
            // if (info[3] == 1234) {
            //   console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKBIDWITHDRAWN blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
            // }
            delete bids[item.id];
          } else if (item.type == PUNKEVENT_PUNKBOUGHT) {
            // event PunkBought(uint indexed punkIndex, uint value, address indexed fromAddress, address indexed toAddress);
            // Last parameter - buyOrAcceptBid = 0 if buyPunk and 1 if acceptBidForPunk - there's a bug in the contract that sets toAddress to 0x0
            if (item.buyOrAcceptBid == 0) {
              // function buyPunk(uint punkIndex) payable {
              //     if (!allPunksAssigned) throw;
              //     Offer offer = punksOfferedForSale[punkIndex];
              //     if (punkIndex >= 10000) throw;
              //     if (!offer.isForSale) throw;                // punk not actually for sale
              //     if (offer.onlySellTo != 0x0 && offer.onlySellTo != msg.sender) throw;  // punk not supposed to be sold to this user
              //     if (msg.value < offer.minValue) throw;      // Didn't send enough ETH
              //     if (offer.seller != punkIndexToAddress[punkIndex]) throw; // Seller no longer owner of punk
              //
              //     address seller = offer.seller;
              //
              //     punkIndexToAddress[punkIndex] = msg.sender;
              //     balanceOf[seller]--;
              //     balanceOf[msg.sender]++;
              //     Transfer(seller, msg.sender, 1);
              //
              //     punkNoLongerForSale(punkIndex);
              //     pendingWithdrawals[seller] += msg.value;
              //     PunkBought(punkIndex, msg.value, seller, msg.sender);
              //
              //     // Check for the case where there is a bid from the new owner and refund it.
              //     // Any other bid can stay in place.
              //     Bid bid = punkBids[punkIndex];
              //     if (bid.bidder == msg.sender) {
              //         // Kill bid and refund value
              //         pendingWithdrawals[msg.sender] += bid.value;
              //         punkBids[punkIndex] = Bid(false, punkIndex, 0x0, 0);
              //     }
              // }
              // if (info[3] == 1234) {
              //   console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKBOUGHT BUY blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
              //   console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKBOUGHT - bid: " + JSON.stringify(bids[info[3]]));
              // }
              // // Check for the case where there is a bid from the new owner and refund it.
              // if (bids[info[3]] && info[3] == bids[info[3]][1]) {
              //   console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKBOUGHT - DELETING bid: " + JSON.stringify(bids[info[3]]));
              //   delete bids[info[3]];
              // }
              last[item.id] = item.value;
              delete offers[item.id];
            } else {
              // function acceptBidForPunk(uint punkIndex, uint minPrice) {
              //     if (punkIndex >= 10000) throw;
              //     if (!allPunksAssigned) throw;
              //     if (punkIndexToAddress[punkIndex] != msg.sender) throw;
              //     address seller = msg.sender;
              //     Bid bid = punkBids[punkIndex];
              //     if (bid.value == 0) throw;
              //     if (bid.value < minPrice) throw;
              //
              //     punkIndexToAddress[punkIndex] = bid.bidder;
              //     balanceOf[seller]--;
              //     balanceOf[bid.bidder]++;
              //     Transfer(seller, bid.bidder, 1);
              //
              //     punksOfferedForSale[punkIndex] = Offer(false, punkIndex, bid.bidder, 0, 0x0);
              //     uint amount = bid.value;
              //     punkBids[punkIndex] = Bid(false, punkIndex, 0x0, 0);
              //     pendingWithdrawals[seller] += amount;
              //     PunkBought(punkIndex, bid.value, seller, bid.bidder);
              // }
              // if (info[3] == 1234) {
              //   console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKBOUGHT ACCEPT BID blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
              //   console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKBOUGHT - CURRENT bid: " + JSON.stringify(bids[info[3]]));
              // }
              last[item.id] = bids[item.id].value;
              delete bids[item.id];
              delete offers[item.id];
            }
            owners[item.id] = item.to;
            // if (info[3] == 1234) {
            //   console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKBOUGHT - last[info[3]]: " + JSON.stringify(last[info[3]]));
            // }
          } else if (item.type == PUNKEVENT_PUNKNOLONGERFORSALE) {
            // event PunkNoLongerForSale(uint indexed punkIndex);
            // if (info[3] == 1234) {
            //   console.error(now() + " punksModule - actions.collateEventData - TRACE PUNKNOLONGERFORSALE blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
            // }
            delete offers[item.id];
          } else {
            // console.log(now() + " punksModule - actions.collateEventData - OTHER blockNumber: " + item.blockNumber + ", info: " + JSON.stringify(info));
          }
        }
        rows = parseInt(rows) + data.length;
        console.log(now() + " punksModule - actions.collateEventData - rows: " + rows);
        done = data.length < BATCH_SIZE;
      } while (!done);
      console.log(now() + " punksModule - actions.collateEventData - rows: " + rows);
      console.log(now() + " punksModule - actions.collateEventData - Object.keys(owners).length: " + Object.keys(owners).length);
      // console.log(now() + " punksModule - actions.collateEventData - owners: " + JSON.stringify(owners, null, 2));
      // console.log(now() + " punksModule - actions.collateEventData - Object.keys(bids).length: " + Object.keys(bids).length);
      // console.log(now() + " punksModule - actions.collateEventData - bids: " + JSON.stringify(bids, null, 2));
      // console.log(now() + " punksModule - actions.collateEventData - Object.keys(offers).length: " + Object.keys(offers).length);
      // console.log(now() + " punksModule - actions.collateEventData - offers: " + JSON.stringify(offers, null, 2));
      console.log(now() + " punksModule - actions.collateEventData - Object.keys(last).length: " + Object.keys(last).length);
      // console.log(now() + " punksModule - actions.collateEventData - last[1234]: " + JSON.stringify(last[1234], null, 2));
      console.log(now() + " punksModule - actions.collateEventData - last: " + JSON.stringify(last, null, 2));
      context.commit('setEventInfo', { numberOfEvents: rows, owners, bids, offers, last });
      await dbSaveCacheData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_data", { numberOfEvents: rows, owners, bids, offers, last });
      db.close();
    },
  },
};
