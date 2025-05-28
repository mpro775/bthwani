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
exports.updateFreelancerProfile = exports.updateBloodSettings = void 0;
const user_1 = require("../models/user");
const updateBloodSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { bloodType, isAvailableToDonate } = req.body;
        if (bloodType)
            user.bloodType = bloodType;
        if (typeof isAvailableToDonate === 'boolean')
            user.isAvailableToDonate = isAvailableToDonate;
        yield user.save();
        res.status(200).json({ message: 'Blood settings updated', bloodType, isAvailableToDonate });
    }
    catch (err) {
        res.status(500).json({ message: 'Error updating blood settings', error: err });
    }
});
exports.updateBloodSettings = updateBloodSettings;
const updateFreelancerProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { isFreelancer, service, bio, portfolioImages } = req.body;
        if (typeof isFreelancer === 'boolean')
            user.isFreelancer = isFreelancer;
        // ✅ تأكد أن freelancerProfile موجود
        if (!user.freelancerProfile) {
            user.freelancerProfile = {
                service: '',
                bio: '',
                portfolioImages: []
            };
        }
        if (service)
            user.freelancerProfile.service = service;
        if (bio)
            user.freelancerProfile.bio = bio;
        if (Array.isArray(portfolioImages)) {
            user.freelancerProfile.portfolioImages = portfolioImages;
        }
        yield user.save();
        res.status(200).json({ message: 'Freelancer profile updated' });
    }
    catch (err) {
        res.status(500).json({ message: 'Error updating freelancer profile', error: err });
    }
});
exports.updateFreelancerProfile = updateFreelancerProfile;
