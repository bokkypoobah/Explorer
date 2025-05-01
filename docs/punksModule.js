const punksModule = {
  namespaced: true,
  state: {
    attributes: [],
    sync: {
      info: null,
      completed: null,
      total: null,
      halt: false,
    },
  },
  getters: {
    attributes: state => state.attributes,
    sync: state => state.sync,
  },
  mutations: {
    setAttributes(state, attributes) {
      // console.log(now() + " punksModule - mutations.setAttributes - attributes: " + JSON.stringify(attributes));
      state.attributes = attributes;
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
        console.log(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", logs.length: " + logs.length + ", type: " + context.state.info.type);
        const records = [];
        // for (const log of logs) {
        //   if (!log.removed) {
        //     let info = null;
        //     // ERC-20 Transfer (index_topic_1 address from, index_topic_2 address to, uint256 tokens)
        //     // ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
        //     if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
        //       if (log.topics.length == 3 && context.state.info.type == "erc20") {
        //         const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        //         const to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
        //         const tokens = ethers.BigNumber.from(log.data).toString();
        //         info = [ TOKENEVENT_TRANSFER, getAddressIndex(from), getAddressIndex(to), tokens ];
        //
        //       } else if (log.topics.length == 4 && context.state.info.type == "erc721") {
        //         const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        //         const to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
        //         const tokenId = ethers.BigNumber.from(log.topics[3]).toString();
        //         info = [ TOKENEVENT_TRANSFER, getAddressIndex(from), getAddressIndex(to), tokenId ];
        //       }
        //
        //     // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
        //     } else if (log.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
        //       const logData = erc1155Interface.parseLog(log);
        //       const [ operator, from, to, tokenId, value ] = logData.args;
        //       info = [ TOKENEVENT_TRANSFERSINGLE, getAddressIndex(operator), getAddressIndex(from), getAddressIndex(to), ethers.BigNumber.from(tokenId).toString(), ethers.BigNumber.from(value).toString() ];
        //
        //     // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
        //     } else if (log.topics[0] == "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb") {
        //       const logData = erc1155Interface.parseLog(log);
        //       const [ operator, from, to, tokenIds, values ] = logData.args;
        //       info = [ TOKENEVENT_TRANSFERBATCH, getAddressIndex(operator), getAddressIndex(from), getAddressIndex(to), tokenIds.map(e => ethers.BigNumber.from(e).toString()), values.map(e => ethers.BigNumber.from(e).toString()) ];
        //
        //     // WETH Deposit (index_topic_1 address dst, uint256 wad)
        //     } else if (log.topics[0] == "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c") {
        //       const from = ADDRESS0;
        //       const to = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        //       const tokens = ethers.BigNumber.from(log.data).toString();
        //       info = [ TOKENEVENT_TRANSFER, getAddressIndex(from), getAddressIndex(to), tokens ];
        //
        //     // WETH Withdrawal (index_topic_1 address src, uint256 wad)
        //     } else if (log.topics[0] == "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65") {
        //       info = { event: "Withdrawal" };
        //       const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        //       const to = ADDRESS0;
        //       const tokens = ethers.BigNumber.from(log.data).toString();
        //       info = [ TOKENEVENT_TRANSFER, getAddressIndex(from), getAddressIndex(to), tokens ];
        //
        //     // ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
        //     // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
        //     } else if (log.topics[0] == "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925") {
        //       if (log.topics.length == 3 && context.state.info.type == "erc20") {
        //         const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        //         const spender = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
        //         const tokens = ethers.BigNumber.from(log.data).toString();
        //         info = [ TOKENEVENT_APPROVAL, getAddressIndex(owner), getAddressIndex(spender), tokens ];
        //
        //       } else if (log.topics.length == 4 && context.state.info.type == "erc721") {
        //         const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        //         const approved = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
        //         const tokenId = ethers.BigNumber.from(log.topics[3]).toString();
        //         info = [ TOKENEVENT_APPROVAL, getAddressIndex(owner), getAddressIndex(approved), tokenId ];
        //       }
        //
        //     // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
        //     // ERC-1155 ApprovalForAll (index_topic_1 address account, index_topic_2 address operator, bool approved)
        //     } else if (log.topics[0] == "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31") {
        //       const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
        //       const operator = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
        //       approved = ethers.BigNumber.from(log.data).eq(1);
        //       info = [ TOKENEVENT_APPROVALFORALL, getAddressIndex(owner), getAddressIndex(operator), approved ];
        //
        //     }
        //     if (info) {
        //       records.push({
        //         chainId,
        //         address: log.address,
        //         blockNumber: log.blockNumber,
        //         logIndex: log.logIndex,
        //         info: [ getTxHashIndex(log.transactionHash), log.transactionIndex, ...info ],
        //       });
        //     }
        //   }
        // }
        // // console.log(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", records: " + JSON.stringify(records, null, 2));
        // if (records.length > 0) {
        //   await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_punk_addresses", addresses);
        //   await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_punk_addressesIndex", addressesIndex);
        //   await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_punk_txHashes", txHashes);
        //   await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_punk_txHashesIndex", txHashesIndex);
        //
        //   await db.tokenEvents.bulkAdd(records).then(function(lastKey) {
        //     console.log(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - bulkAdd lastKey: " + JSON.stringify(lastKey));
        //     }).catch(Dexie.BulkError, function(e) {
        //       console.log(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.processLogs - bulkAdd e: " + JSON.stringify(e.failures, null, 2));
        //     });
        // }
      }

      async function getTokenLogsFromRange(fromBlock, toBlock) {
        console.log(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.getTokenLogsFromRange - fromBlock: " + fromBlock + ", toBlock: " + toBlock);
        if (context.state.sync.halt) {
          return;
        }
        try {
          topics = [[
              // ERC-20 Transfer (index_topic_1 address from, index_topic_2 address to, uint256 tokens)
              // ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
              // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
              '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
              // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
              '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
              // WETH Deposit (index_topic_1 address dst, uint256 wad)
              '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
              // WETH Withdrawal (index_topic_1 address src, uint256 wad)
              '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
              // ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
              // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
              '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
              // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
              // ERC-1155 ApprovalForAll (index_topic_1 address account, index_topic_2 address operator, bool approved)
              '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31',
            ],
          ];
          const logs = await provider.getLogs({
            address: CRYPTOPUNKSMARKET_V2_ADDRESS,
            fromBlock,
            toBlock,
            topics: [],
          });
          console.log(moment().format("HH:mm:ss") + " punksModule - actions.syncTokenEvents.getTokenLogsFromRange - logs: " + JSON.stringify(logs, null, 2));
          // await processLogs(fromBlock, toBlock, logs);
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
      const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);

      const addresses = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_addresses", []);
      const addressesIndex = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_addressesIndex", {});
      const txHashes = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_txHashes", []);
      const txHashesIndex = await dbGetCachedData(db, CRYPTOPUNKSMARKET_V2_ADDRESS + "_" + chainId + "_punk_txHashesIndex", {});

      const address0Index = getAddressIndex(ADDRESS0);
      const tokenIndex = getAddressIndex(CRYPTOPUNKSMARKET_V2_ADDRESS);

      let info = {};
      const block = await provider.getBlock();
      // const latestBlockNumber = block && block.number || null;
      const latestBlockNumber = parseInt(3914495) + 10000;
      context.commit('setSyncTotal', latestBlockNumber);
      context.commit('setSyncCompleted', 0);
      context.commit('setSyncInfo', "Syncing token events");
      // const latest = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, validatedAddress, Dexie.minKey, Dexie.minKey],[chainId, validatedAddress, Dexie.maxKey, Dexie.maxKey]).last();
      // console.log(now() + " punksModule - actions.syncTokenEvents - latest: " + JSON.stringify(latest, null, 2));
      // const startBlock = latest ? parseInt(latest.blockNumber) + 1: 0;
      // TODO: Testing
      // const startBlock = latestBlockNumber - 10000;
      const startBlock = 3914495;
      console.log(now() + " punksModule - actions.syncTokenEvents - startBlock: " + startBlock + ", latestBlockNumber: " + latestBlockNumber);
      await getTokenLogsFromRange(startBlock, latestBlockNumber);
      // context.commit('setLookups', { addresses, addressesIndex, txHashes, txHashesIndex });

      db.close();
      // context.dispatch("collateEventData", inputAddress);
      context.commit('setSyncInfo', null);
      context.commit('setSyncHalt', false);
    },
  },
};
