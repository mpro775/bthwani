// controllers/miscController.ts
import { Request, Response } from "express";
import path from "path";
import fs from "fs";

export const getFAQs = (req: Request, res: Response) => {
  try {
    const faqsPath = path.join(__dirname, "../data/faqs.json");
    const data = fs.readFileSync(faqsPath, "utf-8");
    const faqs = JSON.parse(data);
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: "تعذر تحميل الأسئلة الشائعة" });
  }
};
