function parseOpenseaNFTMetadata(data, metadata, chainId) {
  console.log(moment().format("HH:mm:ss") + " parseOpenseaNFTMetadata - data: " + JSON.stringify(data, null, 2));
  const nft = data && data.nft || null;
  if (nft) {
    const tokenId = nft.identifier;
    const contract = ethers.utils.getAddress(nft.contract);
    const slug = nft.collection;

    if (metadata[chainId] && metadata[chainId][contract]) {
      if (!("slug" in metadata[chainId][contract]) || !metadata[chainId][contract].slug) {
        metadata[chainId][contract].slug = slug;
      }
      if (metadata[chainId][contract].tokens[tokenId] === true) {
        metadata[chainId][contract].tokens[tokenId] = {};
      }
      metadata[chainId][contract].tokens[tokenId].slug = slug;
      metadata[chainId][contract].tokens[tokenId].name = nft.name;
      metadata[chainId][contract].tokens[tokenId].description = nft.description;
      metadata[chainId][contract].tokens[tokenId].image = nft.image_url;
      metadata[chainId][contract].tokens[tokenId].traits = nft.traits;
    }
    // console.log(moment().format("HH:mm:ss") + " parseOpenseaNFTMetadata - nft: " + slug + " " + chainId + "/" + contract + "/" + tokenId);
  }
  // for (const item of (data && data.tokens || [])) {
  //   const token = item.token;
  //   const market = item.market;
  //   const contract = ethers.utils.getAddress(token.contract);
  //   const count = item.ownership && item.ownership.tokenCount || null;
  //   const acquiredAt = item.ownership && parseInt(Date.parse(item.ownership.acquiredAt)/1000) || null;
  //   const lastSaleTimestamp = token.lastSale && token.lastSale.timestamp || null;
  //   const lastSaleCurrency = token.lastSale && token.lastSale.price && token.lastSale.price.currency && token.lastSale.price.currency.symbol || null;
  //   const lastSaleAmount = token.lastSale && token.lastSale.price && token.lastSale.price.amount && token.lastSale.price.amount.native || null;
  //   const lastSaleAmountUSD = token.lastSale && token.lastSale.price && token.lastSale.price.amount && token.lastSale.price.amount.usd || null;
  //   let lastSale = null;
  //   if (lastSaleAmount) {
  //     lastSale = {
  //       timestamp: lastSaleTimestamp,
  //       currency: lastSaleCurrency,
  //       amount: lastSaleAmount,
  //       amountUSD: lastSaleAmountUSD,
  //     };
  //   }
  //   const priceExpiry = market.floorAsk && market.floorAsk.validUntil && parseInt(market.floorAsk.validUntil) || null;
  //   const priceSource = market.floorAsk && market.floorAsk.source && market.floorAsk.source.domain || null;
  //   const priceCurrency = market.floorAsk && market.floorAsk.price && market.floorAsk.price.currency && market.floorAsk.price.currency.symbol || null;
  //   const priceAmount = market.floorAsk && market.floorAsk.price && market.floorAsk.price.amount && market.floorAsk.price.amount.native || null;
  //   const priceAmountUSD = market.floorAsk && market.floorAsk.price && market.floorAsk.price.amount && market.floorAsk.price.amount.usd || null;
  //   let price = null;
  //   if (priceAmount) {
  //     price = {
  //       source: priceSource,
  //       expiry: priceExpiry,
  //       currency: priceCurrency,
  //       amount: priceAmount,
  //       amountUSD: priceAmountUSD,
  //     };
  //   }
  //   const topBidCurrency = market.topBid && market.topBid.price && market.topBid.price.currency && market.topBid.price.currency.symbol || null;
  //   const topBidSource = market.topBid && market.topBid.source && market.topBid.source.domain || null;
  //   const topBidAmount = market.topBid && market.topBid.price && market.topBid.price.amount && market.topBid.price.amount.native || null;
  //   const topBidAmountUSD = market.topBid && market.topBid.price && market.topBid.price.amount && market.topBid.price.amount.usd || null;
  //   const topBidNetAmount = market.topBid && market.topBid.price && market.topBid.price.netAmount && market.topBid.price.netAmount.native || null;
  //   const topBidNetAmountUSD = market.topBid && market.topBid.price && market.topBid.price.netAmount && market.topBid.price.netAmount.usd || null;
  //   let topBid = null;
  //   if (topBidNetAmount) {
  //     topBid = {
  //       source: topBidSource,
  //       currency: topBidCurrency,
  //       amount: topBidAmount,
  //       amountUSD: topBidAmountUSD,
  //       netAmount: topBidNetAmount,
  //       netAmountUSD: topBidNetAmountUSD,
  //     };
  //   }
  //
  //   if (token.chainId in metadata && metadata[token.chainId][contract] && !('collectionSlug' in metadata[token.chainId][contract])) {
  //     metadata[token.chainId][contract].collectionName = token.collection.name;
  //     metadata[token.chainId][contract].collectionDescription = token.collection.description;
  //     metadata[token.chainId][contract].collectionImage = token.collection.image;
  //     metadata[token.chainId][contract].collectionSlug = token.collection.slug;
  //   }
  //
  //   if (token.chainId in metadata && metadata[token.chainId][contract] && metadata[token.chainId][contract].tokens[token.tokenId]) {
  //     metadata[token.chainId][contract].tokens[token.tokenId] = {
  //       name: token.name,
  //       description: token.description,
  //       image: token.image,
  //       media: token.media,
  //       owner: token.owner || null,
  //       mintedAt: token.mintedAt && moment.utc(token.mintedAt).unix() || null,
  //       createdAt: token.createdAt && moment.utc(token.createdAt).unix() || null,
  //       updatedAt: item.updatedAt && moment.utc(item.updatedAt).unix() || null,
  //       attributes: token.attributes.map(e => ({ key: e.key, value: e.value })) || null,
  //       count,
  //       supply: token.supply || null,
  //       remainingSupply: token.remainingSupply || null,
  //       acquiredAt,
  //       lastSale,
  //       price,
  //       topBid,
  //     };
  //     // For contracts with multiple collections
  //     if (metadata[token.chainId][contract].collectionName != token.collection.name) {
  //       metadata[token.chainId][contract].tokens[token.tokenId].collectionName = token.collection.name;
  //       metadata[token.chainId][contract].tokens[token.tokenId].collectionDescription = token.collection.description;
  //       metadata[token.chainId][contract].tokens[token.tokenId].collectionImage = token.collection.image;
  //       metadata[token.chainId][contract].tokens[token.tokenId].collectionSlug = token.collection.slug;
  //     }
  //   }
  // }
  // return metadata;
}


