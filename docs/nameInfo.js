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
  info.events = {};
  const block = await provider.getBlock();
  info.blockNumber = block.number;

  const topics = [[
      '0xb3d987963d01b2f68493b4bdb130988f157ea43070d4ad840fee0466ed9370d9', // NameRegistered (index_topic_1 uint256 id, index_topic_2 address owner, uint256 expires)
      '0xca6abbe9d7f11422cb6ca7629fbf6fe9efb1c621f71ce8f02b9f2a230097404f', // NameRegistered (string name, index_topic_1 bytes32 label, index_topic_2 address owner, uint256 cost, uint256 expires)
      '0x3da24c024582931cfaf8267d8ed24d13a82a8068d5bd337d30ec45cea4e506ae', // NameRenewed (string name, index_topic_1 bytes32 label, uint256 cost, uint256 expires)
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
  console.log(now() + " nameInfo.js:getNameEvents - topics: " + JSON.stringify(topics, null, 2));
  const logs = await provider.getLogs({ address: null, fromBlock: 0, toBlock: info.blockNumber, topics });
  console.log(now() + " nameInfo.js:getNameEvents - logs: " + JSON.stringify(logs, null, 2));

  if (ethers.utils.isValidName(inputName)) {

    // results.name = inputName;
    // results.resolvedAddress = await provider.resolveName(inputName);
    // console.log(now() + " nameInfo.js:getNameEvents - resolvedAddress: " + results.resolvedAddress);
    // results.avatar = await provider.getAvatar(inputName);
    // console.log(now() + " nameInfo.js:getNameEvents - avatar: " + results.avatar);
    // const resolver = await provider.getResolver(inputName);
    // results.ethAddress = resolver ? await resolver.getAddress() : null;
    // console.log(now() + " nameInfo.js:getNameEvents - address: " + results.ethAddress);
  }
  console.log(now() + " nameInfo.js:getNameEvents - inputName: " + inputName + ", info: " + JSON.stringify(info));
  // return results;
}
