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
const mongoose_1 = __importDefault(require("mongoose"));
const firebaseAdmin_1 = __importDefault(require("../config/firebaseAdmin")); // Firebase Admin SDK
const user_1 = require("../models/user"); // نموذج المستخدم من مشروعك
const MONGO_URI = "mongodb+srv://m775071580:KPU8TxhRilLbgtyB@cluster0.hgb9fu2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const email = "admin@bthwani.com";
const password = "admin1234";
const fullName = "مدير النظام";
const role = "superadmin"; // 👈 غيّره إن أردت
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");
        // تحقق إذا كان موجود مسبقًا
        const existingUser = yield user_1.User.findOne({ email });
        if (existingUser) {
            console.log("⚠️ المستخدم موجود بالفعل في قاعدة البيانات");
            return;
        }
        // إنشاء المستخدم في Firebase
        const fbUser = yield firebaseAdmin_1.default.auth().createUser({ email, password });
        console.log("✅ Firebase user created:", fbUser.uid);
        // حفظ المستخدم في MongoDB
        const newUser = new user_1.User({
            fullName,
            email,
            firebaseUID: fbUser.uid,
            role,
        });
        yield newUser.save();
        console.log(`✅ MongoDB user saved with role: ${role}`);
    }
    catch (err) {
        console.error("❌ Error:", err);
    }
    finally {
        yield mongoose_1.default.disconnect();
        process.exit();
    }
});
run();
