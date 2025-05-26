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
exports.markAllNotificationsRead = exports.getNotifications = void 0;
const user_1 = require("../models/user");
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    res.json(user.notificationsFeed || []);
});
exports.getNotifications = getNotifications;
const markAllNotificationsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    user.notificationsFeed.forEach(n => n.isRead = true);
    yield user.save();
    res.json({ message: "All marked as read" });
});
exports.markAllNotificationsRead = markAllNotificationsRead;
