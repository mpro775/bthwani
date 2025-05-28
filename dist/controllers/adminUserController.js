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
exports.updateUserRole = exports.updateUserAdmin = exports.getUserById = exports.getAllUsers = void 0;
const user_1 = require("../models/user");
// ✅ عرض كل المستخدمين
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role, isVerified, isBanned } = req.query;
        const filter = {};
        if (role)
            filter.role = role;
        if (isVerified !== undefined)
            filter.isVerified = isVerified === "true";
        if (isBanned !== undefined)
            filter.isBanned = isBanned === "true";
        const users = yield user_1.User.find(filter).select("-security -wallet -activityLog");
        res.json(users);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err });
    }
});
exports.getAllUsers = getAllUsers;
// ✅ عرض مستخدم بالتفصيل
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching user", error: err });
    }
});
exports.getUserById = getUserById;
// ✅ تعديل صلاحيات مستخدم أو حظره
const updateUserAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const { role, isBanned, isVerified } = req.body;
        if (role)
            user.role = role;
        if (typeof isBanned === "boolean")
            user.isBanned = isBanned;
        if (typeof isVerified === "boolean")
            user.isVerified = isVerified;
        yield user.save();
        res.status(200).json({ message: "User updated successfully" });
    }
    catch (err) {
        res.status(500).json({ message: "Error updating user", error: err });
    }
});
exports.updateUserAdmin = updateUserAdmin;
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { role } = req.body;
    const user = yield user_1.User.findById(req.params.id);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    user.role = role;
    yield user.save();
    res.json({ message: "Role updated successfully" });
});
exports.updateUserRole = updateUserRole;
// export const loginDriver = async (req: Request, res: Response) => {
//   const { phone, password } = req.body;
//   try {
//     const driver = await User.findOne({ phone });
//     if (!driver) return res.status(400).json({ message: 'رقم الهاتف غير مسجل' });
//     const isMatch = await driver.comparePassword(password);
//     if (!isMatch) return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });
//     const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET || 'secret123', {
//       expiresIn: '7d'
//     });
//     res.json({ token, driver });
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// };
