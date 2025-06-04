import { Request, Response } from "express";
import { User } from "../../models/user";

// 📌 متابعة مستخدم
export const followUser = async (req: Request, res: Response) => {
  if (!req.user?.uid) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const followerUID = req.user.uid;
  const { targetId } = req.params;

  try {
    const currentUser = await User.findOne({ firebaseUID: followerUID });
    const targetUser = await User.findById(targetId);

    if (!currentUser || !targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];

    if (!currentUser.following.includes(targetId)) {
      currentUser.following.push(targetId);
      currentUser.activityLog.push({ action: "follow", target: targetId });
      targetUser.followers.push(currentUser._id.toString());
      targetUser.followersCount = (targetUser.followersCount || 0) + 1;

      await currentUser.save();
      await targetUser.save();
    }

    res.status(200).json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error following user", error: err });
  }
};

// 📌 إلغاء متابعة
export const unfollowUser = async (req: Request, res: Response) => {
  if (!req.user?.uid) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const followerUID = req.user.uid;
  const { targetId } = req.params;

  try {
    const currentUser = await User.findOne({ firebaseUID: followerUID });
    const targetUser = await User.findById(targetId);

    if (!currentUser || !targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    currentUser.following = (currentUser.following || []).filter(
      (id) => id !== targetId
    );
    targetUser.followers = (targetUser.followers || []).filter(
      (id) => id !== currentUser._id.toString()
    );
    if (targetUser.followersCount && targetUser.followersCount > 0) {
      targetUser.followersCount--;
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error unfollowing user", error: err });
  }
};

// 📌 عرض المتابعين
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ firebaseUID: req.params.id }).populate(
      "followers",
      "fullName profileImage"
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user.followers || []);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving followers", error: err });
  }
};
export const getFollowStats = async (req: Request, res: Response) => {
  const { targetId } = req.params;
  try {
    const user = await User.findById(targetId, "followersCount");
    if (!user) {
      console.warn("⚠️ المستخدم غير موجود:", targetId);
       res.status(404).json({ message: "User not found" });
       return;
    }

    console.log("✅ عدد المتابعين:", user.followersCount);
    res.status(200).json({ followersCount: user.followersCount || 0 });
  } catch (err) {
    console.error("❌ خطأ أثناء جلب المتابعين:", err);
    res.status(500).json({ message: "Error fetching follow stats", error: err });
  }
};


// 📌 عرض المتابَعين
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "fullName profileImage"
    );
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user.following || []);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving following", error: err });
  }
};

// 📌 سجل النشاطات
export const getActivityLog = async (req: Request, res: Response) => {
  if (!req.user?.uid) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user.activityLog || []);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving activity log", error: err });
  }
};
