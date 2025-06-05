// src/index.ts

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";


// استيراد Middleware
import { verifyTokenSocket } from "./middleware/verifyTokenSocket";

// استيراد جوبز
import { scheduleAuctionClosing } from "./jobs/dailyAuctionCloser";

// استيراد Routes
import adminRoutes from "./routes/admin/adminRoutes";
import adminWithdrawalRoutes from "./routes/admin/admin.withdrawal.routes";

import userRoutes from "./routes/userRoutes";
import favoriteRoutes from "./routes/favoritesRoutes";

import marketRoutes from "./routes/haraj_v2/marketRoutes";
import adminProductRoutes from "./routes/haraj_v2/adminProductRoutes";
import categoryRoutes from "./routes/haraj_v2/categoryRoutes";
import sliderRoutes from "./routes/haraj_v2/sliderRoutes";

import mediaRoutes from "./routes/mediaRoutes";

import lostFoundRoutes from "./routes/lost_v6/lostFoundRoutes";

import topupRoutes from "./routes/Wallet_V8/topupRoutes";

import freelancerRoutes from "./routes/job_v3/freelancerRoutes";
import opportunityRoutes from "./routes/job_v3/opportunityRoutes";
import bookingRoutes from "./routes/job_v3/bookingRoutes";
import bookingv5Routes from "./routes/booking_v5/booking.routes";
import bookingv5MessageRoutes from "./routes/booking_v5/bookingMessage.routes";
import bookingv5ServicesRoutes from "./routes/booking_v5/bookingService.routes";
import reviewRoutes from "./routes/job_v3/reviewRoutes";
import miscRoutes from "./routes/job_v3/miscRoutes";

import driverWithdrawalRoutes from "./routes/driver_app/driver.withdrawal.routes";

import vendorOrderRoutes from "./routes/vendor_app/orders";
import vendorProductRoutes from "./routes/vendor_app/products";
import adminProductRoutesVendor from "./routes/vendor_app/admin/products";

import deliveryCategoryRoutes from "./routes/delivry_marketplace_v1/DeliveryCategoryRoutes";
import deliveryStoreRoutes from "./routes/delivry_marketplace_v1/DeliveryStoreRoutes";
import deliveryProductRoutes from "./routes/delivry_marketplace_v1/DeliveryProductRoutes";
import deliverySubCategoryRoutes from "./routes/delivry_marketplace_v1/DeliveryProductSubCategoryRoutes";
import deliveryBannerRoutes from "./routes/delivry_marketplace_v1/DeliveryBannerRoutes";
import deliveryCartRouter from "./routes/delivry_marketplace_v1/DeliveryCartRoutes";
import deliveryOrderRoutes from "./routes/delivry_marketplace_v1/DeliveryOrderRoutes";
import bloodRoutes from "./routes/blood_v7/bloodRoutes";
import absherRoutes from "./routes/absher_V9/absher.routes";
import charityRoutes from "./routes/charity_v10/charity.routes";

dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new IOServer(server, {
  cors: {
    origin: "*",
  },
});

// Middleware for Socket.IO verification
io.use(verifyTokenSocket);
io.on("connection", (socket) => {
  const uid = socket.data.uid;
  if (uid) {
    socket.join(`user_${uid}`);
  }

  socket.on("disconnect", () => {
    if (uid) {
      socket.leave(`user_${uid}`);
    }
  });
});

// تفعيل CORS
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// تسجيل الولوج للطلبات في الكونسول
app.use((req, _res, next) => {
  console.log(`↔️ Incoming request: ${req.method} ${req.url}`);
  next();
});

// دعم JSON في الطلبات
app.use(express.json());

// إعداد Swagger Document مع تضمين basePath عبر تعديل خاصية servers
const API_PREFIX = "/api/v1";


// مسارات الـ API

// قسم المستخدمين والمصادقة
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/users/favorites`, favoriteRoutes);

// قسم Haraj (سوق المبيعات)
app.use(`${API_PREFIX}/haraj`, marketRoutes);
app.use(`${API_PREFIX}/haraj/categories`, categoryRoutes);
app.use(`${API_PREFIX}/haraj/sliders`, sliderRoutes);

// قسم الوسائط والتحميلات
app.use(`${API_PREFIX}/media`, mediaRoutes);

// قسم المفقودات والموجودات
app.use(`${API_PREFIX}/lostfound`, lostFoundRoutes);

// قسم شحن المحفظة
app.use(`${API_PREFIX}/topup`, topupRoutes);

// قسم الأدمن وإدارة المنتجات
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/admin/products`, adminProductRoutes);
app.use(`${API_PREFIX}/admin/products/vendor`, adminProductRoutesVendor);
app.use(`${API_PREFIX}/admin/withdrawals`, adminWithdrawalRoutes);

// قسم التوصيل والتجارة
app.use(`${API_PREFIX}/delivery/categories`, deliveryCategoryRoutes);
app.use(`${API_PREFIX}/delivery/stores`, deliveryStoreRoutes);
app.use(`${API_PREFIX}/delivery/products`, deliveryProductRoutes);
app.use(`${API_PREFIX}/delivery/cart`, deliveryCartRouter);
app.use(`${API_PREFIX}/delivery/order`, deliveryOrderRoutes);
app.use(`${API_PREFIX}/delivery/subcategories`, deliverySubCategoryRoutes);
app.use(`${API_PREFIX}/delivery/banners`, deliveryBannerRoutes);

// قسم طلبات وسائق التوصيل
app.use(`${API_PREFIX}/deliveryapp/withdrawals`, driverWithdrawalRoutes);

app.use(`${API_PREFIX}/`, bloodRoutes);
app.use(`${API_PREFIX}/`, charityRoutes);


app.use(`${API_PREFIX}/bookings`, bookingv5Routes);
app.use(`${API_PREFIX}/bookings/`, bookingv5MessageRoutes);
app.use(`${API_PREFIX}/bookings/`, bookingv5ServicesRoutes);

// قسم التاجر
app.use(`${API_PREFIX}/vendor/orders`, vendorOrderRoutes);
app.use(`${API_PREFIX}/vendor/products`, vendorProductRoutes);

// قسم الوظائف والمستقلين
app.use(`${API_PREFIX}/job/freelancers`, freelancerRoutes);
app.use(`${API_PREFIX}/job/booking`, bookingRoutes);
app.use(`${API_PREFIX}/job/review`, reviewRoutes);
app.use(`${API_PREFIX}/job/opportunities`, opportunityRoutes);
app.use(`${API_PREFIX}/job`, miscRoutes);

app.use(`${API_PREFIX}/`, absherRoutes);

// قسم أدوات الديباغ
app.get(`${API_PREFIX}/debug/uploads`, (_, res) => {
  const fs = require("fs");
  const path = require("path");
  const files = fs.readdirSync(path.resolve("uploads"));
  res.json({ files });
});

// مسار الجذر لفحص تشغيل السيرفر
app.get("/", (_, res) => {
  res.send("bThwani backend is running ✅");
});

// جدولة مهمة إغلاق المزادات اليومية
scheduleAuctionClosing();

// إعدادات السيرفر وقاعدة البيانات
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "";

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `📚 Documentation available at http://localhost:${PORT}/api-docs`
      );
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

startServer();
