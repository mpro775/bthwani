import cron from "node-cron";
import { closeExpiredAuctions } from "../utils/auctionScheduler";

export const scheduleAuctionClosing = () => {
  cron.schedule("0 0 * * *", async () => {
    await closeExpiredAuctions();
  });
};
