// src/index.ts
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes"; 
// Routes
import userRoutes from "./routes/userRoutes";
import marketRoutes from "./routes/marketRoutes";
import adminProductRoutes from "./routes/adminProductRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import sliderRoutes from "./routes/sliderRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import http from 'http';
import { Server as IOServer } from 'socket.io';

import deliveryCategoryRoutes from "./routes/delivry/DeliveryCategoryRoutes";
import deliveryStoreRoutes from "./routes/delivry/DeliveryStoreRoutes";
import deliveryProductRoutes from "./routes/delivry/DeliveryProductRoutes";
import deliverySubCategoryRoutes from "./routes/delivry/DeliveryProductSubCategoryRoutes";
import deliveryBannerRoutes from "./routes/delivry/DeliveryBannerRoutes";
import deliveryCartRouter from "./routes/delivry/DeliveryCartRoutes";
import deliveryOrderRoutes from "./routes/delivry/DeliveryOrderRoutes";
import userAvatarRoutes from "./routes/userAvatarRoutes";
import { verifyTokenSocket } from "./middleware/verifyTokenSocket";


dotenv.config();
const app = express();
app.use(cors({
  origin: ["http://localhost:5173"], // ← اسم مضيف الفرونتند
  credentials: true, // ← لو تستخدم توكنات أو كوكيز
}));
const server = http.createServer(app);



export const io = new IOServer(server, {
  cors: { origin: '*' }
});

io.use(verifyTokenSocket);


io.on('connection', socket => {
  const uid = socket.data.uid; // بعد verifyTokenSocket
  if (uid) socket.join(`user_${uid}`);
  socket.on('disconnect', () => socket.leave(`user_${uid}`));
});


const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "";
app.use((req, _res, next) => {
  console.log(`↔️ Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
// API Routes
app.use("/users", userRoutes);
app.use("/market", marketRoutes);
app.use("/media", mediaRoutes);

app.use("/admin/products", adminProductRoutes);
app.use("/market/categories", categoryRoutes);
app.use("/market/sliders", sliderRoutes);

app.use("/users", userAvatarRoutes);
app.use("/admin", adminRoutes);
app.use("/delivery/categories", deliveryCategoryRoutes);
app.use("/delivery/stores", deliveryStoreRoutes);
app.use("/delivery/products", deliveryProductRoutes);
app.use("/delivery/cart", deliveryCartRouter);
app.use("/delivery/order", deliveryOrderRoutes);

app.use("/delivery/subcategories", deliverySubCategoryRoutes);
app.use("/delivery/banners", deliveryBannerRoutes);
app.get("/debug/uploads", (_, res) => {
  const fs = require("fs");
  const path = require("path");
  const files = fs.readdirSync(path.resolve("uploads"));
  res.json({ files });
});

// Root Check
app.get("/", (_, res) => {
  res.send("bThwani backend is running ✅");
});

// MongoDB connection
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // اغلاق السيرفر عند فشل الاتصال
  }
};
startServer();
