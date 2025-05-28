"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
// src/index.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
// Routes
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const marketRoutes_1 = __importDefault(require("./routes/marketRoutes"));
const adminProductRoutes_1 = __importDefault(require("./routes/adminProductRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const sliderRoutes_1 = __importDefault(require("./routes/sliderRoutes"));
const mediaRoutes_1 = __importDefault(require("./routes/mediaRoutes"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const DeliveryCategoryRoutes_1 = __importDefault(require("./routes/delivry/DeliveryCategoryRoutes"));
const DeliveryStoreRoutes_1 = __importDefault(require("./routes/delivry/DeliveryStoreRoutes"));
const DeliveryProductRoutes_1 = __importDefault(require("./routes/delivry/DeliveryProductRoutes"));
const DeliveryProductSubCategoryRoutes_1 = __importDefault(require("./routes/delivry/DeliveryProductSubCategoryRoutes"));
const DeliveryBannerRoutes_1 = __importDefault(require("./routes/delivry/DeliveryBannerRoutes"));
const DeliveryCartRoutes_1 = __importDefault(require("./routes/delivry/DeliveryCartRoutes"));
const DeliveryOrderRoutes_1 = __importDefault(require("./routes/delivry/DeliveryOrderRoutes"));
const userAvatarRoutes_1 = __importDefault(require("./routes/userAvatarRoutes"));
const verifyTokenSocket_1 = require("./middleware/verifyTokenSocket");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173"], // ← اسم مضيف الفرونتند
    credentials: true, // ← لو تستخدم توكنات أو كوكيز
}));
const server = http_1.default.createServer(app);
exports.io = new socket_io_1.Server(server, {
    cors: { origin: '*' }
});
exports.io.use(verifyTokenSocket_1.verifyTokenSocket);
exports.io.on('connection', socket => {
    const uid = socket.data.uid; // بعد verifyTokenSocket
    if (uid)
        socket.join(`user_${uid}`);
    socket.on('disconnect', () => socket.leave(`user_${uid}`));
});
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "";
app.use((req, _res, next) => {
    console.log(`↔️ Incoming request: ${req.method} ${req.url}`);
    next();
});
app.use(express_1.default.json());
// API Routes
app.use("/users", userRoutes_1.default);
app.use("/market", marketRoutes_1.default);
app.use("/media", mediaRoutes_1.default);
app.use("/admin/products", adminProductRoutes_1.default);
app.use("/market/categories", categoryRoutes_1.default);
app.use("/market/sliders", sliderRoutes_1.default);
app.use("/users", userAvatarRoutes_1.default);
app.use("/admin", adminRoutes_1.default);
app.use("/delivery/categories", DeliveryCategoryRoutes_1.default);
app.use("/delivery/stores", DeliveryStoreRoutes_1.default);
app.use("/delivery/products", DeliveryProductRoutes_1.default);
app.use("/delivery/cart", DeliveryCartRoutes_1.default);
app.use("/delivery/order", DeliveryOrderRoutes_1.default);
app.use("/delivery/subcategories", DeliveryProductSubCategoryRoutes_1.default);
app.use("/delivery/banners", DeliveryBannerRoutes_1.default);
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
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");
        server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    }
    catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1); // اغلاق السيرفر عند فشل الاتصال
    }
});
startServer();
