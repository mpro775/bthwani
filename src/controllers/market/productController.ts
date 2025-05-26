import { Request, Response } from "express";
import { Product } from "../../models/market/Product";
import { User } from "../../models/user";
import { ProductCategory } from "../../models/market/ProductCategory";

export const createProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    console.log("✅ Received body:", req.body);
    console.log("✅ Received files:", req.files);

    const uid = req.user.uid;
    const userDoc = await User.findOne({ firebaseUID: uid });
    if (!userDoc) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { mainCategory, ...rest } = req.body;

    const category = await ProductCategory.findById(mainCategory);
    if (!category) {
      res.status(400).json({ message: "Invalid category" });
      return;
    }

    // ✅ رفع الصور إلى BunnyCDN
 let media: any[] = [];
try {
  media = JSON.parse(req.body.media); // ← تأكد أنها مصفوفة نصوص
} catch {
   res.status(400).json({ message: "Invalid media format" });
   return;
}


    const product = new Product({
      ...rest,
      media,
      mainCategory,
      mainCategoryName: category.name,
      user: {
        name: userDoc.fullName,
        phone: userDoc.phone,
        profileImage: userDoc.profileImage,
      },
    });

    await product.save();
    userDoc.postsCount++;
    await userDoc.save();

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: "Error creating product", error: err });
  }
};


// جلب جميع المنتجات (للمستخدمين)
export const getAllProducts = async (_: Request, res: Response) => {
  try {
    const products = await Product.find({ isActive: true, isApproved: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products", error: err });
  }
};

// جلب منتج واحد
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
res.status(404).json({ message: "Product not found" });

        return;
    } 
    product.viewsCount++;
    await product.save();

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product", error: err });
  }
};

// تعديل منتج (المالك فقط)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
res.status(404).json({ message: "Product not found" });
        return;
    } 

    // لاحقًا يمكننا فحص التحقق من الملكية
    Object.assign(product, req.body);
    await product.save();

    res.json({ message: "Product updated", product });
  } catch (err) {
    res.status(500).json({ message: "Error updating product", error: err });
  }
};

// حذف منتج (soft delete)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
res.status(404).json({ message: "Product not found" });
        return;
    } 
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product", error: err });
  }
};
// ✅ Toggle إعجاب منتج
export const toggleLikeProduct = async (req: Request, res: Response) => {
  try {
              if (!req.user?.uid) {
     res.status(401).json({ message: "Unauthorized" });
     return;
  }
    const uid = req.user.uid;
    const product = await Product.findById(req.params.id);
    if (!product) {
 res.status(404).json({ message: "Product not found" });
        return;
    }


    const index = product.likes.indexOf(uid);
    if (index > -1) {
      product.likes.splice(index, 1); // إلغاء إعجاب
    } else {
      product.likes.push(uid); // إضافة إعجاب
    }

    await product.save();
    res.json({ message: "Like toggled", likesCount: product.likes.length });
  } catch (err) {
    res.status(500).json({ message: "Error toggling like", error: err });
  }
};

// ✅ إضافة تعليق
export const addComment = async (req: Request, res: Response) => {
  try {
              if (!req.user?.uid) {
     res.status(401).json({ message: "Unauthorized" });
     return;
  }

    const uid = req.user.uid;
    const user = await User.findOne({ firebaseUID: uid });
    const { text } = req.body;

    if (!user || !text) {
res.status(400).json({ message: "Invalid input" });
        return;
    } 

    const product = await Product.findById(req.params.id);
  if (!product) {
 res.status(404).json({ message: "Product not found" });
        return;
    }

    product.comments.push({ user: user.fullName || uid, text });
    await product.save();

    res.json({ message: "Comment added", comments: product.comments });
  } catch (err) {
    res.status(500).json({ message: "Error adding comment", error: err });
  }
};

// ✅ تغيير حالة الموافقة/التفعيل
export const adminUpdateStatus = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
res.status(404).json({ message: "Product not found" });
        return;
    } 

    const { isApproved, isActive } = req.body;
    if (typeof isApproved === "boolean") product.isApproved = isApproved;
    if (typeof isActive === "boolean") product.isActive = isActive;

    await product.save();
    res.json({ message: "Status updated", product });
  } catch (err) {
    res.status(500).json({ message: "Error updating status", error: err });
  }
};

// 🔍 جلب المنتجات غير المعتمدة
export const getUnapprovedProducts = async (_: Request, res: Response) => {
  try {
    const products = await Product.find({ isApproved: false }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching unapproved products", error: err });
  }
};

// ✅ فلترة المنتجات حسب التصنيف والسعر والحالة
// GET /market/products?category=...&minPrice=...&maxPrice=...&condition=...

export const getFilteredProducts = async (req: Request, res: Response) => {
  try {
    const filter: any = { isActive: true, isApproved: true };

    const getString = (val: any, fallback = "") => (typeof val === "string" ? val : fallback);
    const getNumber = (val: any, fallback = 0) => {
      const parsed = parseInt(getString(val));
      return isNaN(parsed) ? fallback : parsed;
    };

    const category = getString(req.query.category);
    const condition = getString(req.query.condition);
    const search = getString(req.query.search);
    const hasOffer = getString(req.query.hasOffer);

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (hasOffer === "true") filter.hasOffer = true;
    if (search) filter.name = { $regex: search, $options: "i" };

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      const minPrice = getNumber(req.query.minPrice);
      const maxPrice = getNumber(req.query.maxPrice);
      if (minPrice > 0) filter.price.$gte = minPrice;
      if (maxPrice > 0) filter.price.$lte = maxPrice;
    }

    const page = getNumber(req.query.page, 1);
    const limit = getNumber(req.query.limit, 10);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error filtering products", error: err });
  }
};

// ✅ عرض المنتجات التي تحتوي على عرض قائم (حسب remainingTime)
// GET /market/products/active-offers

export const getActiveOffers = async (_: Request, res: Response) => {
  try {
    const now = new Date();
    const products = await Product.find({
      isApproved: true,
      isActive: true,
      hasOffer: true,
      offerExpiresAt: { $gt: now }
    }).sort({ offerExpiresAt: 1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching active offers", error: err });
  }
};

// ✅ منتجات مشابهة حسب التصنيف أو الكلمات المفتاحية
// GET /market/products/:id/similar

export const getSimilarProducts = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
 res.status(404).json({ message: "Product not found" });
        return;
    }

    const similar = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true,
      isApproved: true
    }).limit(10);

    res.json(similar);
  } catch (err) {
    res.status(500).json({ message: "Error fetching similar products", error: err });
  }
};