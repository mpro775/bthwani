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
exports.remove = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const DeliveryBanner_1 = __importDefault(require("../../models/delivry/DeliveryBanner"));
// Create
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = new DeliveryBanner_1.default(req.body);
        yield data.save();
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.create = create;
// Get all active banners (filtered for slider)
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const data = yield DeliveryBanner_1.default.find({
            isActive: true,
            $or: [
                { startDate: null, endDate: null },
                {
                    startDate: { $lte: now },
                    endDate: { $gte: now }
                },
                {
                    startDate: { $lte: now },
                    endDate: { $exists: false }
                },
                {
                    startDate: { $exists: false },
                    endDate: { $gte: now }
                }
            ]
        }).sort({ order: 1, createdAt: -1 });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAll = getAll;
// Read by ID
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield DeliveryBanner_1.default.findById(req.params.id);
        if (!data) {
            res.status(404).json({ message: 'Not found' });
            return;
        }
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getById = getById;
// Update
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield DeliveryBanner_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.update = update;
// Delete
const remove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield DeliveryBanner_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'DeliveryBanner deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.remove = remove;
