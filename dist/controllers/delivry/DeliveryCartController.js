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
exports.removeItem = exports.getAbandonedCarts = exports.getAllCarts = exports.mergeCart = exports.clearCart = exports.getCart = exports.addToCart = void 0;
const DeliveryCart_1 = __importDefault(require("../../models/delivry/DeliveryCart"));
const uuid_1 = require("uuid");
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId: cid, userId, productId, name, price, quantity, storeId, image } = req.body;
    const cartId = cid || (0, uuid_1.v4)();
    const filter = userId ? { userId } : { cartId };
    let cart = yield DeliveryCart_1.default.findOne(filter);
    if (cart && cart.storeId.toString() !== storeId) {
        res.status(400).json({ message: "لا يمكن طلب من متجر مختلف" });
        return;
    }
    const item = { productId, name, price, quantity, storeId, image };
    if (!cart) {
        cart = new DeliveryCart_1.default({ cartId, userId, storeId, items: [item], total: price * quantity });
    }
    else {
        const idx = cart.items.findIndex(i => i.productId.toString() === productId);
        if (idx > -1)
            cart.items[idx].quantity += quantity;
        else
            cart.items.push(item);
        cart.total += price * quantity;
    }
    yield cart.save();
    res.status(201).json({ cart, cartId: cart.cartId });
    return;
});
exports.addToCart = addToCart;
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cartId, userId } = req.params;
        const filter = userId ? { userId } : { cartId };
        const cart = yield DeliveryCart_1.default.findOne(filter);
        if (!cart) {
            res.status(404).json({ message: 'سلة فارغة' });
            return;
        }
        res.json(cart);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.getCart = getCart;
const clearCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cartId, userId } = req.params;
        const filter = userId ? { userId } : { cartId };
        yield DeliveryCart_1.default.findOneAndDelete(filter);
        res.json({ message: 'تم حذف السلة بنجاح' });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.clearCart = clearCart;
const mergeCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id; // تأكدنا من verifyToken
    const guestItems = req.body.items;
    if (!Array.isArray(guestItems) || guestItems.length === 0) {
        res.status(400).json({ message: 'لا توجد عناصر للدمج' });
        return;
    }
    // ابني أو حدّث السلة للمستخدم
    const cart = yield DeliveryCart_1.default.findOneAndUpdate({ userId }, {
        $inc: { total: 0 },
        $setOnInsert: { userId, storeId: req.body.storeId },
        $push: { items: { $each: guestItems } }
    }, { upsert: true, new: true });
    res.json(cart);
    return;
});
exports.mergeCart = mergeCart;
const getAllCarts = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const carts = yield DeliveryCart_1.default.find().sort({ createdAt: -1 });
        res.json(carts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllCarts = getAllCarts;
const getAbandonedCarts = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const THIRTY_MINUTES_AGO = new Date(Date.now() - 30 * 60 * 1000);
        const carts = yield DeliveryCart_1.default.find({ createdAt: { $lt: THIRTY_MINUTES_AGO } });
        res.json(carts);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAbandonedCarts = getAbandonedCarts;
const removeItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cartId, userId, productId } = Object.assign(Object.assign({}, req.params), (req.params.userId && { userId: req.params.userId }));
    const filter = userId ? { userId } : { cartId };
    const cart = yield DeliveryCart_1.default.findOne(filter);
    if (!cart) {
        res.status(404).json({ message: 'سلة غير موجودة' });
        return;
    }
    cart.items = cart.items.filter(i => i.productId.toString() !== productId);
    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    yield cart.save();
    res.json(cart);
});
exports.removeItem = removeItem;
