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
exports.getAddresses = exports.deactivateAccount = exports.getUserStats = exports.verifyPinCode = exports.setPinCode = exports.getLoginHistory = exports.updateSecurity = exports.updateProfile = exports.getCurrentUser = exports.registerOrUpdateUser = void 0;
const user_1 = require("../models/user");
const registerOrUpdateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const { uid, email } = req.user;
    const body = req.body;
    const name = req.body.fullName || "مستخدم";
    try {
        let user = yield user_1.User.findOne({ firebaseUID: uid });
        if (!user) {
            user = new user_1.User(Object.assign({ fullName: name, email, firebaseUID: uid }, body));
        }
        else {
            Object.assign(user, body);
        }
        yield user.save();
        res.status(200).json(user);
    }
    catch (err) {
        res.status(500).json({ message: 'Error saving user', error: err });
    }
});
exports.registerOrUpdateUser = registerOrUpdateUser;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = yield user_1.User.findOne({ firebaseUID: req.user.uid }).lean();
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // 🔍 البحث عن عنوان مطابق للـ defaultAddressId
        const defaultAddress = ((_b = user.addresses) === null || _b === void 0 ? void 0 : _b.find((addr) => { var _a, _b; return ((_a = addr._id) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = user.defaultAddressId) === null || _b === void 0 ? void 0 : _b.toString()); })) || ((_c = user.addresses) === null || _c === void 0 ? void 0 : _c[0]) || null;
        res.status(200).json(Object.assign(Object.assign({}, user), { defaultAddress }));
        return;
    }
    catch (error) {
        console.error("❌ Error fetching user:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
});
exports.getCurrentUser = getCurrentUser;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const { fullName, aliasName, phone, language, theme, profileImage, } = req.body;
        // ✅ تحقق من undefined فقط (للسماح بالقيم الفارغة)
        if (fullName !== undefined)
            user.fullName = fullName;
        if (aliasName !== undefined)
            user.aliasName = aliasName;
        if (phone !== undefined)
            user.phone = phone;
        if (language !== undefined)
            user.language = language;
        if (theme !== undefined)
            user.theme = theme;
        if (profileImage !== undefined)
            user.profileImage = profileImage;
        yield user.save();
        res.status(200).json(user);
    }
    catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: 'Error updating profile', error: err });
    }
});
exports.updateProfile = updateProfile;
const updateSecurity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = yield user_1.User.findOne({ firebaseUID: req.user.uid });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const { pinCode, twoFactorEnabled } = req.body;
        if (pinCode)
            user.security.pinCode = pinCode;
        if (typeof twoFactorEnabled === "boolean") {
            user.security.twoFactorEnabled = twoFactorEnabled;
        }
        yield user.save();
        res.status(200).json({ message: "Security settings updated" });
    }
    catch (err) {
        res.status(500).json({ message: "Error updating security", error: err });
    }
});
exports.updateSecurity = updateSecurity;
const getLoginHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const user = yield user_1.User.findOne({ firebaseUID: req.user.uid });
    if (!user)
        return res.status(404).json({ message: "User not found" });
    res.json(user.loginHistory || []);
});
exports.getLoginHistory = getLoginHistory;
const setPinCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { pinCode } = req.body;
    if (!pinCode) {
        res.status(400).json({ message: "PIN is required" });
        return;
    }
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const user = yield user_1.User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    user.security.pinCode = pinCode;
    yield user.save();
    res.json({ message: "PIN set successfully" });
});
exports.setPinCode = setPinCode;
const verifyPinCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { pinCode } = req.body;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const user = yield user_1.User.findOne({ firebaseUID: req.user.uid });
    if (!user || !user.security.pinCode) {
        res.status(404).json({ message: "No PIN set for this user" });
        return;
    }
    if (user.security.pinCode !== pinCode) {
        res.status(403).json({ message: "Incorrect PIN" });
        return;
    }
    res.json({ message: "PIN verified" });
});
exports.verifyPinCode = verifyPinCode;
const getUserStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const user = yield user_1.User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const stats = {
        postsCount: user.postsCount || 0,
        followersCount: user.followersCount || 0,
        favoritesCount: ((_b = user.favorites) === null || _b === void 0 ? void 0 : _b.length) || 0,
        messagesCount: user.messagesCount || 0,
    };
    res.json(stats);
});
exports.getUserStats = getUserStats;
const deactivateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const user = yield user_1.User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    user.isActive = false;
    yield user.save();
    res.json({ message: "Account deactivated" });
});
exports.deactivateAccount = deactivateAccount;
const getAddresses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const firebaseUID = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!firebaseUID) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        // ابحث حسب Firebase UID
        const user = yield user_1.User.findOne({ firebaseUID })
            .select('addresses defaultAddressId')
            .exec();
        if (!user) {
            res.status(404).json({ message: 'المستخدم غير موجود' });
            return;
        }
        res.json({
            addresses: user.addresses,
            defaultAddressId: user.defaultAddressId,
        });
        return;
    }
    catch (err) {
        res.status(500).json({ message: err.message });
        return;
    }
});
exports.getAddresses = getAddresses;
