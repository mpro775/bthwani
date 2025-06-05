// controllers/charity.controller.ts
import { Request, Response } from "express";
import { Donation } from "../../models/Charity_V10/donation.model";
import { User } from "../../models/user";

export const postDonation = async (req: Request, res: Response) => {
  try {
    const { type, content, quantity, area } = req.body;
    const firebaseUID = req.user?.uid; // uid من verifyFirebase

    if (!type || !content || !quantity || !area) {
       res.status(400).json({ message: "بيانات ناقصة" });
       return;
    }

    if (!firebaseUID) {
       res.status(401).json({ message: "غير مصرح: لم يتم العثور على المستخدم" });
       return;
    }

    // 1. البحث عن مستند المستخدم في MongoDB عبر firebaseUID
    const user = await User.findOne({ firebaseUID });
    if (!user) {
       res.status(404).json({ message: "المستخدم غير موجود في قاعدة البيانات" });
       return;
    }

    // 2. استخدم الـ _id الخاص بمستند الـ User
    const userId = user._id;

    // 3. إنشاء وحفظ التبرع
    const donation = new Donation({ userId, type, content, quantity, area });
    await donation.save();

     res.status(201).json({ message: "تم إرسال التبرع", donation });
     return;
  } catch (error: any) {
    console.error("خطأ أثناء حفظ التبرع:", error);
     res.status(500).json({ message: "خطأ في الإرسال", error: error.message });
     return;
  }
};

export const getMyDonations = async (req: Request, res: Response) => {
  try {
    const firebaseUID = req.user?.uid; // هذه هي قيمة Firebase UID المرسلة من verifyFirebase

    if (!firebaseUID) {
       res.status(401).json({ message: "غير مصرح: لم يتم العثور على المستخدم" });
       return;
    }

    // 1. البحث عن مستند المستخدم في MongoDB عبر firebaseUID
    const user = await User.findOne({ firebaseUID });
    if (!user) {
       res.status(404).json({ message: "المستخدم غير موجود در قاعدة البيانات" });
       return;
    }

    const userId = user._id; // هذا هو ObjectId الحقيقي للمستخدم في MongoDB

    // 2. جلب التبرعات التي حقل userId فيها يساوي ObjectId الخاصّ بالمستخدم
    const donations = await Donation.find({ userId });

    // 3. إرجاع النتيجة للواجهة
     res.json({ donations });
     return;
  } catch (error: any) {
    console.error("خطأ في getMyDonations:", error);
     res.status(500).json({ message: "خطأ في التحميل", error: error.message });
     return;
  }
};
export const getUnassignedDonations = async (_: Request, res: Response) => {
  try {
    const unassigned = await Donation.find({ status: "pending" });
    res.json({ unassigned });
  } catch (error) {
    res.status(500).json({ message: "فشل في التحميل", error });
  }
};

export const assignToOrganization = async (req: Request, res: Response) => {
  try {
    const { donationId, organization } = req.body;
    const donation = await Donation.findById(donationId);

    if (!donation) {
res.status(404).json({ message: "العنصر غير موجود" });
        return;
    } 

    donation.status = "assigned";
    donation.organization = organization;
    await donation.save();

    res.json({ message: "تم الربط", donation });
  } catch (error) {
    res.status(500).json({ message: "فشل في الربط", error });
  }
};
