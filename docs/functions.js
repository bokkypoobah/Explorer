const ERC721_INTERFACE = "0x80ac58cd";
const ERC721METADATA_INTERFACE = "0x5b5e139f";
const ERC721ENUMERABLE_INTERFACE = "0x780e9d63";

const ERC1155_INTERFACE = "0xd9b67a26";
const ERC1155METADATA_INTERFACE = "0x0e89341c";
const ERC1155TOKENRECEIVER_INTERFACE = "0x4e2312e0";

function validateAddress(address) {
  if (address) {
    try {
      return ethers.utils.getAddress(address);
    } catch (e) {
      console.error(now() + " functions.js:validateAddress - ERROR address: " + address);
    }
  }
  return null;
}

async function getAddressInfo(inputAddress, provider) {
  const results = {};
  // console.log(now() + " functions.js:getAddressInfo - inputAddress: " + inputAddress);
  results.address = null;
  if (inputAddress) {
    try {
      results.address = ethers.utils.getAddress(inputAddress);
    } catch (e) {
      console.error(now() + " functions.js:getAddressInfo - invalid inputAddress: " + inputAddress);
    }
  }
  // EOA or contract?
  if (results.address) {
    try {
      results.code = (await provider.getCode(results.address) || "").substring(0, 80) + "...";
      results.type = !results.code || results.code == "0x" ? "eoa" : "contract"
      results.abi = null;
      results.sourceCode = null;
      // console.log(now() + " functions.js:getAddressInfo - results.code: " + results.code);
    } catch (e) {
      console.error(now() + " functions.js:getAddressInfo - provider.getCode: " + e.message);
    }
  }
  if (results.address) {
    try {
      results.balance = ethers.BigNumber.from(await provider.getBalance(results.address)).toString();
      console.log(now() + " functions.js:getAddressInfo - balance: " + results.balance);
    } catch (e) {
      console.error(now() + " functions.js:getAddressInfo - provider.getBalance: " + e.message);
    }
  }
  if (results.address && results.type == "eoa") {
    try {
      results.transactionCount = await provider.getTransactionCount(results.address);
      console.log(now() + " functions.js:getAddressInfo - results.transactionCount: " + results.transactionCount);
    } catch (e) {
      console.error(now() + " functions.js:getAddressInfo - ERROR provider.getStorageAt: " + e.message);
    }
  // } else {
  //   try {
  //     results.storage0 = await provider.getStorageAt(results.address, 0);
  //     // console.log(now() + " functions.js:getAddressInfo - results.storage0: " + results.storage0);
  //   } catch (e) {
  //     console.error(now() + " functions.js:getAddressInfo - ERROR provider.getStorageAt: " + e.message);
  //   }
  }

  // Gnosis Safe contracts?
  if (results.address && results.type == "contract") {
    // All functions below in 1.1.1, 1.3.0 and 1.4.1, except that 1.1.1 does not have getStorageAt
    const ALL_SAFES_ABI = [
      "function VERSION() public view returns (string)",
      "function getOwners() public view returns (address[] memory)",
      "function getThreshold() public view returns (uint256)",
      "function nonce() public view returns (uint256)",
      "function getStorageAt(uint256 offset, uint256 length) public view returns (bytes memory)",
    ];
    const allSafesContract = new ethers.Contract(results.address, ALL_SAFES_ABI, provider);
    try {
      results.version = await allSafesContract.VERSION();
      console.log(now() + " functions.js:getAddressInfo - results.version: " + results.version);
    } catch (e) {
      console.error(now() + " functions.js:getAddressInfo - ERROR allSafesContract.VERSION(): " + e.message);
    }
    if (["1.0.0", "1.1.1", "1.3.0", "1.4.1"].includes(results.version)) {
      console.log(now() + " functions.js:getAddressInfo - CHECKING results.version: " + results.version);
      try {
        results.owners = await allSafesContract.getOwners();
        console.log(now() + " functions.js:getAddressInfo - results.owners: " + JSON.stringify(results.owners));
      } catch (e) {
        console.error(now() + " functions.js:getAddressInfo - ERROR allSafesContract.getOwners(): " + e.message);
      }
      try {
        results.threshold = parseInt(await allSafesContract.getThreshold());
        console.log(now() + " functions.js:getAddressInfo - results.threshold: " + results.threshold);
      } catch (e) {
        console.error(now() + " functions.js:getAddressInfo - ERROR allSafesContract.getThreshold(): " + e.message);
      }
      try {
        results.nonce = parseInt(await allSafesContract.nonce());
        console.log(now() + " functions.js:getAddressInfo - results.nonce: " + results.nonce);
      } catch (e) {
        console.error(now() + " functions.js:getAddressInfo - ERROR allSafesContract.nonce(): " + e.message);
      }
      try {
        const storage0 = await allSafesContract.getStorageAt(0, 1);
        if (storage0.substring(0, 26) == "0x000000000000000000000000") {
          results.implementation = ethers.utils.getAddress(storage0.substring(26,));
          console.log(now() + " functions.js:getAddressInfo - results.implementation: " + results.implementation);
        }
      } catch (e) {
        console.error(now() + " functions.js:getAddressInfo - ERROR allSafesContract.getStorageAt(): " + e.message);
      }
      if (results.owners && results.threshold && results.nonce) {
        // TODO: Should check that result.implementation a valid safe contract
        results.type = "safe";
        results.abi = SAFE_ABIS["safe_" + results.version];
      }
    }
  }

  // ERC-20, ERC-721 or ERC-1155 contracts?
  if (results.address && results.type == "contract") {
    const TOKENS_ABI = [
      "function name() public view returns (string)",
      "function symbol() public view returns (string)",
      "function decimals() public view returns (uint8)",
      "function totalSupply() public view returns (uint256)",
      "function supportsInterface(bytes4 interfaceID) external view returns (bool)",
    ];
    const tokensContract = new ethers.Contract(results.address, TOKENS_ABI, provider);
    try {
      results.name = await tokensContract.name();
      console.log(now() + " functions.js:getAddressInfo - results.name: " + results.name);
    } catch (e) {
      console.error(now() + " functions.js:getAddressInfo - ERROR tokensContract.name(): " + e.message);
    }
    try {
      results.decimals = parseInt(await tokensContract.decimals());
      console.log(now() + " functions.js:getAddressInfo - results.decimals: " + results.decimals);
    } catch (e) {
      console.error(now() + " functions.js:getAddressInfo - ERROR tokensContract.decimals(): " + e.message);
    }
    if (results.name && results.decimals) {
      results.type = "erc20";
      results.abi = ERC20ABI;
      try {
        results.symbol = await tokensContract.symbol();
        console.log(now() + " functions.js:getAddressInfo - results.symbol: " + results.symbol);
      } catch (e) {
        console.error(now() + " functions.js:getAddressInfo - ERROR tokensContract.symbol(): " + e.message);
      }
      try {
        results.totalSupply = ethers.BigNumber.from(await tokensContract.totalSupply()).toString();
        console.log(now() + " functions.js:getAddressInfo - results.totalSupply: " + results.totalSupply);
      } catch (e) {
        console.error(now() + " functions.js:getAddressInfo - ERROR tokensContract.totalSupply(): " + e.message);
      }
    }
    if (results.type == "contract") {
      try {
        if (await tokensContract.supportsInterface(ERC721_INTERFACE)) {
          results.type = "erc721";
          results.abi = ERC721ABI;
        }
      } catch (e) {
        console.error(now() + " functions.js:getAddressInfo - ERROR tokensContract.supportsInterface(ERC721_INTERFACE): " + e.message);
      }
    }
    if (results.type == "contract") {
      try {
        if (await tokensContract.supportsInterface(ERC1155_INTERFACE)) {
          results.type = "erc1155";
          results.abi = ERC1155ABI;
        }
      } catch (e) {
        console.error(now() + " functions.js:getAddressInfo - ERROR tokensContract.supportsInterface(ERC1155_INTERFACE): " + e.message);
      }
    }
  }
  return results;
}

