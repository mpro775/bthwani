import { Request, Response } from 'express';
import { User } from '../../models/user';

export const addAddress = async(req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    const { label, city, street, location } = req.body;

    if (!label || !city || !street) {
       res.status(400).json({ message: "Missing required fields" });
       return;
    }

const user = await User.findOne({ firebaseUID: req.user.id });
    if (!user) {
res.status(404).json({ message: "User not found" });
      return;
    } 

    const newAddress = {
      label,
      city,
      street,
      location: {
        lat: location?.lat ?? null,
        lng: location?.lng ?? null,
      },
    };

    user.addresses.push(newAddress);
    await user.save();

     res.status(200).json({ message: "Address added", addresses: user.addresses });
     return;
  } catch (err) {
    console.error("❌ Failed to add address:", err);
     res.status(500).json({ message: "Internal Server Error" });
     return;
  }
};


export const updateAddress = async (req: Request, res: Response) => {
  const { id } = req.params;
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
    const index = user.addresses.findIndex((_, i) => i.toString() === id);
    if (index === -1) {
      res.status(404).json({ message: 'Address not found' });
      return;
    } 

    user.addresses[index] = { ...user.addresses[index], ...req.body };
    await user.save();
    res.status(200).json(user.addresses[index]);
  } catch (err) {
    res.status(500).json({ message: 'Error updating address', error: err });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  const { id } = req.params;
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

    // حذف العنوان بواسطة _id وليس index
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== id
    );

    await user.save();
    res.status(200).json({ message: "تم الحذف", addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting address', error: err });
  }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    if (!req.user?.uid) {
       res.status(401).json({ message: "Unauthorized" });
       return;
    }

    const { _id } = req.body;
    if (!_id) {
       res.status(400).json({ message: "Missing address ID" });
       return;
    }

    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
       res.status(404).json({ message: "User not found" });
       return;
    }

    const found = user.addresses.find((a: any) => a._id?.toString() === _id);
    if (!found) {
       res.status(404).json({ message: "Address not found" });
       return;
    }

    user.defaultAddressId = _id; // 👈 هذا الحقل المعتمد عندك
    await user.save();

    res.status(200).json({ message: "تم تعيين العنوان الافتراضي", defaultAddressId: _id });
  } catch (err) {
    console.error("❌ Failed to set default address:", err);
    res.status(500).json({ message: "Error setting default address", error: err });
  }
};
