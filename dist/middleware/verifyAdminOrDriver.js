"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdminOrDriver = void 0;
// middleware/verifyAdminOrDriver.ts
const verifyAdminOrDriver = (req, res, next) => {
    var _a;
    const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
    if (role === "admin" || role === "driver" || role === "superadmin") {
        return next();
    }
    return res.status(403).json({ message: "غير مصرح لك" });
};
exports.verifyAdminOrDriver = verifyAdminOrDriver;
