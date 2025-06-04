import { Request, Response } from "express";
import { Opportunity } from "../../models/job_V3/Opportunity";

export const createOpportunity = async (req: Request, res: Response) => {
  try {
    const newOpportunity = new Opportunity({
      ...req.body,
      postedBy: req.user?.id, // ← من التوكن
    });
    await newOpportunity.save();
    res.status(201).json(newOpportunity);
  } catch (err) {
    console.error("Create Opportunity Error:", err);
    res.status(500).json({ message: "فشل في إنشاء الفرصة" });
  }
};

export const getOpportunities = async (req: Request, res: Response) => {
  try {
    const opportunities = await Opportunity.find().populate(
      "postedBy",
      "fullName profileImage"
    );
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ message: "فشل في جلب الفرص" });
  }
};

export const updateOpportunity = async (req: Request, res: Response) => {
  try {
    const updated = await Opportunity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ message: "الفرصة غير موجودة" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "فشل في التحديث" });
  }
};

export const deleteOpportunity = async (req: Request, res: Response) => {
  try {
    const deleted = await Opportunity.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "لم يتم العثور على الفرصة" });
      return;
    }
    res.json({ message: "تم الحذف بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "فشل في الحذف" });
  }
};

export const getOpportunityById = async (req: Request, res: Response) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate(
      "postedBy",
      "fullName profileImage"
    );
    if (!opportunity) {
      res.status(404).json({ message: "الفرصة غير موجودة" });
      return;
    }
    res.json(opportunity);
  } catch (err) {
    res.status(500).json({ message: "خطأ في عرض الفرصة" });
  }
};
