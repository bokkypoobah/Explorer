async function getNameInfo(inputName, provider) {
  const results = {};
  // console.log(now() + " nameInfo.js:getNameInfo - inputName: " + inputName);
  results.name = null;
  if (ethers.utils.isValidName(inputName)) {
    results.name = inputName;
    results.label = inputName.replace(/\.eth/, '');
    results.erc721TokenIdHex = ethers.utils.solidityKeccak256([ "string" ], [ results.label ]);
    results.erc721TokenId = ethers.BigNumber.from(results.erc721TokenIdHex).toString();
    results.erc1155TokenIdHex = ethers.utils.namehash(results.label + ".eth");
    results.erc1155TokenId = ethers.BigNumber.from(results.erc1155TokenIdHex).toString();
    results.resolvedAddress = await provider.resolveName(inputName);
    results.avatar = await provider.getAvatar(inputName);
    const resolver = await provider.getResolver(inputName);
    results.ethAddress = resolver ? await resolver.getAddress() : null;
  }
  // console.log(now() + " nameInfo.js:getNameInfo - inputName: " + inputName + ", results: " + JSON.stringify(results));
  return results;
}

async function getNameEvents(inputName, info, provider) {
  console.log(now() + " nameInfo.js:getNameEvents - inputName: " + inputName);

  const interfaces = {};
  for (const [address, data] of Object.entries(ENS_INFO)) {
    interfaces[address] = new ethers.utils.Interface(data.abi);
  }
  // console.log(now() + " nameInfo.js:getNameEvents - interfaces: " + JSON.stringify(interfaces, null, 2));

  info.events = {};
  const block = await provider.getBlock();
  info.blockNumber = block.number;

  const topics = [[
      '0xb3d987963d01b2f68493b4bdb130988f157ea43070d4ad840fee0466ed9370d9', // NameRegistered (index_topic_1 uint256 id, index_topic_2 address owner, uint256 expires)
      '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f', // NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
      '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', //
      // event TextChanged(bytes32 indexed node, string indexed indexedKey, string key) NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
      '0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340', // NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry)
      '0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4', // NameUnwrapped (index_topic_1 bytes32 node, address owner)

      // Implementation
      '0x335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a0', // NewResolver (index_topic_1 bytes32 node, address resolver)
      '0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82', // NewOwner (index_topic_1 bytes32 node, index_topic_2 bytes32 label, address owner)

      // Public Resolver, Public Resolver 1, Public Resolver 2
      '0xb7d29e911041e8d9b843369e890bcb72c9388692ba48b65ac54e7214c4c348f7', // NameChanged (index_topic_1 bytes32 node, string name)
      '0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2', // AddrChanged (index_topic_1 bytes32 node, address a)
      '0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752', // AddressChanged (index_topic_1 bytes32 node, uint256 coinType, bytes newAddress)
      '0xd8c9334b1a9c2f9da342a0a2b32629c1a229b6445dad78947f674b44444a7550', // TextChanged (index_topic_1 bytes32 node, index_topic_2 string indexedKey, string key)
      '0x448bc014f1536726cf8d54ff3d6481ed3cbc683c2591ca204274009afa09b1a1', // TextChanged (index_topic_1 bytes32 node, index_topic_2 string indexedKey, string key, string value)
      '0xe379c1624ed7e714cc0937528a32359d69d5281337765313dba4e081b72d7578', // ContenthashChanged (index_topic_1 bytes32 node, bytes hash)
    ],
    [ info.erc721TokenIdHex, info.erc1155TokenIdHex ],
    null
  ];
  // console.log(now() + " nameInfo.js:getNameEvents - topics: " + JSON.stringify(topics, null, 2));
  const logs = await provider.getLogs({ address: null, fromBlock: 0, toBlock: info.blockNumber, topics });
  // console.log(now() + " nameInfo.js:getNameEvents - logs: " + JSON.stringify(logs, null, 2));
  for (const log of logs) {
    if (!log.removed) {
      // console.log(now() + " nameInfo.js:getNameEvents - log: " + JSON.stringify(log, null, 2));
      let event = null;
      if (log.address in interfaces) {
        const interface = interfaces[log.address];
        // event = { ...log, address: undefined, blockNumber: undefined, blockHash: undefined, transactionHash: undefined, transactionIndex: undefined, removed: undefined, logIndex: undefined };
        if (log.topics[0] == "0xb3d987963d01b2f68493b4bdb130988f157ea43070d4ad840fee0466ed9370d9") {
          // NameRegistered (index_topic_1 uint256 id, index_topic_2 address owner, uint256 expires)
          const logData = interface.parseLog(log);
          const [labelhash, owner, expires] = logData.args;
          event = { type: "NameRegistered", labelhash: labelhash.toHexString(), owner, expires: parseInt(expires) };
        } else if (log.topics[0] == "0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f") {
          // ERC-721 NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
          const logData = interface.parseLog(log);
          const [name, label, owner, cost, expires] = logData.args;
          event = { type: "NameRegistered", label: name, labelhash: label, owner, cost: cost.toString(), expires: parseInt(expires) };
        } else if (log.topics[0] == "0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae") {
          // ERC-721 NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
          const logData = interface.parseLog(log);
          const [name, label, cost, expiry] = logData.args;
          if (ethers.utils.isValidName(name)) {
            event = { type: "NameRenewed", label: name, cost: cost.toString(), expiry: parseInt(expiry) };
          }
        } else if (log.topics[0] == "0x8ce7013e8abebc55c3890a68f5a27c67c3f7efa64e584de5fb22363c606fd340") {
          // ERC-1155 NameWrapped (index_topic_1 bytes32 node, bytes name, address owner, uint32 fuses, uint64 expiry)
          const logData = interface.parseLog(log);
          const [node, name, owner, fuses, expiry] = logData.args;
          let parts = decodeNameWrapperBytes(name);
          let nameString = parts.join(".");
          let label = null;
          if (parts.length >= 2 && parts[parts.length - 1] == "eth" && ethers.utils.isValidName(nameString)) {
            label = parts.join(".").replace(/\.eth$/, '');
          }
          // const subdomain = parts.length >= 3 && parts[parts.length - 3] || null;
          if (ethers.utils.isValidName(label)) {
            event = { type: "NameWrapped", label, owner, fuses, expiry: parseInt(expiry) };
            // if (subdomain) {
            //   console.log("With subdomain: " + nameString + " & " + JSON.stringify(eventRecord, null, 2));
            // }
          }
        } else if (log.topics[0] == "0xee2ba1195c65bcf218a83d874335c6bf9d9067b4c672f3c3bf16cf40de7586c4") {
          // ERC-1155 NameUnwrapped (index_topic_1 bytes32 node, address owner)
          const logData = interface.parseLog(log);
          const [node, owner] = logData.args;
          event = { type: "NameUnwrapped", node, owner };

        } else if (log.topics[0] == "0x335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a0") {
          // NewResolver (index_topic_1 bytes32 node, address resolver)
          const logData = interface.parseLog(log);
          const [node, resolver] = logData.args;
          event = { type: "NewResolver", node, resolver };
        } else if (log.topics[0] == "0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82") {
          // NewOwner (index_topic_1 bytes32 node, index_topic_2 bytes32 label, address owner)
          const logData = interface.parseLog(log);
          const [node, label, owner] = logData.args;
          event = { type: "NewOwner", node, label, owner };

        } else if (log.topics[0] == "0xb7d29e911041e8d9b843369e890bcb72c9388692ba48b65ac54e7214c4c348f7") {
          // NameChanged (index_topic_1 bytes32 node, string name)
          const logData = interface.parseLog(log);
          const [node, name] = logData.args;
          event = { type: "NameChanged", node, name };
        } else if (log.topics[0] == "0x52d7d861f09ab3d26239d492e8968629f95e9e318cf0b73bfddc441522a15fd2") {
          // AddrChanged (index_topic_1 bytes32 node, address a)
          const logData = interface.parseLog(log);
          const [node, a] = logData.args;
          event = { type: "AddrChanged", node, a };
        } else if (log.topics[0] == "0x65412581168e88a1e60c6459d7f44ae83ad0832e670826c05a4e2476b57af752") {
          // AddressChanged (index_topic_1 bytes32 node, uint256 coinType, bytes newAddress)
          const logData = interface.parseLog(log);
          const [node, coinType, newAddress] = logData.args;
          event = { type: "AddressChanged", node, coinType: coinType.toString(), newAddress };
        } else if (log.topics[0] == "0xd8c9334b1a9c2f9da342a0a2b32629c1a229b6445dad78947f674b44444a7550") {
          // TextChanged (index_topic_1 bytes32 node, index_topic_2 string indexedKey, string key)
          const logData = interface.parseLog(log);
          const [node, indexedKey, key] = logData.args;
          event = { type: "TextChanged", node, indexedKey: indexedKey.hash, key };
        } else if (log.topics[0] == "0x448bc014f1536726cf8d54ff3d6481ed3cbc683c2591ca204274009afa09b1a1") {
          // TextChanged (index_topic_1 bytes32 node, index_topic_2 string indexedKey, string key, string value)
          const logData = interface.parseLog(log);
          const [node, indexedKey, key, value] = logData.args;
          event = { type: "TextChanged", node, indexedKey: indexedKey.hash, key, value };
        } else if (log.topics[0] == "0xe379c1624ed7e714cc0937528a32359d69d5281337765313dba4e081b72d7578") {
          // ContenthashChanged (index_topic_1 bytes32 node, bytes hash)
          const logData = interface.parseLog(log);
          const [node, hash] = logData.args;
          event = { type: "ContenthashChanged", node, hash };

        } else {
          console.error(now() + " nameInfo.js:getNameEvents - VALID CONTRACT UNHANDLED log: " + JSON.stringify(log));
        }
      } else {
        console.error(now() + " nameInfo.js:getNameEvents - NOT ENS CONTRACT log: " + JSON.stringify(log, null, 2));
      }
      if (event) {
        if (!(log.blockNumber in info.events)) {
          info.events[log.blockNumber] = {
            timestamp: null,
            txs: {},
          };
        }
        if (!(log.transactionIndex in info.events[log.blockNumber].txs)) {
          info.events[log.blockNumber].txs[log.transactionIndex] = {
            txHash: log.transactionHash,
            events: {},
          };
        }
        info.events[log.blockNumber].txs[log.transactionIndex].events[log.logIndex] = { address: log.address, contract: ENS_INFO[log.address].name, ...event };
      }
    }
  }
  // console.log(now() + " nameInfo.js:getNameEvents - info: " + JSON.stringify(info, null, 2));
}