async function dbGetCachedData(db, name, empty) {
  // console.log(now() + " functions.js:dbGetCachedData - name: " + name + ", empty: " + JSON.stringify(empty));
  const dataItems = await db.cache.where("objectName").equals(name).toArray();
  if (dataItems.length == 1) {
    return dataItems[0].object;
  } else {
    return empty;
  }
}

async function dbSaveCacheData(db, name, data) {
  // console.log(now() + " functions.js:dbSaveCacheData - name: " + name + ", data: " + JSON.stringify(data));
  await db.cache.put({ objectName: name, object: data }).then (function() {
    }).catch(function(error) {
      console.error(now() + " functions.js:dbSaveCacheData - ERROR name: " + name + ", data: " + JSON.stringify(data));
    });
}



// uintUnitsOptions: [
//   { value: null, text: 'Number (0 decimals)' },
//   { value: "wei", text: 'Wei (0 decimals)' },
//   { value: "gwei", text: 'Gwei (9 decimals)' },
//   { value: "ether", text: 'Ethers (18 decimals)' },
//   { value: "k", text: 'K (x 1,000)' },
//   { value: "m", text: 'M (x 1,000,000)' },
//   { value: "g", text: 'M (x 1,000,000,000)' },
//   { value: "t", text: 'T (x 1,000,000,000,000)' },
//   { value: "boolean", text: 'Boolean (0 = false, 1 = true)' },
//   { value: "datetimelocal", text: 'Local datetime yyyy-mm-dd [hh:mm:ss]' },
//   { value: "datetimeutc", text: 'UTC datetime yyyy-mm-dd [hh:mm:ss]' },
// ],

