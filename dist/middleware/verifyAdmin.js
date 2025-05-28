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
exports.verifyAdmin = void 0;
const user_1 = require("../models/user");
const verifyAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const firebaseUID = req.user.uid;
        const user = yield user_1.User.findOne({ firebaseUID });
        if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
            res.status(403).json({ message: "Admin access required" });
            return;
        }
        req.userData = user;
        next();
    }
    catch (err) {
        console.error("verifyAdmin error:", err); // ✅ اطبع الخطأ الحقيقي
        res.status(500).json({ message: "Error verifying admin", error: err });
    }
});
exports.verifyAdmin = verifyAdmin;