async function getNameEventsSupplementaryData(info, provider) {
  console.log(now() + " nameInfo.js:getNameEventsSupplementaryData");
  const publicResolver2Interface = new ethers.utils.Interface(ENS_PUBLICRESOLVER2_ABI);
  for (const [blockNumber, blockData] of Object.entries(info.events)) {
    // console.log(blockNumber + " => " + JSON.stringify(blockData));
    for (const [txIndex, txIndexData] of Object.entries(blockData.txs)) {
      // console.log(blockNumber + "/" + txIndex + " => " + JSON.stringify(txIndexData));
      for (const [logIndex, logIndexData] of Object.entries(txIndexData.events)) {
        if (logIndexData.address == ENS_PUBLICRESOLVER2_ADDRESS && logIndexData.type == "TextChanged") {
          // console.log(blockNumber + "/" + txIndex + "/" + logIndex + " => " + JSON.stringify(logIndexData));
          const tx = await provider.getTransaction(txIndexData.txHash);
          const decodedData = publicResolver2Interface.parseTransaction({ data: tx.data, value: tx.value });
          // console.log(now() + " nameInfo.js:getNameEventsSupplementaryData - decodedData: " + JSON.stringify(decodedData));
          if (decodedData.functionFragment.name == "setText") {
            const decodedFunctionArgs = publicResolver2Interface.decodeFunctionData("setText", tx.data);
            // console.log(now() + " nameInfo.js:getNameEventsSupplementaryData - decodedFunctionArgs: " + JSON.stringify(decodedFunctionArgs));
            info.events[blockNumber].txs[txIndex].events[logIndex].value = decodedFunctionArgs[2];
          } else if (decodedData.functionFragment.name == "multicall") {
            const decodedFunctionArgs = publicResolver2Interface.decodeFunctionData("multicall", tx.data);
            for (const data1 of decodedFunctionArgs) {
              for (const data2 of data1) {
                const decodedArrayData = publicResolver2Interface.parseTransaction({ data: data2, value: tx.value });
                if (decodedArrayData.functionFragment.name == "setText") {
                  const decodedFunctionArgs1 = publicResolver2Interface.decodeFunctionData("setText", data2);
                  info.events[blockNumber].txs[txIndex].events[logIndex].value = decodedFunctionArgs1[2];
                }
              }
            }

          } else {
            console.log(now() + " nameInfo.js:getNameEventsSupplementaryData - UNHANDLED decodedData.functionFragment.name: " + decodedData.functionFragment.name);
          }

        }
      }
    }
  }
}

