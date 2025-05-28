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
exports.logLogin = void 0;
const user_1 = require("../models/user");
const logLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
        return next();
    }
    try {
        const ip = req.ip || "unknown"; // ✅ معالجة ip
        const userAgent = req.headers["user-agent"] || "unknown"; // ✅ معالجة user-agent
        const user = yield user_1.User.findOne({ firebaseUID: req.user.uid });
        if (user) {
            user.loginHistory.push({ ip, userAgent, at: new Date() });
            yield user.save();
        }
    }
    catch (err) {
        console.error("Error logging login:", err);
    }
    next();
});
exports.logLogin = logLogin;
