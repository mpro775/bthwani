// src/index.ts

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import adminNotificationRoutes from "./routes/admin/notification.routes";
// استيراد Middleware
import { verifyTokenSocket } from "./middleware/verifyTokenSocket";

// استيراد جوبز

// استيراد Routes
import adminUsersRoutes from "./routes/admin/adminUsersRoutes";
import adminAccountsRoutes from "./routes/admin/adminAccountsRoutes";
import adminWithdrawalRoutes from "./routes/admin/admin.withdrawal.routes";

import userRoutes from "./routes/userRoutes";

import mediaRoutes from "./routes/mediaRoutes";
import driverRoutes from "./routes/driver_app/driver.routes";
import adminDriverRoutes from "./routes/admin/admin.driver.routes";


import topupRoutes from "./routes/Wallet_V8/topupRoutes";


import driverWithdrawalRoutes from "./routes/driver_app/driver.withdrawal.routes";
import vendorRoutes from "./routes/vendor_app/vendor.routes";
import storeStatsRoutes from "./routes/admin/storeStatsRoutes";

import deliveryCategoryRoutes from "./routes/delivry_marketplace_v1/DeliveryCategoryRoutes";
import deliveryStoreRoutes from "./routes/delivry_marketplace_v1/DeliveryStoreRoutes";
import deliveryProductRoutes from "./routes/delivry_marketplace_v1/DeliveryProductRoutes";
import deliverySubCategoryRoutes from "./routes/delivry_marketplace_v1/DeliveryProductSubCategoryRoutes";
import deliveryBannerRoutes from "./routes/delivry_marketplace_v1/DeliveryBannerRoutes";
import DeliveryOfferRoutes from "./routes/delivry_marketplace_v1/DeliveryOfferRoutes";
import deliveryCartRouter from "./routes/delivry_marketplace_v1/DeliveryCartRoutes";
import deliveryOrderRoutes from "./routes/delivry_marketplace_v1/DeliveryOrderRoutes";

import StatestoreRoutes from "./routes/admin/storeStatsRoutes";
import employeeRoutes from "./routes/er/employee.routes";
import attendanceRoutes from "./routes/er/attendance.routes";
import leaveRequestRoutes from "./routes/er/leaveRequest.routes";
import performanceGoalRoutes from "./routes/er/performanceGoal.routes";
import pricingStrategyRoutes from "./routes/delivry_marketplace_v1/pricingStrategy";

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
    origin: "*", // أو حدد نطاق فرونتك فقط مثل: "https://your-app.onrender.com"
    methods: ["GET", "POST", "PUT", "DELETE"],
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

// إنجاز نسخة جديدة من swaggerDocument تتضمن الـ prefix في كل server URL

// ربط Swagger UI لعرض الوثائق

// مسارات الـ API

// قسم المستخدمين والمصادقة
app.use(`${API_PREFIX}/users`, userRoutes);


// قسم الوسائط والتحميلات
app.use(`${API_PREFIX}/media`, mediaRoutes);
app.use("/api/v1", StatestoreRoutes);

app.use(`${API_PREFIX}/employees`, employeeRoutes);
app.use(`${API_PREFIX}/attendance`, attendanceRoutes);
app.use(`${API_PREFIX}/leaves`, leaveRequestRoutes);
app.use(`${API_PREFIX}/goals`, performanceGoalRoutes);
app.use(`${API_PREFIX}/admin/notifications`, adminNotificationRoutes);
// قسم شحن المحفظة
app.use(`${API_PREFIX}/topup`, topupRoutes);

// قسم الأدمن وإدارة المنتجات
app.use(`${API_PREFIX}/admin/accounts`, adminAccountsRoutes);
app.use(`${API_PREFIX}/admin`, adminUsersRoutes);
app.use(`${API_PREFIX}/admin/drivers`, adminDriverRoutes);
app.use(`${API_PREFIX}/driver`, driverRoutes);
app.use(`${API_PREFIX}/admin/withdrawals`, adminWithdrawalRoutes);
app.use(`${API_PREFIX}/admin/storestats`, storeStatsRoutes);

// قسم التوصيل والتجارة
app.use(`${API_PREFIX}/delivery/categories`, deliveryCategoryRoutes);
app.use(`${API_PREFIX}/delivery/stores`, deliveryStoreRoutes);
app.use(`${API_PREFIX}/delivery/products`, deliveryProductRoutes);
app.use(`${API_PREFIX}/delivery/offer`, DeliveryOfferRoutes);
app.use(`${API_PREFIX}/delivery/cart`, deliveryCartRouter);
app.use(`${API_PREFIX}/delivery/order`, deliveryOrderRoutes);
app.use(`${API_PREFIX}/delivery/subcategories`, deliverySubCategoryRoutes);
app.use(`${API_PREFIX}/delivery/banners`, deliveryBannerRoutes);

// قسم طلبات وسائق التوصيل
app.use(`${API_PREFIX}/deliveryapp/withdrawals`, driverWithdrawalRoutes);


// قسم التاجر
app.use(`${API_PREFIX}/vendor`, vendorRoutes);
app.use(`${API_PREFIX}/pricing-strategies`, pricingStrategyRoutes);

// قسم الوظائف والمستقلين

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
