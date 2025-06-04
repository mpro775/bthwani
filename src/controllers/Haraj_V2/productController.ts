import { Request, Response } from "express";
import { Product } from "../../models/Haraj_V2/Product";
import { User } from "../../models/user";
import { ProductCategory } from "../../models/Haraj_V2/ProductCategory";
import { ProductReport } from "../../models/Haraj_V2/ProductReport";
import { BarterRequest } from "../../models/Haraj_V2/BarterRequest";
import { io } from "../..";
import mongoose from "mongoose";

export const createProduct = async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const firebaseUID = req.user.uid;
    const user = await User.findOne({ firebaseUID });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    console.log("✅ Received body:", req.body);

    const { categoryId, isAuction, auctionEndDate, ...rest } = req.body;

    const category = await ProductCategory.findById(categoryId);
    if (!category) {
      res.status(400).json({ message: "Invalid category" });
      return;
    }

    // فحص المزاد إذا مفعل
    if (isAuction) {
      const now = new Date();
      const end = new Date(auctionEndDate);
      const maxDuration = 7 * 24 * 60 * 60 * 1000;
      const forbidden = ["عقارات", "معدات ثقيلة"];

      if (end.getTime() - now.getTime() > maxDuration) {
        res.status(400).json({ message: "الحد الأقصى لمدة المزاد هو 7 أيام" });
        return;
      }

      if (forbidden.includes(category.name)) {
        res
          .status(400)
          .json({ message: `الفئة "${category.name}" غير مسموحة بالمزاد` });
        return;
      }

      const starting = req.body.startingPrice;
      const final = req.body.price;

      if (starting > 100000 || final > 100000) {
        res.status(400).json({
          message: "السعر المبدئي أو النهائي لا يمكن أن يتجاوز 100,000 ﷼",
        });
        return;
      }
    }

    // media
    let media: any[] = [];
    try {
      media = Array.isArray(req.body.media)
        ? req.body.media
        : JSON.parse(req.body.media);
    } catch {
      res.status(400).json({ message: "Invalid media format" });
      return;
    }

    // إنشاء المنتج
    const product = new Product({
      ...rest,
      media,
      mainCategory: categoryId,
      user: user._id,
      firebaseUID,
    });

    // فحص الكلمات الممنوعة
    const bannedWords = ["ممنوع", "مخدرات", "ممنوعات", "مخالف", "إباحية"];
    const containsBadWords = bannedWords.some((word) =>
      product.description?.includes(word)
    );
    if (containsBadWords) {
      product.isApproved = false;
    }

    await product.save();

    user.postsCount++;
    await user.save();

    // إرسال تنبيهات للمستخدمين المهتمين
    const usersToNotify = await User.find({
      favoriteCategories: product.mainCategory,
    });

    usersToNotify.forEach((user) => {
      io.to(`user_${user.firebaseUID}`).emit("category_alert", {
        categoryId: product.mainCategory,
        productId: product._id,
        message: `📢 تم نشر منتج جديد في فئة تهمك: ${category.name}`,
      });
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Error in createProduct:", err);
    res.status(500).json({ message: "Error creating product", error: err });
  }
};

// جلب جميع المنتجات (للمستخدمين)
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { mainCategory, hasOffer, search, page = 1, limit = 6 } = req.query;

    const query: any = {
      isActive: true,
      isApproved: true,
    };

    if (mainCategory && mainCategory !== "all") {
      try {
        query.mainCategory = new mongoose.Types.ObjectId(
          mainCategory as string
        );
        console.log("✅ تصفية على الفئة:", query.mainCategory);
      } catch (err) {
        res.status(400).json({ message: "معرف فئة غير صالح" });
        return;
      }
    }

    if (hasOffer === "true") {
      query.hasOffer = true;
    }

    if (search) {
      query.name = { $regex: new RegExp(search as string, "i") };
    }

    const skip = (Number(page) - 1) * Number(limit);
    console.log("🔍 الاستعلام النهائي:", query);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json(products);
  } catch (err) {
    console.error("❌ خطأ أثناء جلب المنتجات:", err);
    res.status(500).json({ message: "حدث خطأ في الخادم", error: err });
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

    console.log("🧠 المستخدم في الباك:", product.user); // هنا سيكون كائن حقيقي وليس ObjectId

     res.json(product); // ✅ فقط هنا ترجع البيانات
     return;
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    res.status(500).json({ message: "Error fetching product", error: err });
  }
};