const UNIT_TRANSLATION = {
  "k": 3,
  "m": 6,
  "g": 9,
  "t": 12,
};
function formatUintUnits(n, unit) {
  let result;
  if (unit == null || unit == "wei") {
    result = n.toString();
  } else if (unit == "gwei" || unit == "ether") {
    result = ethers.utils.formatUnits(n, unit);
  } else if (unit in UNIT_TRANSLATION) {
    result = ethers.utils.formatUnits(n, UNIT_TRANSLATION[unit]);
  } else if (unit == "boolean") {
    result = n == null || n == 0 ? "false" : "true";
  } else if (unit == "datetimelocal") {
    result = moment.unix(n).format("YYYY-MM-DD HH:mm:ss")
  } else if (unit == "datetimeutc") {
    result = moment.unix(n).utc().format("YYYY-MM-DD HH:mm:ss")
  }
  console.log(now() + " functions.js:formatUintUnits(" + n + ", \"" + unit + "\") => \"" + result + "\"");
  return result;
}

function testFormat() {
  console.log(now() + " functions.js:testFormat");
  formatUintUnits("123", null);
  formatUintUnits("123", "wei");
  formatUintUnits("123", "gwei");
  formatUintUnits("123", "ether");
  formatUintUnits("123", "k");
  formatUintUnits("123", "m");
  formatUintUnits("123", "g");
  formatUintUnits("123", "t");
  formatUintUnits("0", "boolean");
  formatUintUnits("123", "boolean");
  formatUintUnits("1742782888", "datetimelocal");
  formatUintUnits("1742782888", "datetimeutc");
}
testFormat();

function parseUintUnits(n, unit) {
  // console.log(now() + " functions.js:parseUintUnits(" + n + ", " + unit + ")");
  let result;
  if (unit == null || unit == "wei") {
    result = ethers.utils.parseUnits(n, "wei");
  } else if (unit == "gwei" || unit == "ether") {
    result = ethers.utils.parseUnits(n, unit);
  } else if (unit in UNIT_TRANSLATION) {
    result = ethers.utils.parseUnits(n, UNIT_TRANSLATION[unit]);
  } else if (unit == "boolean") {
    result = n.substring(0, 1).toLowerCase() == "t";
  } else if (unit == "datetimelocal") {
    result = moment(n).unix();
  } else if (unit == "datetimeutc") {
    result = moment.utc(n).unix();
  }
  console.log(now() + " functions.js:parseUintUnits(" + n + ", \"" + unit + "\") => \"" + result + "\"");
  return result;
}

function testParse() {
  console.log(now() + " functions.js:testParse");
  parseUintUnits("123", null);
  parseUintUnits("123", "wei");
  parseUintUnits("123.456", "gwei");
  parseUintUnits("123.456", "ether");
  parseUintUnits("123.456", "k");
  parseUintUnits("123.456", "m");
  parseUintUnits("123.456", "g");
  parseUintUnits("123.456", "t");
  parseUintUnits("false", "boolean");
  parseUintUnits("trUe", "boolean");
  parseUintUnits("t", "boolean");
  parseUintUnits("2025-03-24 13:21:28", "datetimelocal");
  parseUintUnits("2025-03-24", "datetimelocal");
  parseUintUnits("2025-03-24 02:21:28", "datetimeutc");
  parseUintUnits("2025-03-24", "datetimeutc");
}
testParse();
