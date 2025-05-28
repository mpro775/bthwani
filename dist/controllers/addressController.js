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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.addAddress = void 0;
const user_1 = require("../models/user");
const addAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { label, city, street, location } = req.body;
        if (!label || !city || !street) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const user = yield user_1.User.findOne({ firebaseUID: req.user.id });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const newAddress = {
            label,
            city,
            street,
            location: {
                lat: (_b = location === null || location === void 0 ? void 0 : location.lat) !== null && _b !== void 0 ? _b : null,
                lng: (_c = location === null || location === void 0 ? void 0 : location.lng) !== null && _c !== void 0 ? _c : null,
            },
        };
        user.addresses.push(newAddress);
        yield user.save();
        res.status(200).json({ message: "Address added", addresses: user.addresses });
        return;
    }
    catch (err) {
        console.error("❌ Failed to add address:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
});
exports.addAddress = addAddress;
const updateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = yield user_1.User.findOne({ firebaseUID: req.user.uid });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const index = user.addresses.findIndex((_, i) => i.toString() === id);
        if (index === -1) {
            res.status(404).json({ message: 'Address not found' });
            return;
        }
        user.addresses[index] = Object.assign(Object.assign({}, user.addresses[index]), req.body);
        yield user.save();
        res.status(200).json(user.addresses[index]);
    }
    catch (err) {
        res.status(500).json({ message: 'Error updating address', error: err });
    }
});
exports.updateAddress = updateAddress;
const deleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = yield user_1.User.findOne({ firebaseUID: req.user.uid });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        user.addresses.splice(parseInt(id), 1);
        yield user.save();
        res.status(200).json(user.addresses);
    }
    catch (err) {
        res.status(500).json({ message: 'Error deleting address', error: err });
    }
});
exports.deleteAddress = deleteAddress;
const setDefaultAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { _id } = req.body;
        if (!_id) {
            res.status(400).json({ message: "Missing address ID" });
            return;
        }
        const user = yield user_1.User.findOne({ firebaseUID: req.user.uid });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const found = user.addresses.find((a) => { var _a; return ((_a = a._id) === null || _a === void 0 ? void 0 : _a.toString()) === _id; });
        if (!found) {
            res.status(404).json({ message: "Address not found" });
            return;
        }
        user.defaultAddressId = _id; // 👈 هذا الحقل المعتمد عندك
        yield user.save();
        res.status(200).json({ message: "تم تعيين العنوان الافتراضي", defaultAddressId: _id });
    }
    catch (err) {
        console.error("❌ Failed to set default address:", err);
        res.status(500).json({ message: "Error setting default address", error: err });
    }
});
exports.setDefaultAddress = setDefaultAddress;
