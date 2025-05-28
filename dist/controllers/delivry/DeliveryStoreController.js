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
const mongoose_1 = __importDefault(require("mongoose"));
const DeliveryStore_1 = __importDefault(require("../../models/delivry/DeliveryStore"));
const storeStatus_1 = require("../../utils/storeStatus");
// Create a new delivery store
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = Object.assign({}, req.body);
        // Convert category to ObjectId if valid
        if (body.category && mongoose_1.default.Types.ObjectId.isValid(body.category)) {
            body.category = new mongoose_1.default.Types.ObjectId(body.category);
        }
        // Parse schedule JSON string into array
        if (typeof body.schedule === 'string') {
            try {
                body.schedule = JSON.parse(body.schedule);
            }
            catch (err) {
                res.status(400).json({ message: 'Invalid schedule format' });
                return;
            }
        }
        // Convert lat/lng to location object
        if (body.lat != null && body.lng != null) {
            body.location = {
                lat: parseFloat(body.lat),
                lng: parseFloat(body.lng),
            };
            delete body.lat;
            delete body.lng;
        }
        // Ensure image and logo URLs are provided
        if (!body.image || !body.logo) {
            res.status(400).json({ message: 'Image and logo URLs are required' });
            return;
        }
        const data = new DeliveryStore_1.default(body);
        yield data.save();
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.create = create;
// Read all delivery stores
const getAll = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.query;
        const filter = { isActive: true };
        // Filter by category if provided
        if (categoryId && mongoose_1.default.Types.ObjectId.isValid(categoryId.toString())) {
            filter.category = new mongoose_1.default.Types.ObjectId(categoryId.toString());
        }
        // Fetch stores
        const stores = yield DeliveryStore_1.default.find(filter)
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .lean();
        const enriched = stores.map((store) => {
            const isOpen = (0, storeStatus_1.computeIsOpen)(store.schedule, !!store.forceClosed, !!store.forceOpen);
            return Object.assign(Object.assign({}, store), { isOpen });
        });
        res.json(enriched);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAll = getAll;
// Read a single delivery store by ID
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const store = yield DeliveryStore_1.default.findById(req.params.id).lean();
        if (!store) {
            res.status(404).json({ message: 'Not found' });
            return;
        }
        const enrichedStore = Object.assign(Object.assign({}, store), { isOpen: (0, storeStatus_1.computeIsOpen)(store.schedule, !!store.forceClosed, !!store.forceOpen) });
        res.json(enrichedStore);
        return;
    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return;
    }
});
exports.getById = getById;
// Update an existing delivery store
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = Object.assign({}, req.body);
        // Convert lat/lng to location object if present
        if (body.lat != null && body.lng != null) {
            body.location = {
                lat: parseFloat(body.lat),
                lng: parseFloat(body.lng),
            };
            delete body.lat;
            delete body.lng;
        }
        // Parse schedule JSON string into array
        if (typeof body.schedule === 'string') {
            try {
                body.schedule = JSON.parse(body.schedule);
            }
            catch (err) {
                res.status(400).json({ message: 'Invalid schedule format' });
                return;
            }
        }
        // Convert category to ObjectId if valid
        if (body.category && mongoose_1.default.Types.ObjectId.isValid(body.category)) {
            body.category = new mongoose_1.default.Types.ObjectId(body.category);
        }
        const updated = yield DeliveryStore_1.default.findByIdAndUpdate(req.params.id, body, { new: true });
        if (!updated) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.update = update;
// Delete a delivery store
const remove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield DeliveryStore_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'DeliveryStore deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.remove = remove;
