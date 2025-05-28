"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeIsOpen = computeIsOpen;
// src/utils/storeStatus.ts
const dayjs_1 = __importDefault(require("dayjs"));
function computeIsOpen(schedule, forceClosed, forceOpen) {
    if (forceOpen)
        return true;
    if (forceClosed)
        return false;
    const now = (0, dayjs_1.default)();
    const today = now.format("dddd").toLowerCase();
    const entry = schedule.find(e => e.day === today && e.open);
    if (!entry)
        return false;
    const from = (0, dayjs_1.default)(entry.from, "HH:mm");
    const to = (0, dayjs_1.default)(entry.to, "HH:mm");
    // تحقق من from <= now < to
    const afterOrEqual = now.isAfter(from) || now.isSame(from);
    const before = now.isBefore(to);
    return afterOrEqual && before;
}
