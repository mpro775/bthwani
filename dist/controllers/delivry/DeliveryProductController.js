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
const DeliveryProduct_1 = __importDefault(require("../../models/delivry/DeliveryProduct"));
// Create
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = new DeliveryProduct_1.default(req.body);
        if (!req.body.image) {
            res.status(400).json({ message: "Image URL is required" });
            return;
        }
        data.image = req.body.image;
        yield data.save();
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.create = create;
// Read all
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield DeliveryProduct_1.default.find();
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
        const data = yield DeliveryProduct_1.default.findById(req.params.id);
        if (!data) {
            res.status(404).json({ message: 'Not found' });
            res.json(data);
            return;
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getById = getById;
// Update
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield DeliveryProduct_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.update = update;
// Delete
const remove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield DeliveryProduct_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'DeliveryProduct deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.remove = remove;
