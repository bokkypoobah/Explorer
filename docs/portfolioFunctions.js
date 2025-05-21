async function syncPortfolioAddress(validatedAddress, data, provider) {
  console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - validatedAddress: " + validatedAddress + ", data.keys: " + Object.keys(data));

  if (!('type' in data)) {
    try {
      const code = await provider.getCode(validatedAddress);
      data.type = code == "0x" ? "eoa" : "contract";
      console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - type: " + data.type);
    } catch (e) {
      console.error(now() + " portfolioFunctions.js:syncPortfolioAddress - provider.getCode: " + e.message);
    }
    try {
      data.ensName = await provider.lookupAddress(validatedAddress);
    } catch (e) {
      console.error(now() + " portfolioFunctions.js:syncPortfolioAddress - provider.lookupAddress: " + e.message);
    }
  }

  data.previous = {
    balance: data.balance || null,
    transactionCount: data.transactionCount || null,
    blockNumber: data.blockNumber || null,
    timestamp: data.timestamp || null,
  };

  const block = await provider.getBlock("latest");
  data.blockNumber = block.number;
  data.timestamp = block.timestamp;

  try {
    data.balance = ethers.BigNumber.from(await provider.getBalance(data.address)).toString();
    console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - balance: " + data.balance);
  } catch (e) {
    console.error(now() + " portfolioFunctions.js:syncPortfolioAddress - provider.getBalance: " + e.message);
  }

  try {
    data.transactionCount = await provider.getTransactionCount(data.address);
    console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - transactionCount: " + data.transactionCount);
  } catch (e) {
    console.error(now() + " portfolioFunctions.js:syncPortfolioAddress - provider.getTransactionCount: " + e.message);
  }

  if ((data.balance != data.previous.balance) || (data.transactionCount != data.previous.transactionCount)) {
    // TODO: Scrape transactions and internal transactions from Etherscan API
  }
  // TODO: Scrape ERC-20, ERC-721 and ERC-1155 events
  // TODO: Scrape ENS events

  console.log(now() + " portfolioFunctions.js:syncPortfolioAddress - data: " + JSON.stringify(data, null, 2));
}

async function collatePortfolioAddress(validatedAddress, data, provider) {
  console.error(now() + " portfolioFunctions.js:collatePortfolioAddress - validatedAddress: " + validatedAddress + ", data keys: " + Object.keys(data));
}

async function collatePortfolioAddresses(validatedAddress, data, provider) {
  console.error(now() + " portfolioFunctions.js:collatePortfolioAddresses - validatedAddress: " + validatedAddress + ", data keys: " + Object.keys(data));
}
