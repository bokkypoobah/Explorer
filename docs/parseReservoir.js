function parseReservoirDataForCollection(data, reservoirData) {
  console.log(moment().format("HH:mm:ss") + " parseReservoirDataForCollection - data: " + JSON.stringify(data, null, 2).substring(0, 200));
  for (const item of (data && data.tokens || [])) {
    const token = item.token;
    const market = item.market;
    const contract = ethers.utils.getAddress(token.contract);
    if (!("chainId" in reservoirData)) {
      reservoirData.chainId = token.chainId;
      reservoirData.contract = contract;
      reservoirData.type = token.kind;
      reservoirData.name = token.collection.name;
      reservoirData.slug = token.collection.slug;
      reservoirData.tokens = {};
    }
    const count = item.ownership && item.ownership.tokenCount || null;
    const acquiredAt = item.ownership && parseInt(Date.parse(item.ownership.acquiredAt)/1000) || null;
    const lastSaleTimestamp = token.lastSale && token.lastSale.timestamp || null;
    const lastSaleCurrency = token.lastSale && token.lastSale.price && token.lastSale.price.currency && token.lastSale.price.currency.symbol || null;
    const lastSaleAmount = token.lastSale && token.lastSale.price && token.lastSale.price.amount && token.lastSale.price.amount.native || null;
    const lastSaleAmountUSD = token.lastSale && token.lastSale.price && token.lastSale.price.amount && token.lastSale.price.amount.usd || null;
    let lastSale = null;
    if (lastSaleAmount) {
      lastSale = {
        timestamp: lastSaleTimestamp,
        currency: lastSaleCurrency,
        amount: lastSaleAmount,
        amountUSD: lastSaleAmountUSD,
      };
    }
    const priceExpiry = market.floorAsk && market.floorAsk.validUntil && parseInt(market.floorAsk.validUntil) || null;
    const priceSource = market.floorAsk && market.floorAsk.source && market.floorAsk.source.domain || null;
    const priceCurrency = market.floorAsk && market.floorAsk.price && market.floorAsk.price.currency && market.floorAsk.price.currency.symbol || null;
    const priceAmount = market.floorAsk && market.floorAsk.price && market.floorAsk.price.amount && market.floorAsk.price.amount.native || null;
    const priceAmountUSD = market.floorAsk && market.floorAsk.price && market.floorAsk.price.amount && market.floorAsk.price.amount.usd || null;
    let price = null;
    if (priceAmount) {
      price = {
        source: priceSource,
        expiry: priceExpiry,
        currency: priceCurrency,
        amount: priceAmount,
        amountUSD: priceAmountUSD,
      };
    }
    const topBidCurrency = market.topBid && market.topBid.price && market.topBid.price.currency && market.topBid.price.currency.symbol || null;
    const topBidSource = market.topBid && market.topBid.source && market.topBid.source.domain || null;
    const topBidAmount = market.topBid && market.topBid.price && market.topBid.price.amount && market.topBid.price.amount.native || null;
    const topBidAmountUSD = market.topBid && market.topBid.price && market.topBid.price.amount && market.topBid.price.amount.usd || null;
    const topBidNetAmount = market.topBid && market.topBid.price && market.topBid.price.netAmount && market.topBid.price.netAmount.native || null;
    const topBidNetAmountUSD = market.topBid && market.topBid.price && market.topBid.price.netAmount && market.topBid.price.netAmount.usd || null;
    let topBid = null;
    if (topBidNetAmount) {
      topBid = {
        source: topBidSource,
        currency: topBidCurrency,
        amount: topBidAmount,
        amountUSD: topBidAmountUSD,
        netAmount: topBidNetAmount,
        netAmountUSD: topBidNetAmountUSD,
      };
    }
    if (!(token.tokenId in reservoirData.tokens)) {
      reservoirData.tokens[token.tokenId] = {
        name: token.name,
        description: token.description,
        image: token.image,
        media: token.media,
        owner: token.owner || null,
        mintedAt: token.mintedAt && moment.utc(token.mintedAt).unix() || null,
        createdAt: token.createdAt && moment.utc(token.createdAt).unix() || null,
        updatedAt: item.updatedAt && moment.utc(item.updatedAt).unix() || null,
        attributes: token.attributes.map(e => ({ key: e.key, value: e.value })) || null,
        count,
        supply: token.supply || null,
        remainingSupply: token.remainingSupply || null,
        acquiredAt,
        lastSale,
        price,
        topBid,
      };
    }
  }
  // console.log(moment().format("HH:mm:ss") + " parseReservoirDataForCollection - reservoirData: " + JSON.stringify(reservoirData, null, 2).substring(0, 200));
  return reservoirData;
}