function parseOpenseaNFTEvents(data, prices, chainId, contract, tokenId) {
  // console.log(moment().format("HH:mm:ss") + " parseOpenseaNFTEvents - data: " + JSON.stringify(data, null, 2));
  const events = data && data.asset_events || null;
  if (events) {
    for (const event of events) {
      // console.log(moment().format("HH:mm:ss") + " parseOpenseaNFTEvents - event: " + JSON.stringify(event, null, 2));
      let record = null;
      if (event.event_type == "order") {
        // console.log(moment().format("HH:mm:ss") + " parseOpenseaNFTEvents - ORDER event: " + JSON.stringify(event, null, 2));
        record = {
          eventType: event.event_type,
          orderType: event.order_type,
          timestamp: parseInt(event.event_timestamp),
          payment: {
            quantity: ethers.BigNumber.from(event.payment.quantity).toString(),
            token: ethers.utils.getAddress(event.payment.token_address),
            decimals: parseInt(event.payment.decimals),
            symbol: event.payment.symbol,
          },
          startDate: event.start_date && parseInt(event.start_date) || null,
          expirationDate: event.expiration_date && parseInt(event.expiration_date) || null,
          maker: event.maker && ethers.utils.getAddress(event.maker) || null,
          taker: event.taker && ethers.utils.getAddress(event.taker) || null,
          quantity: parseInt(event.quantity),
        };

      } else if (event.event_type == "sale") {
        // console.log(moment().format("HH:mm:ss") + " parseOpenseaNFTEvents - SALE event: " + JSON.stringify(event, null, 2));
        record = {
          eventType: event.event_type,
          timestamp: parseInt(event.event_timestamp),
          txHash: event.transaction,
          payment: {
            quantity: ethers.BigNumber.from(event.payment.quantity).toString(),
            token: ethers.utils.getAddress(event.payment.token_address),
            decimals: parseInt(event.payment.decimals),
            symbol: event.payment.symbol,
          },
          buyer: ethers.utils.getAddress(event.buyer),
          seller: ethers.utils.getAddress(event.seller),
          quantity: parseInt(event.quantity),
        };

      } else if (event.event_type == "transfer") {
        // console.log(moment().format("HH:mm:ss") + " parseOpenseaNFTEvents - TRANSFER event: " + JSON.stringify(event, null, 2));
        record = {
          eventType: event.event_type,
          transferType: event.transfer_type,
          timestamp: parseInt(event.event_timestamp),
          txHash: event.transaction,
          from: ethers.utils.getAddress(event.from_address),
          to: ethers.utils.getAddress(event.to_address),
          quantity: parseInt(event.quantity),
        };
      }
      if (record) {
        console.error(moment().format("HH:mm:ss") + " parseOpenseaNFTEvents - record: " + JSON.stringify(record, null, 2));
      }
    }
  }
}

function parseOpenseaNFTListings(data, prices, chainId, contract, tokenId) {
  // console.log(moment().format("HH:mm:ss") + " parseOpenseaNFTListings - data: " + JSON.stringify(data, null, 2));
  const orders = data && data.orders || null;
  if (orders) {
    for (const order of orders) {
      let record = null;
      const protocolData = order && order.protocol_data || null;
      record = {
        listingTime: parseInt(order.listing_time),
        expirationTime: parseInt(order.expiration_time),
        // TODO: Delete - for checking initially
        listingTimeString: order.listing_time && moment.unix(order.listing_time).utc().format("YYYY-MM-DD HH:mm:ss") || null,
        expirationTimeString: order.expiration_time && moment.unix(order.expiration_time).utc().format("YYYY-MM-DD HH:mm:ss") || null,
        orderHash: order.order_hash,
        // TODO: Delete - don't need
        // offerer: protocolData && protocolData.parameters && ethers.utils.getAddress(protocolData.parameters.offerer) || null,
        maker: order.maker && ethers.utils.getAddress(order.maker.address) || null,
        currentPrice: ethers.BigNumber.from(order.current_price).toString(),
        // eventType: event.event_type,
        // transferType: event.transfer_type,
        // timestamp: parseInt(event.event_timestamp),
        // txHash: event.transaction,
        // from: ethers.utils.getAddress(event.from_address),
        // to: ethers.utils.getAddress(event.to_address),
        // quantity: parseInt(event.quantity),
      };
      if (record) {
        console.error(moment().format("HH:mm:ss") + " parseOpenseaNFTListings - record: " + JSON.stringify(record, null, 2));
      }
      // console.log(moment().format("HH:mm:ss") + " parseOpenseaNFTListings - protocolData: " + JSON.stringify(protocolData, null, 2));
      // console.log(moment().format("HH:mm:ss") + " parseOpenseaNFTListings - order: " + JSON.stringify(order, null, 2));
    }
  }
}
