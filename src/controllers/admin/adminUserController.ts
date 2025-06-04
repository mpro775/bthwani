import { Request, Response } from "express";
import { User } from "../../models/user";

// ✅ عرض كل المستخدمين
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, isVerified, isBanned } = req.query;

    const filter: any = {};
    if (role) filter.role = role;
    if (isVerified !== undefined) filter.isVerified = isVerified === "true";
    if (isBanned !== undefined) filter.isBanned = isBanned === "true";

    const users = await User.find(filter).select(
      "-security -wallet -activityLog"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err });
  }
};

// ✅ عرض مستخدم بالتفصيل
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err });
  }
};

// ✅ تعديل صلاحيات مستخدم أو حظره
export const updateUserAdmin = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { role, isBanned, isVerified } = req.body;
    if (role) user.role = role;
    if (typeof isBanned === "boolean") user.isBanned = isBanned;
    if (typeof isVerified === "boolean") user.isVerified = isVerified;

    await user.save();
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating user", error: err });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  user.role = role;
  await user.save();
  res.json({ message: "Role updated successfully" });
};

// export const loginDriver = async (req: Request, res: Response) => {
//   const { phone, password } = req.body;
//   try {
//     const driver = await User.findOne({ phone });
//     if (!driver) return res.status(400).json({ message: 'رقم الهاتف غير مسجل' });

//     const isMatch = await driver.comparePassword(password);
//     if (!isMatch) return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });

//     const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET || 'secret123', {
//       expiresIn: '7d'
//     });

//     res.json({ token, driver });
//   } catch (err: any) {
//     res.status(500).json({ message: err.message });
//   }
// };
