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
exports.verifyFirebase = void 0;
const firebaseAdmin_1 = __importDefault(require("../config/firebaseAdmin"));
const verifyFirebase = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const token = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer ")) ? authHeader.split(" ")[1] : null;
    if (!token) {
        console.warn("🔐 No token provided in Authorization header.");
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }
    try {
        console.log("🔐 Received Token:", token);
        const decoded = yield firebaseAdmin_1.default.auth().verifyIdToken(token);
        console.log("✅ Token verified. UID:", decoded.uid);
        req.user = {
            id: decoded.uid,
            uid: decoded.uid,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        console.error("❌ Firebase verification failed:", error.message || error);
        res.status(401).json({ message: "Unauthorized: Invalid token", error });
        return;
    }
});
exports.verifyFirebase = verifyFirebase;
