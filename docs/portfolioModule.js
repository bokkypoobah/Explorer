const portfolioModule = {
  namespaced: true,
  state: {
    inputTagOrAddress: null,
    addresses: {},
    data: {},
    metadata: {},
    ensData: {},
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
    ensData: state => state.ensData,
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
    setENSData(state, ensData) {
      // console.log(now() + " portfolioModule - mutations.setENSData - ensData: " + JSON.stringify(ensData));
      state.ensData = ensData;
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

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const chainId = store.getters["web3/chainId"];
      const block = await provider.getBlock();
      const blockNumber = block && block.number || null;
      const timestamp = block && block.timestamp || null;
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const parameters = { provider, chainId, blockNumber, timestamp, db, options: [] };

      let metadata = await dbGetCachedData(db, "portfolio_metadata", {});
      // console.log(now() + " portfolioModule - actions.loadPortfolio - portfolio_metadata: " + JSON.stringify(metadata, null, 2));
      context.commit('setMetadata', metadata);
      await context.dispatch("collateENSData", parameters);
      await context.dispatch("collateData", parameters);
      db.close();
    },
    async syncPortfolio(context, { forceUpdate, options }) {
      console.log(now() + " portfolioModule - actions.syncPortfolio - forceUpdate: " + forceUpdate + ", options: " + JSON.stringify(options));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const chainId = store.getters["web3/chainId"];
      const block = await provider.getBlock();
      const blockNumber = block && block.number || null;
      const timestamp = block && block.timestamp || null;
      console.log(now() + " portfolioModule - actions.syncPortfolio - blockNumber: " + blockNumber + ", timestamp: " + moment.unix(timestamp).format("YYYY-MM-DD HH:mm:ss"));
      const dbInfo = store.getters["db"];
      const db = new Dexie(dbInfo.name);
      db.version(dbInfo.version).stores(dbInfo.schemaDefinition);
      const parameters = { provider, chainId, blockNumber, timestamp, db, options };

      if (options.includes("addresses") || options.includes("all")) {
        await context.dispatch("syncAddresses", parameters);
      }
      if (options.includes("reservoir") || options.includes("all")) {
        await context.dispatch("syncMetadata", parameters);
      }
      await context.dispatch("collateData", parameters);
      if (options.includes("ens") || options.includes("all")) {
        await context.dispatch("syncENSEvents", parameters);
      }
      await context.dispatch("collateENSData", parameters);

      context.commit('setSyncInfo', null);
      context.commit('setSyncHalt', false);
      db.close();
    },

    async syncAddresses(context, parameters) {
      console.log(now() + " portfolioModule - actions.syncAddresses - chainId: " + parameters.chainId + ", blockNumber: " + parameters.blockNumber + ", timestamp: " + moment.unix(parameters.timestamp).format("YYYY-MM-DD HH:mm:ss"));
      context.commit('setSyncTotal', Object.keys(context.state.addresses).length);
      let completed = 0;
      // console.log(now() + " portfolioModule - actions.syncAddresses - context.state.addresses: " + JSON.stringify(Object.keys(context.state.addresses)));
      for (const [address, addressInfo] of Object.entries(context.state.addresses)) {
        context.commit('setSyncInfo', "Syncing balances and events " + address.substring(0, 6) + "..." + address.slice(-4));
        context.commit('setSyncCompleted', ++completed);
        // console.log(now() + " portfolioModule - actions.syncAddresses - processing - address: " + address);
        let addressData = await dbGetCachedData(parameters.db, address + "_portfolio_address_data", {});
        // console.log(now() + " portfolioModule - actions.syncAddresses - processing - retrieved addressData: " + JSON.stringify(addressData, null, 2));
        await syncPortfolioAddress(address, addressData, parameters.provider, parameters.chainId);
        // console.log(now() + " portfolioModule - actions.syncAddresses - processing address - addressData: " + JSON.stringify(addressData, null, 2));
        await syncPortfolioAddressEvents(address, addressData, parameters.provider, parameters.chainId, parameters.db);
        console.log(now() + " portfolioModule - actions.syncAddresses - processing events - addressData: " + JSON.stringify(addressData, null, 2));
        await dbSaveCacheData(parameters.db, address + "_portfolio_address_data", JSON.parse(JSON.stringify(addressData)));
      }
      context.commit('setSyncCompleted', ++completed);
    },

    // ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
    // '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
    // '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
    // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
    // '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
    // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
    // '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
    // ERC-721 ApprovalForAll (index_topic_1 address owner, index_topic_2 address operator, bool approved)
    // ERC-1155 ApprovalForAll (index_topic_1 address account, index_topic_2 address operator, bool approved)
    // '0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31',
    async syncMetadata(context, parameters) {
      console.log(now() + " portfolioModule - actions.syncMetadata - chainId: " + parameters.chainId + ", blockNumber: " + parameters.blockNumber + ", timestamp: " + moment.unix(parameters.timestamp).format("YYYY-MM-DD HH:mm:ss"));
      const BATCH_SIZE = 10000;
      const tokenTopics = {
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": "ERC-20/721 Transfer",
        "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62": "ERC-1155 TransferSingle",
        "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb": "ERC-1155 TransferBatch",
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": "ERC-20/721 Approval",
        "0x17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c31": "ERC-1155 ApprovalForAll",
      };
      const erc1155Interface = new ethers.utils.Interface(ERC1155ABI);
      const metadata = await dbGetCachedData(parameters.db, "portfolio_metadata", {});
      console.log(now() + " portfolioModule - actions.syncMetadata - metadata: " + JSON.stringify(metadata, null, 2));
      // TODO
      // const metadata = {};
      if (!(parameters.chainId in metadata)) {
        metadata[parameters.chainId] = {};
      }

      const tokens = {};
      let rows = 0;
      for (const [address, addressInfo] of Object.entries(context.state.addresses)) {
        // console.log(now() + " portfolioModule - actions.syncMetadata - address: " + address);
        let done = false;
        do {
          const logs = await parameters.db.portfolioAddressEvents.where('[address+chainId+blockNumber+logIndex]').between([address, parameters.chainId, Dexie.minKey, Dexie.minKey],[address, parameters.chainId, Dexie.maxKey, Dexie.maxKey]).offset(rows).limit(BATCH_SIZE).toArray();
          for (const log of logs) {
            if (log.topics[0] in tokenTopics) {
              // console.log(now() + " portfolioModule - actions.syncMetadata - log: " + JSON.stringify(log, null, 2));
              let tokenId = null;
              let tokenIds = null;
              // ERC-721 Transfer (index_topic_1 address from, index_topic_2 address to, index_topic_3 uint256 id)
              if (log.topics[0] == "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" && log.topics.length == 4) {
                // console.log(now() + " portfolioModule - actions.syncMetadata - ERC-721 Transfer log: " + JSON.stringify(log, null, 2));
                tokenId = ethers.BigNumber.from(log.topics[3]).toString();
                // if (!(log.contract in tokens)) {
                //   tokens[log.contract] = {};
                // }
                // if (!(tokenId in tokens[log.contract])) {
                //   tokens[log.contract][tokenId] = true;
                // }
              // ERC-1155 TransferSingle (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256 id, uint256 value)
              } else if (log.topics[0] == "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62") {
                // console.log(now() + " portfolioModule - actions.syncMetadata - ERC-1155 TransferSingle log: " + JSON.stringify(log, null, 2));
                tokenId = ethers.BigNumber.from(log.data.substring(0, 66)).toString();
                // const count = ethers.BigNumber.from("0x" + log.data.substring(66, 130)).toString();
                // if (!(log.contract in tokens)) {
                //   tokens[log.contract] = {};
                // }
                // if (!(tokenId in tokens[log.contract])) {
                //   // tokens[log.contract][tokenId] = count;
                //   tokens[log.contract][tokenId] = true;
                // }
              // ERC-1155 TransferBatch (index_topic_1 address operator, index_topic_2 address from, index_topic_3 address to, uint256[] ids, uint256[] values)
              } else if (log.topics[0] == "0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb") {
                // console.log(now() + " portfolioModule - actions.syncMetadata - ERC-1155 TransferBatch log: " + JSON.stringify(log, null, 2));
                const logData = erc1155Interface.parseLog(log);
                const [ operator, from, to, _tokenIds, values ] = logData.args;
                tokenIds = _tokenIds;
                // if (!(log.contract in tokens)) {
                //   tokens[log.contract] = {};
                // }
                // for (const [index, tokenId] of tokenIds.entries()) {
                //   const _tokenId = ethers.BigNumber.from(tokenId).toString();
                //   const _value = ethers.BigNumber.from(values[index]).toString();
                //   // tokens[log.contract][_tokenId] = _value;
                //   tokens[log.contract][_tokenId] = true;
                // }
              // ERC-721 Approval (index_topic_1 address owner, index_topic_2 address approved, index_topic_3 uint256 tokenId)
              } else if (log.topics[0] == "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925" && log.topics.length == 4) {
                // console.log(now() + " portfolioModule - actions.syncMetadata - ERC-721 Approval log: " + JSON.stringify(log, null, 2));
                tokenId = ethers.BigNumber.from(log.topics[3]).toString();
                // if (!(log.contract in tokens)) {
                //   tokens[log.contract] = {};
                // }
                // if (!(tokenId in tokens[log.contract])) {
                //   tokens[log.contract][tokenId] = true;
                // }
              }
              if (tokenId != null || tokenIds) {
                if (!(log.contract in tokens)) {
                  tokens[log.contract] = {};
                }
                if (tokenId != null) {
                  tokens[log.contract][tokenId] = true;
                } else {
                  for (const [index, tokenId] of tokenIds.entries()) {
                    const _tokenId = ethers.BigNumber.from(tokenId).toString();
                    // const _value = ethers.BigNumber.from(values[index]).toString();
                    // tokens[log.contract][_tokenId] = _value;
                    tokens[log.contract][_tokenId] = true;
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
      console.log(now() + " portfolioModule - actions.syncMetadata - tokens: " + JSON.stringify(tokens, null, 2));

      context.commit('setSyncTotal', Object.keys(tokens).length);
      let completed = 0;
      for (let [contract, contractData] of Object.entries(tokens)) {
        if (context.state.sync.halt) {
          break;
        }
        // console.log(now() + " portfolioModule - actions.syncMetadata - processing - contract: " + contract + " => " + JSON.stringify(contractData, null, 2));

        if (!(contract in metadata[parameters.chainId])) {
          const info = await getAddressInfo(contract, parameters.provider);
          // console.log(now() + " portfolioModule - actions.syncMetadata - processing - info: " + JSON.stringify(info, null, 2));
          metadata[parameters.chainId][contract] = { type: info.type, ensName: info.ensName, balance: info.balance, name: info.name, symbol: info.symbol, decimals: info.decimals, totalSupply: info.totalSupply, tokens: tokens[contract] };
        } else {
          for (let tokenId of Object.keys(tokens[contract])) {
            if (!(tokenId in metadata[parameters.chainId][contract].tokens)) {
              metadata[parameters.chainId][contract].tokens[tokenId] = true;
            }
          }
          // metadata[parameters.chainId][contract].tokens = tokens[contract];
        }

        // // if (!(log.contract in metadata[parameters.chainId])) {
        // // }
        // const info = await getAddressInfo(contract, parameters.provider);
        // // console.log(now() + " portfolioModule - actions.syncMetadata - processing - info: " + JSON.stringify(info, null, 2));
        // // if (info.type == "erc20") {
        // //   metadata[parameters.chainId][contract] = { type: info.type, ensName: info.ensName, balance: info.balance, name: info.name, symbol: info.symbol, decimals: info.decimals, totalSupply: info.totalSupply };
        // // } else {
        //   metadata[parameters.chainId][contract] = { type: info.type, ensName: info.ensName, balance: info.balance, name: info.name, symbol: info.symbol, decimals: info.decimals, totalSupply: info.totalSupply, tokens: tokens[contract] };
        // // }
        context.commit('setSyncInfo', "Syncing contract metadata for " + contract.substring(0, 6) + "..." + contract.slice(-4) + " => " + metadata[parameters.chainId][contract].name);
        context.commit('setSyncCompleted', ++completed);
      }
      // console.log(now() + " portfolioModule - actions.syncMetadata - metadata: " + JSON.stringify(metadata, null, 2));

      // TODO: Get ERC-20 logos from
      // <b-avatar rounded variant="light" size="3.0rem" :src="'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/' + data.item.account + '/logo.png'" v-b-popover.hover="'ERC-20 logo if available'"></b-avatar>

      const metadataToRetrieve = [];
      for (const [contract, contractData] of Object.entries(tokens)) {
        // if (contractData.type == "erc721" || contractData.type == "erc1155") {
          // console.log(now() + " portfolioModule - actions.syncMetadata - contract: " + contract + " => " + JSON.stringify(contractData, null, 2));
          for (const [tokenId, tokenData] of Object.entries(contractData)) {
            // if (tokenData && Object.keys(tokenData) < 3) {
            //   console.log(now() + " portfolioModule - actions.syncMetadata - contract: " + contract + "/" + tokenId + " => " + JSON.stringify(tokenData, null, 2));
            // }
            if (tokenData === true) {
              console.log(now() + " portfolioModule - actions.syncMetadata - contract: " + contract + "/" + tokenId + " => " + JSON.stringify(tokenData, null, 2));
              metadataToRetrieve.push({ contract, tokenId });
            }
          }
        // }
      }
      console.log(now() + " portfolioModule - actions.syncMetadata - metadataToRetrieve: " + JSON.stringify(metadataToRetrieve, null, 2));

      const reservoir = store.getters["web3/reservoir"];
      console.log(now() + " portfolioModule - actions.syncMetadata - reservoir: " + reservoir);

      const BATCHSIZE = 25;
      const DELAYINMILLIS = 2000;
      completed = 0;
      context.commit('setSyncInfo', "Syncing token metadata");
      context.commit('setSyncTotal', metadataToRetrieve.length);
      context.commit('setSyncCompleted', completed);
      for (let i = 0; i < metadataToRetrieve.length && !context.state.sync.halt; i += BATCHSIZE) {
        const batch = metadataToRetrieve.slice(i, parseInt(i) + BATCHSIZE);
        console.log(now() + " portfolioModule - actions.syncMetadata - batch: " + JSON.stringify(batch));
        let continuation = null;
        do {
          let url = reservoir + "tokens/v7?";
          let separator = "";
          for (let j = 0; j < batch.length; j++) {
            url = url + separator + "tokens=" + batch[j].contract + "%3A" + batch[j].tokenId;
            separator = "&";
          }
          url = url + (continuation != null ? "&continuation=" + continuation : '');
          url = url + "&limit=100&includeAttributes=true&includeLastSale=true&includeTopBid=true";
          console.log(url);
          const data = await fetch(url).then(response => response.json());
          // console.log(now() + " portfolioModule - actions.syncMetadata - data: " + JSON.stringify(data));
          continuation = data.continuation;
          parseReservoirData(data, metadata);
          // for (token of data.tokens) {
          //   console.log(now() + " portfolioModule - actions.syncMetadata - token: " + JSON.stringify(token, null, 2));
          // }
          completed += batch.length;
          context.commit('setSyncCompleted', completed);
          await delay(DELAYINMILLIS);
        } while (continuation != null && !context.state.sync.halt);
        console.log(now() + " portfolioModule - actions.syncMetadata - metadata: " + JSON.stringify(metadata, null, 2));
      }

      // Retrieve ENS names missing the metadata from the Reservoir API
      for (const contractAddress of [ENS_BASEREGISTRARIMPLEMENTATION_ADDRESS, ENS_NAMEWRAPPER_ADDRESS]) {
        const contractMetadata = metadata[parameters.chainId][contractAddress] || null;
        // console.log(now() + " portfolioModule - actions.syncMetadata - contractMetadata: " + JSON.stringify(contractMetadata, null, 2));
        if (contractMetadata) {
          for (const [tokenId, tokenData] of Object.entries(contractMetadata.tokens)) {
            if (!tokenData.name || !tokenData.description) {
              console.log(now() + " portfolioModule - actions.syncMetadata - contractAddress: " + contractAddress + ", tokenId: " + tokenId + " => " + JSON.stringify(tokenData, null, 2));

              let url = "https://metadata.ens.domains/mainnet/" + contractAddress + "/" + tokenId;
              console.log(url);
              const data = await fetch(url)
                .then(response => response.json())
                .catch(function(e) {
                  console.log(now() + " portfolioModule - actions.syncMetadata - error: " + e.message);
                });
              console.log(JSON.stringify(data, null, 2));

              metadata[parameters.chainId][contractAddress].tokens[tokenId].name = data.name;
              metadata[parameters.chainId][contractAddress].tokens[tokenId].description = data.description;
              metadata[parameters.chainId][contractAddress].tokens[tokenId].image = data.image;
              // metadata[token.chainId][contract].tokens[token.tokenId] = {
              //   name: token.name,
              //   description: token.description,
              //   image: token.image,
              //   media: token.media,
              //   owner: token.owner || null,
              //   mintedAt: token.mintedAt && moment.utc(token.mintedAt).unix() || null,
              //   createdAt: token.createdAt && moment.utc(token.createdAt).unix() || null,
              //   updatedAt: item.updatedAt && moment.utc(item.updatedAt).unix() || null,
              //   attributes: token.attributes.map(e => ({ key: e.key, value: e.value })) || null,
              //   count,
              //   supply: token.supply || null,
              //   remainingSupply: token.remainingSupply || null,
              //   acquiredAt,
              //   lastSale,
              //   price,
              //   topBid,
              // };
            }
          }
        }
      }

      context.commit('setMetadata', metadata);
      await dbSaveCacheData(parameters.db, "portfolio_metadata", metadata);
      // db.close();
      context.commit('setSyncInfo', null);
    },

    async collateData(context, parameters) {
      console.log(now() + " portfolioModule - actions.collateData - chainId: " + parameters.chainId + ", blockNumber: " + parameters.blockNumber + ", timestamp: " + moment.unix(parameters.timestamp).format("YYYY-MM-DD HH:mm:ss"));

      let metadata = await dbGetCachedData(parameters.db, "portfolio_metadata", {});
      // console.log(now() + " portfolioModule - actions.collateData - processing - metadata: " + JSON.stringify(metadata));
      const data = {};
      for (const [address, addressInfo] of Object.entries(context.state.addresses)) {
        console.log(now() + " portfolioModule - actions.collateData - address: " + address);
        let addressData = await dbGetCachedData(parameters.db, address + "_portfolio_address_data", {});
        console.log(now() + " portfolioModule - actions.collateData - processing - addressData: " + JSON.stringify(addressData));
        data[address] = {
          ...addressData,
        };
        await collatePortfolioAddress(address, data, parameters.chainId, parameters.db);
      }

      context.commit('setData', data);
      await dbSaveCacheData(parameters.db, parameters.chainId + "_portfolio_data", data);
      context.commit('setSyncInfo', null);
      context.commit('setSyncHalt', false);
      console.log(now() + " portfolioModule - actions.collateData END - chainId: " + parameters.chainId + ", blockNumber: " + parameters.blockNumber + ", timestamp: " + moment.unix(parameters.timestamp).format("YYYY-MM-DD HH:mm:ss"));
    },

    async syncENSEvents(context, parameters) {
      console.log(now() + " portfolioModule - actions.syncENSEvents - chainId: " + parameters.chainId + ", blockNumber: " + parameters.blockNumber + ", timestamp: " + moment.unix(parameters.timestamp).format("YYYY-MM-DD HH:mm:ss"));
      console.log(now() + " portfolioModule - actions.syncENSEvents - context.state.data: " + JSON.stringify(context.state.data, null, 2));
      if (parameters.chainId == 1) {
        await syncPortfolioENSEvents(context.state.data, parameters.provider, parameters.chainId, parameters.db);
      }
    },

    async collateENSData(context, parameters) {
      console.log(now() + " portfolioModule - actions.collateENSData - chainId: " + parameters.chainId + ", blockNumber: " + parameters.blockNumber + ", timestamp: " + moment.unix(parameters.timestamp).format("YYYY-MM-DD HH:mm:ss"));
      let ensData = {};
      await collatePortfolioENSData(ensData, parameters.chainId, parameters.db);
      context.commit('setENSData', ensData);
      // console.log(now() + " portfolioModule - actions.collateENSData - ensData: " + JSON.stringify(ensData, null, 2));
      console.log(now() + " portfolioModule - actions.collateENSData END - chainId: " + parameters.chainId + ", blockNumber: " + parameters.blockNumber + ", timestamp: " + moment.unix(parameters.timestamp).format("YYYY-MM-DD HH:mm:ss"));
    },

    setSyncHalt(context) {
      console.log(moment().format("HH:mm:ss") + " portfolioModule - actions.setSyncHalt");
      context.commit('setSyncHalt', true);
    },
  },
};
