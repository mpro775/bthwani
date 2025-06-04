// controllers/charity.controller.ts
import { Request, Response } from "express";
import { Donation } from "../../models/Charity_V10/donation.model";

export const postDonation = async (req: Request, res: Response) => {
  try {
    const { type, content, quantity, area } = req.body;
    const userId = req.user?.id;

    if (!type || !content || !quantity || !area) {
      
        res.status(400).json({ message: "بيانات ناقصة" });
        return;
    }

    const donation = new Donation({ userId, type, content, quantity, area });
    await donation.save();

    res.status(201).json({ message: "تم إرسال التبرع", donation });
  } catch (error) {
    res.status(500).json({ message: "خطأ في الإرسال", error });
  }
};

export const getMyDonations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const donations = await Donation.find({ userId });
    res.json({ donations });
  } catch (error) {
    res.status(500).json({ message: "خطأ في التحميل", error });
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
