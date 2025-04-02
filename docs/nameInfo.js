async function getNameInfo(inputName, provider) {
  const results = {};
  console.log(now() + " nameInfo.js:getNameInfo - inputName: " + inputName);
  results.name = null;
  if (ethers.utils.isValidName(inputName)) {
    results.name = inputName;
    results.resolvedAddress = await provider.resolveName(inputName);
    console.log(now() + " nameInfo.js:getNameInfo - resolvedAddress: " + results.resolvedAddress);
    results.avatar = await provider.getAvatar(inputName);
    console.log(now() + " nameInfo.js:getNameInfo - avatar: " + results.avatar);
    const resolver = await provider.getResolver(inputName);
    results.ethAddress = resolver ? await resolver.getAddress() : null;
    console.log(now() + " nameInfo.js:getNameInfo - address: " + results.ethAddress);

  }
  return results;
}
