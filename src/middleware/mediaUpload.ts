// @ts-nocheck
import { RequestHandler } from "express";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

export const uploadMedia = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const types = /jpeg|jpg|png|mp4|mov|webm/;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, types.test(ext));
  },
});



export const uploadCategoryImage = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const types = /jpeg|jpg|png/;
    cb(null, types.test(path.extname(file.originalname).toLowerCase()));
  }
});

const sliderStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/sliders"),
  filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const uploadStore = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/delivry/stores"),
  filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const uploadCategoryStore = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/delivry/categories"),
  filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const uploadProductStore = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/delivry/products"),
  filename: (_req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});



export const uploadSliderImage = multer({ storage: sliderStorage });

export const uploadCategoryImg = multer({ storage:uploadCategoryStore });


export const uploadStoreMedia = multer({storage: uploadStore });
export const uploadProductImage  = multer({storage: uploadStore });
