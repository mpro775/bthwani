// controllers/absher.controller.ts
import { Request, Response } from "express";
import { ProfessionalRequest } from "../../models/absher_V9/professionalRequest.model";
import { WalletTransaction } from "../../models/Wallet_V8/wallet.model";

export const submitRequest = async (req: Request, res: Response) => {
  try {
    const { category, subcategory, location, details } = req.body;
    const userId = req.user?.id;

    if (!userId || !category || !location || !details) {
      res.status(400).json({ message: "بيانات ناقصة" });
      return;
    }

    const request = new ProfessionalRequest({
      userId,
      category,
      subcategory,
      location,
      details,
    });

    await request.save();
    res.status(201).json({ message: "تم إرسال الطلب", request });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء الإرسال", error });
  }
};

export const getMyRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const requests = await ProfessionalRequest.find({ userId });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ message: "فشل في جلب البيانات", error });
  }
};

export const assignRequestToProvider = async (req: Request, res: Response) => {
  try {
    const { requestId, providerId } = req.body;
    const request = await ProfessionalRequest.findById(requestId);

    if (!request) {
      res.status(404).json({ message: "الطلب غير موجود" });
      return;
    }

    request.status = "assigned";
    request.assignedProvider = providerId;
    await request.save();

    res.json({ message: "تم الإسناد للمزود", request });
  } catch (error) {
    res.status(500).json({ message: "فشل في الإسناد", error });
  }
};

export const providerRespond = async (req: Request, res: Response) => {
  try {
    const providerId = req.user?.id;
    const { requestId, response, fee } = req.body;

    const request = await ProfessionalRequest.findById(requestId);
    if (!request || String(request.assignedProvider) !== providerId) {
      res.status(403).json({ message: "غير مصرح لك بالرد على هذا الطلب" });
      return;
    }

    request.response = response;
    request.fee = fee;
    request.status = "completed";
    await request.save();

    res.json({ message: "تم الرد على الطلب", request });
  } catch (error) {
    res.status(500).json({ message: "فشل في الرد على الطلب", error });
  }
};

export const withdrawPercentage = async (req: Request, res: Response) => {
  try {
    const providerId = req.user?.id;
    const { requestId } = req.body;

    const request = await ProfessionalRequest.findById(requestId);
    if (
      !request ||
      String(request.assignedProvider) !== providerId ||
      !request.fee
    ) {
      res.status(400).json({ message: "طلب غير صالح للسحب" });
      return;
    }

    const commission = Math.round(request.fee * 0.1 * 100) / 100;

    await WalletTransaction.updateOne(
      { userId: providerId },
      { $inc: { balance: request.fee - commission } },
      { upsert: true }
    );

    res.json({
      message: `تمت إضافة ${
        request.fee - commission
      } إلى محفظتك، وخصم ${commission} عمولة.`,
    });
  } catch (error) {
    res.status(500).json({ message: "فشل في السحب", error });
  }
};
