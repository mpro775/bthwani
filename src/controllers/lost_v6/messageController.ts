import { Request, Response } from "express";
import { Message } from "../../models/LostFound_V6/message.model";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const message = new Message({
      ...req.body,
      fromUser: req.user.id,
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "فشل إرسال الرسالة" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const messages = await Message.find({ itemId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "فشل جلب الرسائل" });
  }
};
