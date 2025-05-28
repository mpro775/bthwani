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
const DeliveryOffer_1 = __importDefault(require("../../models/delivry/DeliveryOffer"));
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offer = new DeliveryOffer_1.default(req.body);
        yield offer.save();
        res.status(201).json(offer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.create = create;
const getAll = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offers = yield DeliveryOffer_1.default.find().sort({ createdAt: -1 });
        res.json(offers);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAll = getAll;
const getById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offer = yield DeliveryOffer_1.default.findById(req.params.id);
        if (!offer) {
            res.status(404).json({ message: 'Offer not found' });
            return;
        }
        res.json(offer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getById = getById;
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const offer = yield DeliveryOffer_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(offer);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.update = update;
const remove = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield DeliveryOffer_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Offer deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.remove = remove;
