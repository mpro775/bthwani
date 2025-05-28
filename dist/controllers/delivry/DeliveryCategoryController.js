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
const DeliveryCategory_1 = __importDefault(require("../../models/delivry/DeliveryCategory"));
// Create
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        if (!body.image) {
            res.status(400).json({ message: "Image URL is required" });
            return;
        }
        const data = new DeliveryCategory_1.default(body);
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
        const data = yield DeliveryCategory_1.default.find();
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
        const data = yield DeliveryCategory_1.default.findById(req.params.id);
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
        const body = req.body;
        const updated = yield DeliveryCategory_1.default.findByIdAndUpdate(req.params.id, body, { new: true });
        if (!updated) {
            res.status(404).json({ message: "Category not found" });
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
        yield DeliveryCategory_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'DeliveryCategory deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.remove = remove;