async function getNameEventsTimestamps(info, provider) {
  console.log(now() + " nameInfo.js:getNameEventsTimestamps");
  for (const [blockNumber, blockData] of Object.entries(info.events)) {
    // console.log(blockNumber + " => " + JSON.stringify(blockData));
    const block = await provider.getBlock(parseInt(blockNumber));
    info.events[blockNumber].timestamp = block.timestamp;
    // console.log(blockNumber + " => " + JSON.stringify(info.events[blockNumber]));
  }
}

// scientific.collections.eth
//           1         2         3         4         5
// 012345678901234567890123456789012345678901234567890123456789
// 0x0a736369656e74696669630b636f6c6c656374696f6e730365746800
//
//   0a                                                                 10
//     736369656e7469666963                                             scientific
//                         0b                                           11
//                           636f6c6c656374696f6e73                     collections
//                                                 03                   3
//                                                   657468             eth
//                                                         00           0
// const results = decodeNameWrapperBytes("0x0a736369656e74696669630b636f6c6c656374696f6e730365746800");
// console.log("results: " + JSON.stringify(results)); // results: ["scientific","collections","eth"]
function decodeNameWrapperBytes(b) {
  let start = 4;
  let len = ethers.BigNumber.from("0x" + b.substring(2, 4));
  const parts = [];
  while (len > 0) {
    const str = b.substring(start, start + len * 2);
    let strUtf8 = ethers.utils.toUtf8String("0x" + str);
    parts.push(strUtf8);
    const s = b.substring(start + len * 2, start + len * 2 + 2);
    const newStart = start + len * 2 + 2;
    len = ethers.BigNumber.from("0x" + b.substring(start + len * 2, start + len * 2 + 2));
    start = newStart;
  }
  return parts;
}