function parseReservoirData(data, metadata) {
  // console.error(moment().format("HH:mm:ss") + " parseReservoirData - data: " + JSON.stringify(data, null, 2));
  for (const item of (data && data.tokens || [])) {
    const token = item.token;
    const market = item.market;
    const contract = ethers.utils.getAddress(token.contract);
    const count = item.ownership && item.ownership.tokenCount || null;
    const acquiredAt = item.ownership && parseInt(Date.parse(item.ownership.acquiredAt)/1000) || null;
    const lastSaleTimestamp = token.lastSale && token.lastSale.timestamp || null;
    const lastSaleCurrency = token.lastSale && token.lastSale.price && token.lastSale.price.currency && token.lastSale.price.currency.symbol || null;
    const lastSaleAmount = token.lastSale && token.lastSale.price && token.lastSale.price.amount && token.lastSale.price.amount.native || null;
    const lastSaleAmountUSD = token.lastSale && token.lastSale.price && token.lastSale.price.amount && token.lastSale.price.amount.usd || null;
    let lastSale = null;
    if (lastSaleAmount) {
      lastSale = {
        timestamp: lastSaleTimestamp,
        currency: lastSaleCurrency,
        amount: lastSaleAmount,
        amountUSD: lastSaleAmountUSD,
      };
    }
    const priceExpiry = market.floorAsk && market.floorAsk.validUntil && parseInt(market.floorAsk.validUntil) || null;
    const priceSource = market.floorAsk && market.floorAsk.source && market.floorAsk.source.domain || null;
    const priceCurrency = market.floorAsk && market.floorAsk.price && market.floorAsk.price.currency && market.floorAsk.price.currency.symbol || null;
    const priceAmount = market.floorAsk && market.floorAsk.price && market.floorAsk.price.amount && market.floorAsk.price.amount.native || null;
    const priceAmountUSD = market.floorAsk && market.floorAsk.price && market.floorAsk.price.amount && market.floorAsk.price.amount.usd || null;
    let price = null;
    if (priceAmount) {
      price = {
        source: priceSource,
        expiry: priceExpiry,
        currency: priceCurrency,
        amount: priceAmount,
        amountUSD: priceAmountUSD,
      };
    }
    const topBidCurrency = market.topBid && market.topBid.price && market.topBid.price.currency && market.topBid.price.currency.symbol || null;
    const topBidSource = market.topBid && market.topBid.source && market.topBid.source.domain || null;
    const topBidAmount = market.topBid && market.topBid.price && market.topBid.price.amount && market.topBid.price.amount.native || null;
    const topBidAmountUSD = market.topBid && market.topBid.price && market.topBid.price.amount && market.topBid.price.amount.usd || null;
    const topBidNetAmount = market.topBid && market.topBid.price && market.topBid.price.netAmount && market.topBid.price.netAmount.native || null;
    const topBidNetAmountUSD = market.topBid && market.topBid.price && market.topBid.price.netAmount && market.topBid.price.netAmount.usd || null;
    let topBid = null;
    if (topBidNetAmount) {
      topBid = {
        source: topBidSource,
        currency: topBidCurrency,
        amount: topBidAmount,
        amountUSD: topBidAmountUSD,
        netAmount: topBidNetAmount,
        netAmountUSD: topBidNetAmountUSD,
      };
    }

    if (token.chainId in metadata && metadata[token.chainId][contract] && metadata[token.chainId][contract].tokens[token.tokenId]) {
      metadata[token.chainId][contract].tokens[token.tokenId] = {
        collectionName: token.collection.name,
        collectionImage: token.collection.image,
        collectionSlug: token.collection.slug,
        name: token.name,
        description: token.description,
        image: token.image,
        media: token.media,
        owner: token.owner || null,
        mintedAt: token.mintedAt && moment.utc(token.mintedAt).unix() || null,
        createdAt: token.createdAt && moment.utc(token.createdAt).unix() || null,
        updatedAt: item.updatedAt && moment.utc(item.updatedAt).unix() || null,
        attributes: token.attributes.map(e => ({ key: e.key, value: e.value })) || null,
        count,
        supply: token.supply || null,
        remainingSupply: token.remainingSupply || null,
        acquiredAt,
        lastSale,
        price,
        topBid,
      };
    }
  }
  return metadata;
}
