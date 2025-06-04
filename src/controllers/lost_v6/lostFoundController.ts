import { Request, Response } from "express";
import { LostFound } from "../../models/LostFound_V6/LostFound.model";
import { User } from "../../models/user";
import { sendPushNotification } from "../../utils/push";

export const createPost = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      dateLostOrFound,
      location,
      images,
      rewardOffered,
      rewardAmount,
      rewardMethod,
      type,
    } = req.body;

    const post = new LostFound({
      title,
      description,
      dateLostOrFound,
      location,
      images,
      postedBy: req.user?.id,
      rewardOffered,
      rewardAmount,
      rewardMethod,
      type,
    });

    await post.save();

    if (type === "lost") {
      await sendNearbyNotification(post);
    }

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: "فشل في إنشاء البلاغ", error: err });
  }
};
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const posts = await LostFound.find(type ? { type } : {})
      .sort({ createdAt: -1 })
      .populate("postedBy", "fullName profileImage");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "خطأ في الاسترجاع", error: err });
  }
};

export const getPostDetails = async (req: Request, res: Response) => {
  try {
    const post = await LostFound.findById(req.params.id).populate(
      "postedBy",
      "fullName"
    );
    if (!post) {
      res.status(404).json({ message: "البلاغ غير موجود" });
      return;
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "فشل في جلب التفاصيل", error: err });
  }
};

export const updatePostStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const post = await LostFound.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: "غير موجود" });
      return;
    }

    if (status === "resolved" && post.type === "found") {
      const user = await User.findById(post.postedBy);
      if (user) {
        user.foundResolvedCount = (user.foundResolvedCount || 0) + 1;

        if (
          user.foundResolvedCount >= 3 &&
          !user.badges.includes("trusted_rescuer")
        ) {
          user.badges.push("trusted_rescuer");
        }

        await user.save();
      }
    }

    post.status = status;
    await post.save();
    res.json({ message: "تم التحديث", post });
  } catch (err) {
    res.status(500).json({ message: "فشل في التحديث", error: err });
  }
};

const sendNearbyNotification = async (item: any) => {
  const users = await User.find({
    "location.coords": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [item.location.coords.lng, item.location.coords.lat],
        },
        $maxDistance: 5000,
      },
    },
    pushToken: { $exists: true },
  });

  users.forEach((user) => {
    if (user.pushToken) {
      sendPushNotification(user.pushToken, {
        title: "📍 بلاغ مفقود جديد",
        body: `تم إعلان مفقود في ${item.location.city}`,
        data: { itemId: item._id },
      });
    }
  });
};
