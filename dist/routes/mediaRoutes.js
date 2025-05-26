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
const express_1 = require("express");
const verifyFirebase_1 = require("../middleware/verifyFirebase");
const router = (0, express_1.Router)();
router.post("/sign-upload", verifyFirebase_1.verifyFirebase, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { filename } = req.body;
    const uploadUrl = `https://storage.bunnycdn.com/${process.env.BUNNY_STORAGE_ZONE}/${filename}`;
    const accessKey = process.env.BUNNY_STORAGE_KEY;
    console.log("🧠 mediaRoutes registered");
    res.json({
        uploadUrl,
        headers: {
            "AccessKey": accessKey,
            "Content-Type": "image/jpeg", // يمكن تغييره حسب نوع الملف
        },
    });
}));
exports.default = router;
