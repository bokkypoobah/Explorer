async function getAddressInfo(inputAddress, provider) {
  const results = {};
  console.log(now() + " functions.js:getAddressInfo - inputAddress: " + inputAddress);
  results.address = null;
  try {
    results.address = ethers.utils.getAddress(inputAddress);
  } catch (e) {
    console.error(now() + " functions.js:getAddressInfo - invalid inputAddress: " + inputAddress);
  }
  if (results.address) {
    try {
      results.code = (await provider.getCode(results.address) || "").substring(0, 200) + "...";
      results.type = !results.code || results.code == "0x" ? "eoa" : "contract"
      console.log(now() + " functions.js:getAddressInfo - results.code: " + results.code);
    } catch (e) {
      console.error(now() + " functions.js:getAddressInfo - provider.getCode: " + e.message);
    }
  }
  if (results.type == "contract") {
    try {
      results.storage0 = await provider.getStorageAt(results.address, 0);
      console.log(now() + " functions.js:getAddressInfo - results.storage0: " + results.storage0);
    } catch (e) {
      console.error(now() + " functions.js:getAddressInfo - provider.getStorageAt: " + e.message);
    }
  }
  return results;
}
