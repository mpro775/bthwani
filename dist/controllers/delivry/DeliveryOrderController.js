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
exports.updateOrderStatus = exports.getAllOrders = exports.getOrderById = exports.getUserOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../../models/delivry/Order"));
const DeliveryCart_1 = __importDefault(require("../../models/delivry/DeliveryCart"));
const user_1 = require("../../models/user");
const mongoose_1 = __importDefault(require("mongoose"));
const __1 = require("../..");
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // 1) حدد المستخدم عبر firebaseUID
        const firebaseUID = req.user.id;
        const user = yield user_1.User.findOne({ firebaseUID }).session(session);
        if (!user) {
            yield session.abortTransaction();
            res.status(404).json({ message: "المستخدم غير موجود" });
            return;
        }
        const userId = user._id;
        const cart = yield DeliveryCart_1.default.findOne({ userId }).session(session);
        if (!cart || cart.items.length === 0) {
            yield session.abortTransaction();
            res.status(400).json({ message: "السلة فارغة أو غير موجودة" });
            return;
        }
        // 2) تحقق من العنوان كما قبل
        const { addressId, notes, paymentMethod } = req.body;
        const defaultAddressId = user.defaultAddressId;
        const targetId = addressId || defaultAddressId;
        if (!targetId)
            throw new Error("يرجى اختيار عنوان صالح");
        const chosenAddress = user.addresses.find(a => a._id != null && a._id.toString() === targetId);
        if (!chosenAddress || !chosenAddress.location) {
            throw new Error("العنوان المختار غير صالح أو يفتقد الإحداثيات");
        }
        // 3) جلب السلة
        // 4) معالجة الدفع
        let paid = false;
        if (paymentMethod === 'wallet') {
            if (user.wallet.balance < cart.total) {
                yield session.abortTransaction();
                res.status(402).json({ message: "رصيد المحفظة غير كافٍ" });
                return;
            }
            user.wallet.balance -= cart.total;
            yield user.save({ session });
            paid = true;
        }
        // 5) تكوين الطلب
        const order = new Order_1.default({
            userId,
            storeId: cart.storeId,
            address: {
                label: chosenAddress.label,
                street: chosenAddress.street,
                city: chosenAddress.city,
                location: {
                    lat: chosenAddress.location.lat,
                    lng: chosenAddress.location.lng
                }
            },
            items: cart.items.map(i => ({
                productId: i.productId,
                name: i.name,
                quantity: i.quantity,
                unitPrice: i.price
            })),
            price: cart.total,
            notes,
            status: paid ? 'assigned' : 'pending',
            paymentMethod,
            paid,
        });
        yield order.save({ session });
        yield DeliveryCart_1.default.deleteOne({ _id: cart._id }).session(session);
        yield session.commitTransaction();
        // إشعارات كما قبلاً...
        const notif = {
            title: `تم إنشاء طلبك #${order._id}`,
            body: `المبلغ: ${order.price} ريال، سيتم التعامل مع طلبك قريباً.`,
            data: { orderId: order.id.toString() },
            isRead: false,
            createdAt: new Date(),
        };
        yield user_1.User.findByIdAndUpdate(userId, { $push: { notificationsFeed: notif } });
        __1.io.to(`user_${userId.toString()}`).emit('notification', notif);
        res.status(201).json(order);
        return;
    }
    catch (error) {
        yield session.abortTransaction();
        res.status(500).json({ message: error.message });
        return;
    }
    finally {
        session.endSession();
    }
});
exports.createOrder = createOrder;
const getUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const orders = yield Order_1.default.find({ userId }).sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUserOrders = getUserOrders;
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_1.default.findById(req.params.id)
            .populate("userId", "name")
            .populate("storeId", "name")
            .populate("driverId", "name");
        if (!order) {
            res.status(404).json({ message: "الطلب غير موجود" });
            return;
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getOrderById = getOrderById;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, city, storeId, driverId } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (city)
            filter.city = city;
        if (storeId)
            filter.storeId = storeId;
        if (driverId)
            filter.driverId = driverId;
        const orders = yield Order_1.default.find(filter)
            .sort({ createdAt: -1 })
            .populate("userId", "name")
            .populate("storeId", "name")
            .populate("driverId", "name");
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllOrders = getAllOrders;
// تحديث الحالة - مخصص للسائق أو الأدمن فقط
const updateOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const allowed = ['pending', 'assigned', 'delivering', 'delivered', 'cancelled'];
        if (!allowed.includes(status)) {
            res.status(400).json({ message: "حالة غير صحيحة" });
            return;
        }
        const order = yield Order_1.default.findByIdAndUpdate(id, { status }, { new: true });
        if (!order) {
            res.status(404).json({ message: "الطلب غير موجود" });
            return;
        }
        const statusMap = {
            assigned: 'تم قبول طلبك وتسليمه للسائق',
            delivering: 'طلبك قيد التوصيل',
            delivered: 'تم تسليم الطلب بنجاح',
            cancelled: 'تم إلغاء طلبك'
        };
        const notif = {
            title: `حالة الطلب #${order._id}`,
            body: statusMap[order.status] || `حالة: ${order.status}`,
            data: { orderId: order._id },
            isRead: false,
            createdAt: new Date()
        };
        // جلب الـuser نفسه من الـorder.userId
        yield user_1.User.findByIdAndUpdate(order.userId, // ObjectId هنا
        { $push: { notificationsFeed: notif } });
        // إرسال لحظياً لغرفة المستخدم التي أسميتَها user_<uid>
        __1.io.to(`user_${order.userId.toString()}`).emit('notification', notif);
        res.json(order);
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
exports.updateOrderStatus = updateOrderStatus;
