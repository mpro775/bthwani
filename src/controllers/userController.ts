
import { Request, Response } from 'express';
import { User } from '../models/user';

export const registerOrUpdateUser = async (req: Request, res: Response) => {
  if (!req.user?.uid) {
     res.status(401).json({ message: "Unauthorized" });
     return;
  }

  const { uid, email } = req.user;
  const body = req.body;
  const name = req.body.fullName || "مستخدم";

  try {
    let user = await User.findOne({ firebaseUID: uid });

    if (!user) {
      user = new User({
        fullName: name,
        email,
        firebaseUID: uid,
        ...body,
      });
    } else {
      Object.assign(user, body);
    }

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error saving user', error: err });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    const user = await User.findOne({ firebaseUID: req.user.uid }).lean();

    if (!user) {
       res.status(404).json({ message: "User not found" });
       return;
    }

    // 🔍 البحث عن عنوان مطابق للـ defaultAddressId
    const defaultAddress =
      user.addresses?.find((addr: any) =>
        addr._id?.toString() === user.defaultAddressId?.toString()
      ) || user.addresses?.[0] || null;

     res.status(200).json({
      ...user,
      defaultAddress,
      
    });
    return;
  } catch (error) {
    console.error("❌ Error fetching user:", error);
     res.status(500).json({ message: "Server error" });
     return;
  }
};



export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    const user = await User.findOne({ firebaseUID: req.user.uid });

    if (!user) {
       res.status(404).json({ message: 'User not found' });
       return;
    }

    const {
      fullName,
      aliasName,
      phone,
      language,
      theme,
      profileImage,
    } = req.body;

    // ✅ تحقق من undefined فقط (للسماح بالقيم الفارغة)
    if (fullName !== undefined) user.fullName = fullName;
    if (aliasName !== undefined) user.aliasName = aliasName;
    if (phone !== undefined) user.phone = phone;
    if (language !== undefined) user.language = language;
    if (theme !== undefined) user.theme = theme;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    res.status(200).json(user);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: 'Error updating profile', error: err });
  }
};




export const updateSecurity = async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
       res.status(404).json({ message: "User not found" });
       return;
    }

    const { pinCode, twoFactorEnabled } = req.body;



    if (pinCode) user.security.pinCode = pinCode;
    if (typeof twoFactorEnabled === "boolean") {
      user.security.twoFactorEnabled = twoFactorEnabled;
    }

    await user.save();
    res.status(200).json({ message: "Security settings updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating security", error: err });
  }
};



export const getLoginHistory = async (req: Request, res: Response) => {
       if (!req.user?.uid) {
     res.status(401).json({ message: "Unauthorized" });
     return;
  }

  const user = await User.findOne({ firebaseUID: req.user.uid });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user.loginHistory || []);
};


export const setPinCode = async (req: Request, res: Response) => {
  const { pinCode } = req.body;
  if (!pinCode) {
res.status(400).json({ message: "PIN is required" });
    return;
  } 
       if (!req.user?.uid) {
     res.status(401).json({ message: "Unauthorized" });
     return;
  }
  const user = await User.findOne({ firebaseUID: req.user.uid });
  if (!user) {
res.status(404).json({ message: "User not found" });
    return;
  } 

  user.security.pinCode = pinCode;
  await user.save();
  res.json({ message: "PIN set successfully" });
};

export const verifyPinCode = async (req: Request, res: Response) => {
  const { pinCode } = req.body;
     if (!req.user?.uid) {
     res.status(401).json({ message: "Unauthorized" });
     return;
  }
  const user = await User.findOne({ firebaseUID: req.user.uid });
  if (!user || !user.security.pinCode)
    {
 res.status(404).json({ message: "No PIN set for this user" });
      return;
    }

  if (user.security.pinCode !== pinCode)
    {
res.status(403).json({ message: "Incorrect PIN" });
      return;
    } 

  res.json({ message: "PIN verified" });
};

export const getUserStats = async (req: Request, res: Response) => {
  if (!req.user?.uid) {
     res.status(401).json({ message: "Unauthorized" });
     return;
  }

  const user = await User.findOne({ firebaseUID: req.user.uid });

  if (!user) {
     res.status(404).json({ message: "User not found" });
     return;
  }

  const stats = {
    postsCount: user.postsCount || 0,
    followersCount: user.followersCount || 0,
    favoritesCount: user.favorites?.length || 0,
    messagesCount: user.messagesCount || 0,
  };

  res.json(stats);
};


export const deactivateAccount = async (req: Request, res: Response) => {
       if (!req.user?.uid) {
     res.status(401).json({ message: "Unauthorized" });
     return;
  }

  const user = await User.findOne({ firebaseUID: req.user.uid });
  if (!user) {
     res.status(404).json({ message: "User not found" });
     return;
  }

  user.isActive = false;
  await user.save();
  res.json({ message: "Account deactivated" });
};

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const firebaseUID = req.user?.id;
    if (!firebaseUID) {
       res.status(401).json({ message: 'Unauthorized' });
       return;
    }

    // ابحث حسب Firebase UID
    const user = await User.findOne({ firebaseUID })
      .select('addresses defaultAddressId')
      .exec();

    if (!user) {
       res.status(404).json({ message: 'المستخدم غير موجود' });
       return;
    }

     res.json({
      addresses: user.addresses,
      defaultAddressId: (user as any).defaultAddressId,
    });
    return;
  } catch (err: any) {
     res.status(500).json({ message: err.message });
     return;
  }
};
