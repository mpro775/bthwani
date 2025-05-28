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
exports.getActivityLog = exports.getFollowing = exports.getFollowers = exports.unfollowUser = exports.followUser = void 0;
const user_1 = require("../models/user");
// 📌 متابعة مستخدم
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const followerUID = req.user.uid;
    const { targetId } = req.params;
    try {
        const currentUser = yield user_1.User.findOne({ firebaseUID: followerUID });
        const targetUser = yield user_1.User.findById(targetId);
        if (!currentUser || !targetUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (!currentUser.following)
            currentUser.following = [];
        if (!targetUser.followers)
            targetUser.followers = [];
        if (!currentUser.following.includes(targetId)) {
            currentUser.following.push(targetId);
            currentUser.activityLog.push({ action: "follow", target: targetId });
            targetUser.followers.push(currentUser._id.toString());
            targetUser.followersCount = (targetUser.followersCount || 0) + 1;
            yield currentUser.save();
            yield targetUser.save();
        }
        res.status(200).json({ message: "Followed successfully" });
    }
    catch (err) {
        res.status(500).json({ message: "Error following user", error: err });
    }
});
exports.followUser = followUser;
// 📌 إلغاء متابعة
const unfollowUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const followerUID = req.user.uid;
    const { targetId } = req.params;
    try {
        const currentUser = yield user_1.User.findOne({ firebaseUID: followerUID });
        const targetUser = yield user_1.User.findById(targetId);
        if (!currentUser || !targetUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        currentUser.following = (currentUser.following || []).filter(id => id !== targetId);
        targetUser.followers = (targetUser.followers || []).filter(id => id !== currentUser._id.toString());
        if (targetUser.followersCount && targetUser.followersCount > 0) {
            targetUser.followersCount--;
        }
        yield currentUser.save();
        yield targetUser.save();
        res.status(200).json({ message: "Unfollowed successfully" });
    }
    catch (err) {
        res.status(500).json({ message: "Error unfollowing user", error: err });
    }
});
exports.unfollowUser = unfollowUser;
// 📌 عرض المتابعين
const getFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.findById(req.params.id).populate("followers", "fullName profileImage");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user.followers || []);
    }
    catch (err) {
        res.status(500).json({ message: "Error retrieving followers", error: err });
    }
});
exports.getFollowers = getFollowers;
// 📌 عرض المتابَعين
const getFollowing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.findById(req.params.id).populate("following", "fullName profileImage");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user.following || []);
    }
    catch (err) {
        res.status(500).json({ message: "Error retrieving following", error: err });
    }
});
exports.getFollowing = getFollowing;
// 📌 سجل النشاطات
const getActivityLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const user = yield user_1.User.findOne({ firebaseUID: req.user.uid });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user.activityLog || []);
    }
    catch (err) {
        res.status(500).json({ message: "Error retrieving activity log", error: err });
    }
});
exports.getActivityLog = getActivityLog;
