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
exports.getTransferHistory = exports.transferFunds = exports.getTransactions = exports.getWallet = void 0;
const user_1 = require("../models/user");
const getWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(200).json(user.wallet);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching wallet", error: err });
    }
});
exports.getWallet = getWallet;
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        res.status(200).json(user.transactions);
    }
    catch (err) {
        res
            .status(500)
            .json({ message: "Error fetching transactions", error: err });
    }
});
exports.getTransactions = getTransactions;
const transferFunds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { targetUID, amount, description } = req.body;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const sender = yield user_1.User.findOne({ firebaseUID: req.user.uid });
    const receiver = yield user_1.User.findOne({ firebaseUID: targetUID });
    if (!sender || !receiver) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    if (!sender.wallet || !receiver.wallet) {
        res
            .status(500)
            .json({ message: "Wallet data is missing for one of the users." });
        return;
    }
    if (sender.wallet.balance < amount) {
        res.status(400).json({ message: "Insufficient funds" });
        return;
    }
    sender.wallet.balance -= amount;
    receiver.wallet.balance += amount;
    const now = new Date();
    sender.transactions.push({ amount, type: "debit", description, date: now });
    receiver.transactions.push({
        amount,
        type: "credit",
        description,
        date: now,
    });
    yield sender.save();
    yield receiver.save();
    res.json({ message: "Transfer successful" });
});
exports.transferFunds = transferFunds;
const getTransferHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.uid)) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const user = yield user_1.User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    res.json(user.transactions || []);
});
exports.getTransferHistory = getTransferHistory;
