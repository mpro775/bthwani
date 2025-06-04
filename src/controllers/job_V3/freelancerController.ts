import { Request, Response } from "express";
import { User } from "../../models/user";

export const getAvailability = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.isFreelancer || !user.freelancerProfile) {
       res.status(404).json({ message: "مستخدم مستقل غير موجود" });
       return;
    }

    res.json(user.freelancerProfile.availability || []);
  } catch (err) {
    console.error("Error in getAvailability:", err);
    res.status(500).json({ message: "حدث خطأ في الخادم" });
  }
};
