import { Product } from "../models/Haraj_V2/Product";

export const closeExpiredAuctions = async () => {
  const now = new Date();
  const products = await Product.find({
    isAuction: true,
    auctionStatus: "open",
    auctionEndDate: { $lte: now },
  });

  for (const product of products) {
    const highestBid = product.bids?.[product.bids.length - 1];
    if (highestBid) {
      product.winningBid = highestBid;
    }
    product.auctionStatus = "closed";
    await product.save();
  }

  console.log(`🔔 تم إغلاق ${products.length} مزادات منتهية`);
};
