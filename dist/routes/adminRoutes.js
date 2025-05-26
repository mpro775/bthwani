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
const adminUserController_1 = require("../controllers/adminUserController");
const verifyFirebase_1 = require("../middleware/verifyFirebase");
const verifyAdmin_1 = require("../middleware/verifyAdmin");
const user_1 = require("../models/user");
const router = (0, express_1.Router)();
router.get("/users", verifyFirebase_1.verifyFirebase, adminUserController_1.getAllUsers);
router.get("/users/:id", verifyFirebase_1.verifyFirebase, adminUserController_1.getUserById);
router.patch("/users/:id", verifyFirebase_1.verifyFirebase, adminUserController_1.updateUserAdmin);
router.patch("/users/:id/role", verifyFirebase_1.verifyFirebase, verifyAdmin_1.verifyAdmin, adminUserController_1.updateUserRole);
router.get("/check-role", verifyFirebase_1.verifyFirebase, (req, res) => {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    user_1.User.findOne({ firebaseUID: req.user.id })
        .then((user) => {
        if (!user)
            return res.status(404).json({ message: "Not found" });
        return res.json({ role: user.role });
    })
        .catch((err) => res.status(500).json({ error: err.message }));
});
router.get("/stats", verifyFirebase_1.verifyFirebase, verifyAdmin_1.verifyAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const total = yield user_1.User.countDocuments();
        const admins = yield user_1.User.countDocuments({ role: "admin" });
        const users = yield user_1.User.countDocuments({ role: "user" });
        const active = yield user_1.User.countDocuments({ isBlocked: false });
        const blocked = yield user_1.User.countDocuments({ isBlocked: true });
        res.json({ total, admins, users, active, blocked });
    }
    catch (err) {
        res.status(500).json({ message: "Error loading stats", error: err });
    }
}));
exports.default = router;