export const reportProduct = async (req: Request, res: Response) => {
  const { reason } = req.body;
  const reporterId = (req as any).user.uid;
  const productId = req.params.id;

  await ProductReport.create({ productId, reporterId, reason });
  res.status(200).json({ message: "تم إرسال البلاغ بنجاح" });
};
export const requestBarter = async (req: Request, res: Response) => {
  const requesterId = (req as any).user.uid;
  const { offeredProductId, message } = req.body;
  const productId = req.params.id;

  await BarterRequest.create({
    productId,
    offeredProductId,
    requesterId,
    message,
  });
  res.status(200).json({ message: "تم إرسال طلب المقايضة" });
};

// تعديل منتج (المالك فقط)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    console.log("📥 البيانات المستلمة للتعديل:", req.body);

    // تحديث الحقول
    for (const key in req.body) {
      if (key === "specs" || key === "media") {
        product[key] = req.body[key];
        product.markModified(key); // ✅ مهم جدًا
      } else {
        (product as any)[key] = req.body[key];
      }
    }

    // إذا تم إرسال categoryId
    if (req.body.categoryId) {
      product.mainCategory = req.body.categoryId;
    }

    await product.save();

    res.json({ message: "✅ Product updated", product });
  } catch (err) {
    console.error("❌ Error:", err);
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

    product.comments.push({
      user: user._id,
      text,
    });
    await product.save();

    res.json({ message: "Comment added", comments: product.comments });
  } catch (err) {
    res.status(500).json({ message: "Error adding comment", error: err });
  }
};
export const getMyProducts = async (req: any, res: any) => {
  try {
    const firebaseUID = req.user?.uid;
    if (!firebaseUID) {
      console.warn("🚫 لا يوجد UID");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      console.warn("🚫 لم يتم العثور على المستخدم");
      res.status(404).json({ message: "User not found" });
      return;
    }

    const products = await Product.find({ user: user._id });
    console.log("🔥 Firebase UID من التوكن:", firebaseUID);
    console.log("✅ عدد المنتجات:", products.length);

    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching user's products:", error);
    res.status(500).json({ message: "حدث خطأ أثناء جلب المنتجات" });
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
    const products = await Product.find({ isApproved: false }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching unapproved products", error: err });
  }
};

// ✅ فلترة المنتجات حسب التصنيف والسعر والحالة
// GET /market/products?category=...&minPrice=...&maxPrice=...&condition=...

export const getFilteredProducts = async (req: Request, res: Response) => {
  try {
    const filter: any = { isActive: true, isApproved: true };

    const getString = (val: any, fallback = "") =>
      typeof val === "string" ? val : fallback;
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
      offerExpiresAt: { $gt: now },
    }).sort({ offerExpiresAt: 1 });

    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching active offers", error: err });
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
      category: product.mainCategory,
      isActive: true,
      isApproved: true,
    }).limit(10);

    res.json(similar);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching similar products", error: err });
  }
};

export const getProductBids = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product || !product.isAuction) {
      res.status(404).json({ message: "المنتج ليس مزاداً أو غير موجود" });
      return;
    }

    const populatedBids = await Promise.all(
      (product.bids || []).map(async (bid) => {
        const user = await User.findById(bid.userId);
        return {
          name: user?.fullName || "مستخدم غير معروف",
          amount: bid.amount,
          at: bid.at,
        };
      })
    );

    res.json(populatedBids);
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب المزايدات", error });
  }
};

export const getProductAnalytics = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "المنتج غير موجود" });
      return;
    }

    res.json({
      views: product.viewsCount,
      likes: product.likes.length,
      comments: product.comments.length,
      favorites: product.favoritesCount || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ في جلب التحليلات", error });
  }
};
export const getNearbyProducts = async (req: Request, res: Response) => {
  const { lat, lng, maxDistance = 10000 } = req.query;

  const products = await Product.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [+lng, +lat] },
        distanceField: "distance",
        spherical: true,
        maxDistance: Number(maxDistance),
        query: { isApproved: true },
      },
    },
  ]);

  res.json(products);
};
