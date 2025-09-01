const portfolioModule = {
  namespaced: true,
  state: {
    inputTagOrAddress: null,
    addresses: {},
    data: {},
    data: {},
    metadata: {},
    sync: {
      info: null,
      completed: null,
      total: null,
      halt: false,
    },
  },
  getters: {
    inputTagOrAddress: state => state.inputTagOrAddress,
    addresses: state => state.addresses,
    data: state => state.data,
    metadata: state => state.metadata,
    sync: state => state.sync,
  },
  mutations: {
    setInputData(state, { inputTagOrAddress, addresses }) {
      console.log(now() + " portfolioModule - mutations.setInputData - inputTagOrAddress: " + inputTagOrAddress + ", addresses: " + JSON.stringify(addresses));
      state.inputTagOrAddress = inputTagOrAddress;
      state.addresses = addresses;
    },
    setData(state, data) {
      // console.log(now() + " portfolioModule - mutations.setData - data: " + JSON.stringify(data));
      state.data = data;
    },
    setMetadata(state, metadata) {
      // console.log(now() + " portfolioModule - mutations.setMetadata - metadata: " + JSON.stringify(metadata));
      state.metadata = metadata;
    },
    setSyncInfo(state, info) {
      // console.log(now() + " portfolioModule - mutations.setSyncInfo - info: " + info);
      state.sync.info = info;
    },
    setSyncCompleted(state, completed) {
      // console.log(now() + " portfolioModule - mutations.setSyncCompleted - completed: " + completed);
      state.sync.completed = completed;
    },
    setSyncTotal(state, total) {
      // console.log(now() + " portfolioModule - mutations.setSyncTotal - total: " + total);
      state.sync.total = total;
    },
    setSyncHalt(state, halt) {
      // console.log(now() + " portfolioModule - mutations.setSyncHalt - halt: " + halt);
      state.sync.halt = halt;
    },
  },
  actions: {
    async loadPortfolio(context, { inputTagOrAddress, forceUpdate }) {
      console.log(now() + " portfolioModule - actions.loadPortfolio - inputTagOrAddress: " + inputTagOrAddress + ", forceUpdate: " + forceUpdate);
      const addressBook = store.getters['addressBook/addresses'];
      const tags = store.getters['addressBook/tags'];
      const addresses = {};
      if (inputTagOrAddress in tags) {
        for (let tag of tags[inputTagOrAddress]) {
          addresses[tag.address] = addressBook[tag.address];
        }
      } else if (validateAddress(inputTagOrAddress) != null) {
        const validatedInputAddress = validateAddress(inputTagOrAddress);
        if (validatedInputAddress in addressBook) {
          addresses[validatedInputAddress] = addressBook[validatedInputAddress];
        } else {
          addresses[validatedInputAddress] = "Manual input";
        }
      }
      // console.log(now() + " portfolioModule - actions.loadPortfolio - addresses: " + JSON.stringify(addresses));
      context.commit('setInputData', { inputTagOrAddress, addresses });

      const chainId = store.getters["web3/chainId"];
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      let metadata = await dbGetCachedData(db, "portfolio_metadata", {});
      // console.log(now() + " portfolioModule - actions.loadPortfolio - portfolio_metadata: " + JSON.stringify(metadata, null, 2));
      context.commit('setMetadata', metadata);
      db.close();
      context.dispatch("collateData");
    },
    async syncPortfolio(context, { forceUpdate }) {
      console.log(now() + " portfolioModule - actions.syncPortfolio - forceUpdate: " + forceUpdate);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const chainId = store.getters["web3/chainId"];
      const block = await provider.getBlock();
      const blockNumber = block && block.number || null;
      console.log(now() + " portfolioModule - actions.syncPortfolio - blockNumber: " + blockNumber);
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);

      context.commit('setSyncTotal', Object.keys(context.state.addresses).length);
      let completed = 0;
      // console.log(now() + " portfolioModule - actions.syncPortfolio - context.state.addresses: " + JSON.stringify(context.state.addresses));
      for (const [address, addressInfo] of Object.entries(context.state.addresses)) {
        context.commit('setSyncInfo', "Syncing balances and events " + address.substring(0, 6) + "..." + address.slice(-4));
        context.commit('setSyncCompleted', ++completed);
        console.log(now() + " portfolioModule - actions.syncPortfolio - processing - address: " + address + " => " + JSON.stringify(addressInfo));
        let addressData = await dbGetCachedData(db, address + "_portfolio_address_data", {});
        await syncPortfolioAddress(address, addressData, provider, chainId);
        console.log(now() + " portfolioModule - actions.syncPortfolio - processing address - addressData: " + JSON.stringify(addressData, null, 2));
        await syncPortfolioAddressEvents(address, addressData, provider, db, chainId);
        console.log(now() + " portfolioModule - actions.syncPortfolio - processing events - addressData: " + JSON.stringify(addressData, null, 2));
        await dbSaveCacheData(db, address + "_portfolio_address_data", JSON.parse(JSON.stringify(addressData)));
      }
      context.commit('setSyncCompleted', ++completed);
      db.close();

      context.dispatch("syncMetadata");
      context.dispatch("collateData");
      context.commit('setSyncInfo', null);
      context.commit('setSyncHalt', false);
    },

    // x ERC-20 Transfer (index_topic_1 address from, index_topic_2 address to, uint256 tokens)
    // v ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
    // '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    // v ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
    // '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
    // v ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
    // '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
    // x WETH Deposit (index_topic_1 address dst, uint256 wad)
    // '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
    // x WETH Withdrawal (index_topic_1 address src, uint256 wad)
    // '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
    // x ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
    // v ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
    // '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
    // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
    // ERC-1155 ApprovalForAll (index_topic_1 address account, index_topic_2 address operator, bool approved)
    // '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31',
    async syncMetadata(context) {
      console.error(now() + " portfolioModule - actions.syncMetadata");
      const BATCH_SIZE = 10000;
      const tokenTopics = {
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": "ERC-20/721 Transfer",
        "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62": "ERC-1155 TransferSingle",
        "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb": "ERC-1155 TransferBatch",
        "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c": "WETH Deposit",
        "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65": "WETH Withdrawal",
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": "ERC-20/721 Approval",
        "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31": "ERC-1155 ApprovalForAll",
      };
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const chainId = store.getters["web3/chainId"];
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);
      const metadata = await dbGetCachedData(db, "portfolio_metadata", {});
      // TODO
      // const metadata = {};
      if (!(chainId in metadata)) {
        metadata[chainId] = {};
      }

      const toProcess = {};
      let rows = 0;
      for (const [address, addressInfo] of Object.entries(context.state.addresses)) {
        console.error(now() + " portfolioModule - actions.syncMetadata - address: " + address);
        let done = false;
        do {
          const logs = await db.addressEvents.where('[address+chainId+blockNumber+logIndex]').between([address, Dexie.minKey, Dexie.minKey, Dexie.minKey],[address, Dexie.maxKey, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(BATCH_SIZE).toArray();
          for (const log of logs) {
            if (log.topics[0] in tokenTopics) {
              // console.error(now() + " portfolioModule - actions.syncMetadata - log: " + JSON.stringify(log, null, 2));
              if (!(log.contract in metadata[chainId])) {
                if (!(log.contract in toProcess)) {
                  toProcess[log.contract] = {};
                }
                // ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
                if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" && log.topics.length == 4) {
                  // console.error(now() + " portfolioModule - actions.syncMetadata - ERC-721 Transfer log: " + JSON.stringify(log, null, 2));
                  const tokenId = ethers.BigNumber.from(log.topics[3]).toString();
                  if (!(tokenId in toProcess[log.contract])) {
                    toProcess[log.contract][tokenId] = true;
                  }
                // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
                } else if (log.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
                  // console.error(now() + " portfolioModule - actions.syncMetadata - ERC-1155 TransferSingle log: " + JSON.stringify(log, null, 2));
                  const tokenId = ethers.BigNumber.from(log.data.substring(0, 66)).toString();
                  const count = ethers.BigNumber.from("0x" + log.data.substring(66, 130)).toString();
                  if (!(tokenId in toProcess[log.contract])) {
                    // toProcess[log.contract][tokenId] = count;
                    toProcess[log.contract][tokenId] = true;
                  }
                // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
                } else if (log.topics[0] == "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb") {
                  // console.error(now() + " portfolioModule - actions.syncMetadata - ERC-1155 TransferBatch log: " + JSON.stringify(log, null, 2));
                  const logData = erc1155Interface.parseLog(log);
                  const [ operator, from, to, tokenIds, values ] = logData.args;
                  for (const [index, tokenId] of tokenIds.entries()) {
                    const _tokenId = ethers.BigNumber.from(tokenId).toString();
                    const _value = ethers.BigNumber.from(values[index]).toString();
                    // toProcess[log.contract][_tokenId] = _value;
                    toProcess[log.contract][_tokenId] = true;
                  }
                // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
                } else if (log.topics[0] == "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925" && log.topics.length == 4) {
                  // console.error(now() + " portfolioModule - actions.syncMetadata - ERC-721 Approval log: " + JSON.stringify(log, null, 2));
                  const tokenId = ethers.BigNumber.from(log.topics[3]).toString();
                  if (!(tokenId in toProcess[log.contract])) {
                    toProcess[log.contract][tokenId] = true;
                  }
                }
              }
            }
          }
          rows = parseInt(rows) + logs.length;
          console.log(now() + " portfolioModule - actions.syncMetadata - rows: " + rows);
          done = logs.length < BATCH_SIZE;
        } while (!done);
      }
      console.error(now() + " portfolioModule - actions.syncMetadata - toProcess: " + JSON.stringify(toProcess, null, 2));

      context.commit('setSyncTotal', Object.keys(toProcess).length);
      let completed = 0;
      for (let address of Object.keys(toProcess)) {
        if (context.state.sync.halt) {
          break;
        }
        console.error(now() + " portfolioModule - actions.syncMetadata - processing - address: " + address);
        const info = await getAddressInfo(address, provider);
        console.error(now() + " portfolioModule - actions.syncMetadata - processing - info: " + JSON.stringify(info, null, 2));
        if (info.type == "erc20") {
          metadata[chainId][address] = { type: info.type, ensName: info.ensName, balance: info.balance, name: info.name, symbol: info.symbol, decimals: info.decimals, totalSupply: info.totalSupply };
        } else {
          metadata[chainId][address] = { type: info.type, ensName: info.ensName, balance: info.balance, name: info.name, symbol: info.symbol, decimals: info.decimals, totalSupply: info.totalSupply, tokens: toProcess[address] };
        }
        context.commit('setSyncInfo', "Syncing contract metadata for " + address.substring(0, 6) + "..." + address.slice(-4) + " => " + info.name);
        context.commit('setSyncCompleted', ++completed);
      }
      console.error(now() + " portfolioModule - actions.syncMetadata - metadata: " + JSON.stringify(metadata, null, 2));

      const metadataToRetrieve = [];
      for (const [tokenContract, tokenContractData] of Object.entries(metadata[chainId])) {
        if (tokenContractData.type == "erc721" || tokenContractData.type == "erc1155") {
          console.error(now() + " portfolioModule - actions.syncMetadata - tokenContract: " + tokenContract + " => " + JSON.stringify(tokenContractData, null, 2));
          for (const [tokenId, tokenData] of Object.entries(tokenContractData.tokens)) {
            if (tokenData === true) {
              console.error(now() + " portfolioModule - actions.syncMetadata - tokenContract: " + tokenContract + "/" + tokenId + " => " + JSON.stringify(tokenData, null, 2));
              metadataToRetrieve.push({ tokenContract, tokenId });
            }
          }
        }
      }
      console.error(now() + " portfolioModule - actions.syncMetadata - metadataToRetrieve: " + JSON.stringify(metadataToRetrieve, null, 2));

      context.commit('setMetadata', metadata);
      await dbSaveCacheData(db, "portfolio_metadata", metadata);
      db.close();
      context.commit('setSyncInfo', null);
    },

    async collateData(context) {
      console.log(now() + " portfolioModule - actions.collateData");
      const chainId = store.getters["web3/chainId"];
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);

      let metadata = await dbGetCachedData(db, "portfolio_metadata", {});
      console.error(now() + " portfolioModule - actions.collateData - processing - metadata: " + JSON.stringify(metadata));
      const data = {};
      for (const [address, addressInfo] of Object.entries(context.state.addresses)) {
        console.log(now() + " portfolioModule - actions.collateData - address: " + address + " => " + JSON.stringify(addressInfo));
        let addressData = await dbGetCachedData(db, address + "_portfolio_address_data", {});
        console.log(now() + " portfolioModule - actions.collateData - processing - addressData: " + JSON.stringify(addressData));
        data[address] = {
          ...addressData,
        };
        await collatePortfolioAddress(address, data, db, chainId);
      }

      context.commit('setData', data);
      await dbSaveCacheData(db, chainId + "_portfolio_data", data);
      db.close();
      context.commit('setSyncInfo', null);
      context.commit('setSyncHalt', false);
    },

    // async loadToken(context, { inputAddress, forceUpdate }) {
    //   return;
    //   const validatedAddress = validateAddress(inputAddress);
    //   if (!validatedAddress) {
    //     // TODO: Handle error in UI
    //     console.error(now() + " portfolioModule - actions.loadToken - INVALID inputAddress: " + inputAddress + ", forceUpdate: " + forceUpdate);
    //     return;
    //   }
    //
    //   console.log(now() + " portfolioModule - actions.loadToken - inputAddress: " + inputAddress + ", forceUpdate: " + forceUpdate);
    //   // TODO - handle offline
    //   // if (!store.getters['web3'].connected || !window.ethereum) {
    //   //   error = "Not connected";
    //   // }
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const chainId = store.getters["web3/chainId"];
    //   const dbInfo = store.getters["db"];
    //   const db = new Dexie(dbInfo.name);
    //   db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
    //
    //   let info = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_token", {});
    //   // console.log(now() + " portfolioModule - actions.loadToken - info: " + JSON.stringify(info));
    //   if (Object.keys(info).length == 0 || forceUpdate) {
    //     info = await getAddressInfo(validatedAddress, provider);
    //     console.log(now() + " portfolioModule - actions.loadToken - info: " + JSON.stringify(info));
    //     await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_token", info);
    //   }
    //   const addressInfo = store.getters["addresses/getAddressInfo"](validatedAddress);
    //   // console.log(now() + " portfolioModule - actions.loadToken - addressInfo: " + JSON.stringify(addressInfo));
    //   if (!addressInfo.type) {
    //     store.dispatch("addresses/addAddress", { address: validatedAddress, type: info.type, version: info.version, ensName: info.ensName });
    //   }
    //   const addresses = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_token_addresses", []);
    //   const addressesIndex = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_token_addressesIndex", {});
    //   const txHashes = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_token_txHashes", []);
    //   const txHashesIndex = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_token_txHashesIndex", {});
    //   context.commit('setLookups', { addresses, addressesIndex, txHashes, txHashesIndex });
    //
    //   const metadata = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_token_metadata", {});
    //   context.commit('setMetadata', metadata);
    //
    //   context.commit('setInfo', info);
    //
    //   context.dispatch("collateEventData", inputAddress);
    //   db.close();
    // },
    setSyncHalt(context) {
      console.log(moment().format("HH:mm:ss") + " portfolioModule - actions.setSyncHalt");
      context.commit('setSyncHalt', true);
    },
    // async syncTokenEvents(context, { inputAddress, forceUpdate }) {
    //
    //   function getAddressIndex(address) {
    //     if (!(address in addressesIndex)) {
    //       addressesIndex[address] = addresses.length;
    //       addresses.push(address);
    //     }
    //     return addressesIndex[address];
    //   }
    //   function getTxHashIndex(txHash) {
    //     if (!(txHash in txHashesIndex)) {
    //       txHashesIndex[txHash] = txHashes.length;
    //       txHashes.push(txHash);
    //     }
    //     return txHashesIndex[txHash];
    //   }
    //
    //   async function processLogs(fromBlock, toBlock, logs) {
    //     console.log(moment().format("HH:mm:ss") + " portfolioModule - actions.syncTokenEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", logs.length: " + logs.length + ", type: " + context.state.info.type);
    //     const records = [];
    //     for (const log of logs) {
    //       if (!log.removed) {
    //         let info = null;
    //         // ERC-20 Transfer (index_topic_1 address from, index_topic_2 address to, uint256 tokens)
    //         // ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
    //         if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef") {
    //           if (log.topics.length == 3 && context.state.info.type == "erc20") {
    //             const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
    //             const to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
    //             const tokens = ethers.BigNumber.from(log.data).toString();
    //             info = [ TOKENEVENT_TRANSFER, getAddressIndex(from), getAddressIndex(to), tokens ];
    //
    //           } else if (log.topics.length == 4 && context.state.info.type == "erc721") {
    //             const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
    //             const to = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
    //             const tokenId = ethers.BigNumber.from(log.topics[3]).toString();
    //             info = [ TOKENEVENT_TRANSFER, getAddressIndex(from), getAddressIndex(to), tokenId ];
    //           }
    //
    //         // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
    //         } else if (log.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
    //           const logData = erc1155Interface.parseLog(log);
    //           const [ operator, from, to, tokenId, value ] = logData.args;
    //           info = [ TOKENEVENT_TRANSFERSINGLE, getAddressIndex(operator), getAddressIndex(from), getAddressIndex(to), ethers.BigNumber.from(tokenId).toString(), ethers.BigNumber.from(value).toString() ];
    //
    //         // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
    //         } else if (log.topics[0] == "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb") {
    //           const logData = erc1155Interface.parseLog(log);
    //           const [ operator, from, to, tokenIds, values ] = logData.args;
    //           info = [ TOKENEVENT_TRANSFERBATCH, getAddressIndex(operator), getAddressIndex(from), getAddressIndex(to), tokenIds.map(e => ethers.BigNumber.from(e).toString()), values.map(e => ethers.BigNumber.from(e).toString()) ];
    //
    //         // WETH Deposit (index_topic_1 address dst, uint256 wad)
    //         } else if (log.topics[0] == "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c") {
    //           const from = ADDRESS0;
    //           const to = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
    //           const tokens = ethers.BigNumber.from(log.data).toString();
    //           info = [ TOKENEVENT_TRANSFER, getAddressIndex(from), getAddressIndex(to), tokens ];
    //
    //         // WETH Withdrawal (index_topic_1 address src, uint256 wad)
    //         } else if (log.topics[0] == "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65") {
    //           info = { event: "Withdrawal" };
    //           const from = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
    //           const to = ADDRESS0;
    //           const tokens = ethers.BigNumber.from(log.data).toString();
    //           info = [ TOKENEVENT_TRANSFER, getAddressIndex(from), getAddressIndex(to), tokens ];
    //
    //         // ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
    //         // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
    //         } else if (log.topics[0] == "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925") {
    //           if (log.topics.length == 3 && context.state.info.type == "erc20") {
    //             const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
    //             const spender = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
    //             const tokens = ethers.BigNumber.from(log.data).toString();
    //             info = [ TOKENEVENT_APPROVAL, getAddressIndex(owner), getAddressIndex(spender), tokens ];
    //
    //           } else if (log.topics.length == 4 && context.state.info.type == "erc721") {
    //             const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
    //             const approved = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
    //             const tokenId = ethers.BigNumber.from(log.topics[3]).toString();
    //             info = [ TOKENEVENT_APPROVAL, getAddressIndex(owner), getAddressIndex(approved), tokenId ];
    //           }
    //
    //         // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
    //         // ERC-1155 ApprovalForAll (index_topic_1 address account, index_topic_2 address operator, bool approved)
    //         } else if (log.topics[0] == "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31") {
    //           const owner = ethers.utils.getAddress('0x' + log.topics[1].substring(26));
    //           const operator = ethers.utils.getAddress('0x' + log.topics[2].substring(26));
    //           approved = ethers.BigNumber.from(log.data).eq(1);
    //           info = [ TOKENEVENT_APPROVALFORALL, getAddressIndex(owner), getAddressIndex(operator), approved ];
    //
    //         }
    //         if (info) {
    //           records.push({
    //             chainId,
    //             address: log.address,
    //             blockNumber: log.blockNumber,
    //             logIndex: log.logIndex,
    //             info: [ getTxHashIndex(log.transactionHash), log.transactionIndex, ...info ],
    //           });
    //         }
    //       }
    //     }
    //     // console.log(moment().format("HH:mm:ss") + " portfolioModule - actions.syncTokenEvents.processLogs - fromBlock: " + fromBlock + ", toBlock: " + toBlock + ", records: " + JSON.stringify(records, null, 2));
    //     if (records.length > 0) {
    //       await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_token_addresses", addresses);
    //       await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_token_addressesIndex", addressesIndex);
    //       await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_token_txHashes", txHashes);
    //       await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_token_txHashesIndex", txHashesIndex);
    //
    //       await db.tokenEvents.bulkAdd(records).then(function(lastKey) {
    //         console.log(moment().format("HH:mm:ss") + " portfolioModule - actions.syncTokenEvents.processLogs - bulkAdd lastKey: " + JSON.stringify(lastKey));
    //         }).catch(Dexie.BulkError, function(e) {
    //           console.log(moment().format("HH:mm:ss") + " portfolioModule - actions.syncTokenEvents.processLogs - bulkAdd e: " + JSON.stringify(e.failures, null, 2));
    //         });
    //     }
    //   }
    //
    //   async function getTokenLogsFromRange(fromBlock, toBlock) {
    //     console.log(moment().format("HH:mm:ss") + " portfolioModule - actions.syncTokenEvents.getTokenLogsFromRange - fromBlock: " + fromBlock + ", toBlock: " + toBlock);
    //     if (context.state.sync.halt) {
    //       return;
    //     }
    //     try {
    //       topics = [[
    //           // ERC-20 Transfer (index_topic_1 address from, index_topic_2 address to, uint256 tokens)
    //           // ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
    //           '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    //           // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
    //           '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
    //           // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
    //           '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
    //           // WETH Deposit (index_topic_1 address dst, uint256 wad)
    //           '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
    //           // WETH Withdrawal (index_topic_1 address src, uint256 wad)
    //           '0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65',
    //           // ERC-20 Approval (index_topic_1 address owner, index_topic_2 address spender, uint256 value)
    //           // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
    //           '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
    //           // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
    //           // ERC-1155 ApprovalForAll (index_topic_1 address account, index_topic_2 address operator, bool approved)
    //           '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31',
    //         ],
    //       ];
    //       const logs = await provider.getLogs({
    //         address: validatedAddress,
    //         fromBlock,
    //         toBlock,
    //         topics,
    //       });
    //       // console.log(moment().format("HH:mm:ss") + " portfolioModule - actions.syncTokenEvents.getTokenLogsFromRange - logs: " + JSON.stringify(logs, null, 2));
    //       await processLogs(fromBlock, toBlock, logs);
    //       context.commit('setSyncCompleted', toBlock);
    //     } catch (e) {
    //       console.error(moment().format("HH:mm:ss") + " portfolioModule - actions.syncTokenEvents.getTokenLogsFromRange - Error: " + e.message);
    //       const mid = parseInt((fromBlock + toBlock) / 2);
    //       await getTokenLogsFromRange(fromBlock, mid);
    //       await getTokenLogsFromRange(parseInt(mid) + 1, toBlock);
    //     }
    //   }
    //
    //   const validatedAddress = validateAddress(inputAddress);
    //   if (!validatedAddress) {
    //     // TODO: Handle error in UI
    //     console.error(now() + " portfolioModule - actions.syncTokenEvents - INVALID inputAddress: " + inputAddress + ", forceUpdate: " + forceUpdate);
    //     return;
    //   }
    //
    //   console.log(now() + " portfolioModule - actions.syncTokenEvents - inputAddress: " + inputAddress + ", validatedAddress: " + validatedAddress + ", forceUpdate: " + forceUpdate);
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
    //   const chainId = store.getters["web3/chainId"];
    //   const dbInfo = store.getters["db"];
    //   const db = new Dexie(dbInfo.name);
    //   db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
    //   const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);
    //
    //   const addresses = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_token_addresses", []);
    //   const addressesIndex = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_token_addressesIndex", {});
    //   const txHashes = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_token_txHashes", []);
    //   const txHashesIndex = await dbGetCachedData(db, validatedAddress + "_" + chainId + "_token_txHashesIndex", {});
    //
    //   const address0Index = getAddressIndex(ADDRESS0);
    //   const tokenIndex = getAddressIndex(validatedAddress);
    //
    //   let info = {};
    //   const block = await provider.getBlock();
    //   const latestBlockNumber = block && block.number || null;
    //   context.commit('setSyncTotal', latestBlockNumber);
    //   context.commit('setSyncCompleted', 0);
    //   context.commit('setSyncInfo', "Syncing token events");
    //   const latest = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, validatedAddress, Dexie.minKey, Dexie.minKey],[chainId, validatedAddress, Dexie.maxKey, Dexie.maxKey]).last();
    //   // console.log(now() + " portfolioModule - actions.syncTokenEvents - latest: " + JSON.stringify(latest, null, 2));
    //   const startBlock = latest ? parseInt(latest.blockNumber) + 1: 0;
    //   // TODO: Testing
    //   // const startBlock = latestBlockNumber - 10000;
    //   console.log(now() + " portfolioModule - actions.syncTokenEvents - startBlock: " + startBlock + ", latestBlockNumber: " + latestBlockNumber);
    //   await getTokenLogsFromRange(startBlock, latestBlockNumber);
    //   context.commit('setLookups', { addresses, addressesIndex, txHashes, txHashesIndex });
    //
    //   db.close();
    //   context.dispatch("collateEventData", inputAddress);
    //   context.commit('setSyncInfo', null);
    //   context.commit('setSyncHalt', false);
    // },

    // async collateEventData(context, address) {
    //   const validatedAddress = validateAddress(address);
    //   if (!validatedAddress) {
    //     // TODO: Handle error in UI
    //     console.error(now() + " portfolioModule - actions.collateEventData - INVALID address: " + address);
    //     return;
    //   }
    //   console.log(moment().format("HH:mm:ss") + " portfolioModule - actions.collateEventData - address: " + address);
    //
    //   const chainId = store.getters["web3/chainId"];
    //   const dbInfo = store.getters["db"];
    //   const db = new Dexie(dbInfo.name);
    //   db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
    //
    //   const BATCH_SIZE = 100000;
    //   let rows = 0;
    //   let done = false;
    //   const balances = {};
    //   const tokens = {};
    //   const approvals = {};
    //   const approvalForAlls = {};
    //   do {
    //     const data = await db.tokenEvents.where('[chainId+address+blockNumber+logIndex]').between([chainId, validatedAddress, Dexie.minKey, Dexie.minKey],[chainId, validatedAddress, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(BATCH_SIZE).toArray();
    //     if (data.length > 0) {
    //       if (context.state.info.type == "erc20") {
    //         for (const item of data) {
    //           const info = item.info;
    //           console.log(moment().format("HH:mm:ss") + " portfolioModule - actions.collateEventData - info: " + JSON.stringify(info));
    //           if (info[2] == TOKENEVENT_TRANSFER) {
    //             if (info.from != ADDRESS0) {
    //               balances[info[3]] = ethers.BigNumber.from(balances[info[3]] || "0").sub(info[5]).toString();
    //             }
    //             balances[info[4]] = ethers.BigNumber.from(balances[info[4]] || "0").add(info[5]).toString();
    //           } else if (info[2] == TOKENEVENT_APPROVAL) {
    //             if (!(info[3] in approvals)) {
    //               approvals[info[3]] = {};
    //             }
    //             approvals[info[3]][info[4]] = { tokens: info[5], blockNumber: item.blockNumber, txHash: info[0], txIndex: info[1] };
    //           }
    //         }
    //       } else if (context.state.info.type == "erc721") {
    //         for (const item of data) {
    //           const info = item.info;
    //           if (info[2] == TOKENEVENT_TRANSFER) {
    //             tokens[info[5]] = info[4];
    //           } else if (info[2] == TOKENEVENT_APPROVAL) {
    //             // TODO Make optional to show in history? 0 = ADDRESS0
    //             if (info[4] != 0) {
    //               if (!(info[3] in approvals)) {
    //                 approvals[info[3]] = {};
    //               }
    //               if (!(info[5] in approvals[info[3]])) {
    //                 approvals[info[3]][info[5]] = { approved: info[4], blockNumber: item.blockNumber, txHash: info[0], txIndex: info[1] };
    //               }
    //             } else {
    //               if (approvals[info[3]] && approvals[info[3]][info[5]]) {
    //                 delete approvals[info[3]][info[5]];
    //                 if (Object.keys(approvals[info[3]]).length == 0) {
    //                   delete approvals[info[3]];
    //                 }
    //               }
    //             }
    //           } else if (info[2] == TOKENEVENT_APPROVALFORALL) {
    //             if (!(info[3] in approvalForAlls)) {
    //               approvalForAlls[info[3]] = {};
    //             }
    //             approvalForAlls[info[3]][info[4]] = { approved: info[5], blockNumber: item.blockNumber, txHash: info[0], txIndex: info[1] };
    //           }
    //         }
    //       } else if (context.state.info.type == "erc1155") {
    //         for (const item of data) {
    //           const info = item.info;
    //           if (info[2] == TOKENEVENT_TRANSFERSINGLE) {
    //             if (!(info[6] in tokens)) {
    //               tokens[info[6]] = {};
    //             }
    //             if (info[4] in tokens[info[6]]) {
    //               tokens[info[6]][info[4]] = ethers.BigNumber.from(tokens[info[6]][info[4]]).sub(info[7]).toString();
    //               if (tokens[info[6]][info[4]] == "0") {
    //                 delete tokens[info[6]][info[4]];
    //               }
    //             }
    //             if (!(info[5] in tokens[info[6]])) {
    //               tokens[info[6]][info[5]] = "0";
    //             }
    //             tokens[info[6]][info[5]] = ethers.BigNumber.from(tokens[info[6]][info[5]]).add(info[7]).toString();
    //           } else if (info[2] == TOKENEVENT_TRANSFERBATCH) {
    //             for (const [index, tokenId] of info[6].entries()) {
    //               if (!(tokenId in tokens)) {
    //                 tokens[tokenId] = {};
    //               }
    //               if (info[4] in tokens[tokenId]) {
    //                 tokens[tokenId][info[4]] = ethers.BigNumber.from(tokens[tokenId][info[4]]).sub(info[7][index]).toString();
    //                 if (tokens[tokenId][info[4]] == "0") {
    //                   delete tokens[tokenId][info[4]];
    //                 }
    //               }
    //               if (!(info.to in tokens[tokenId])) {
    //                 tokens[tokenId][info[5]] = "0";
    //               }
    //               tokens[tokenId][info[5]] = ethers.BigNumber.from(tokens[tokenId][info[5]]).add(info[7][index]).toString();
    //             }
    //           } else if (info[2] == TOKENEVENT_APPROVALFORALL) {
    //             if (!(info[3] in approvalForAlls)) {
    //               approvalForAlls[info[3]] = {};
    //             }
    //             approvalForAlls[info[3]][info[4]] = { approved: info[5], blockNumber: item.blockNumber, txHash: info[0], txIndex: info[1] };
    //           }
    //         }
    //       }
    //     }
    //     rows = parseInt(rows) + data.length;
    //     console.log(now() + " portfolioModule - actions.collateEventData - rows: " + rows);
    //     done = data.length < BATCH_SIZE;
    //   } while (!done);
    //   console.log(now() + " portfolioModule - actions.collateEventData - rows: " + rows);
    //   // console.log(now() + " portfolioModule - actions.collateEventData - balances: " + JSON.stringify(balances, null, 2));
    //   // console.log(now() + " portfolioModule - actions.collateEventData - tokens: " + JSON.stringify(tokens, null, 2));
    //   // console.log(now() + " portfolioModule - actions.collateEventData - approvals: " + JSON.stringify(approvals, null, 2));
    //   // console.log(now() + " portfolioModule - actions.collateEventData - approvalForAlls: " + JSON.stringify(approvalForAlls, null, 2));
    //   context.commit('setEventInfo', { numberOfEvents: rows, balances, tokens, approvals, approvalForAlls });
    //   db.close();
    // },
    // async syncTokenMetadata(context, address) {
    //   const validatedAddress = validateAddress(address);
    //   if (!validatedAddress) {
    //     // TODO: Handle error in UI
    //     console.error(now() + " portfolioModule - actions.syncTokenMetadata - INVALID address: " + address);
    //     return;
    //   }
    //   console.log(now() + " portfolioModule - actions.syncTokenMetadata - validatedAddress: " + validatedAddress);
    //   const metadata = {};
    //   let continuation = null;
    //   do {
    //     let url = store.getters['reservoir'] + "tokens/v7?collection=" + validatedAddress + "&sortBy=updatedAt&limit=1000&includeTopBid=true&includeAttributes=true&includeLastSale=true";
    //     url = url + (continuation != null ? "&continuation=" + continuation : "");
    //     console.log(moment().format("HH:mm:ss") + " downloadFromReservoir - url: " + url);
    //     const data = await fetch(url)
    //       .then(handleErrors)
    //       .then(response => response.json())
    //       .catch(function(error) {
    //         console.error(now() + " portfolioModule - actions.syncTokenMetadata - ERROR: " + error);
    //         return {};
    //       });
    //     continuation = data.continuation;
    //     // console.log(now() + " portfolioModule - actions.syncTokenMetadata - data: " + JSON.stringify(data, null, 2).substring(0, 200));
    //     parseReservoirData(data, metadata);
    //     console.log(now() + " portfolioModule - actions.syncTokenMetadata - metadata - #tokens: " + Object.keys(metadata.tokens).length);
    //     if (continuation != null) {
    //       await delay(1000);
    //     }
    //   } while (continuation != null);
    //   console.log(now() + " portfolioModule - actions.syncTokenMetadata - metadata: " + JSON.stringify(metadata, null, 2));
    //
    //   const chainId = store.getters["web3/chainId"];
    //   const dbInfo = store.getters["db"];
    //   const db = new Dexie(dbInfo.name);
    //   db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
    //   await dbSaveCacheData(db, validatedAddress + "_" + chainId + "_token_metadata", metadata);
    //   db.close();
    //   context.commit('setMetadata', metadata);
    // },
  },
};
