"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductImage = exports.uploadStoreMedia = exports.uploadCategoryImg = exports.uploadSliderImage = exports.uploadCategoryImage = exports.uploadMedia = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (_req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
exports.uploadMedia = (0, multer_1.default)({
    storage,
    fileFilter: (_req, file, cb) => {
        const types = /jpeg|jpg|png|mp4|mov|webm/;
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, types.test(ext));
    },
});
exports.uploadCategoryImage = (0, multer_1.default)({
    storage,
    fileFilter: (_req, file, cb) => {
        const types = /jpeg|jpg|png/;
        cb(null, types.test(path_1.default.extname(file.originalname).toLowerCase()));
    }
});
const sliderStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, "uploads/sliders"),
    filename: (_req, file, cb) => cb(null, Date.now() + path_1.default.extname(file.originalname))
});
const uploadStore = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, "uploads/delivry/stores"),
    filename: (_req, file, cb) => cb(null, Date.now() + path_1.default.extname(file.originalname))
});
const uploadCategoryStore = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, "uploads/delivry/categories"),
    filename: (_req, file, cb) => cb(null, Date.now() + path_1.default.extname(file.originalname))
});
const uploadProductStore = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, "uploads/delivry/products"),
    filename: (_req, file, cb) => cb(null, Date.now() + path_1.default.extname(file.originalname))
});
exports.uploadSliderImage = (0, multer_1.default)({ storage: sliderStorage });
exports.uploadCategoryImg = (0, multer_1.default)({ storage: uploadCategoryStore });
exports.uploadStoreMedia = (0, multer_1.default)({ storage: uploadStore });
exports.uploadProductImage = (0, multer_1.default)({ storage: uploadStore });
