import { Request, Response } from 'express';
import { User } from '../../models/user';

export const updateBloodSettings = async (req: Request, res: Response) => {
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

    const { bloodType, isAvailableToDonate } = req.body;
    if (bloodType) user.bloodType = bloodType;
    if (typeof isAvailableToDonate === 'boolean') user.isAvailableToDonate = isAvailableToDonate;

    await user.save();
    res.status(200).json({ message: 'Blood settings updated', bloodType, isAvailableToDonate });
  } catch (err) {
    res.status(500).json({ message: 'Error updating blood settings', error: err });
  }
};

export const updateFreelancerProfile = async (req: Request, res: Response) => {
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


    
    const { isFreelancer, service, bio, portfolioImages } = req.body;

    if (Array.isArray(req.body.availability)) {
  user.freelancerProfile.availability = req.body.availability;
}

    if (typeof isFreelancer === 'boolean') user.isFreelancer = isFreelancer;

    // ✅ تأكد أن freelancerProfile موجود
    if (!user.freelancerProfile) {
    user.freelancerProfile = {
  service: "",
  bio: "",
  portfolioImages: [],
  availability: [],
  bookings: [],
};
    }

    if (service) user.freelancerProfile.service = service;
    if (bio) user.freelancerProfile.bio = bio;
    if (Array.isArray(portfolioImages)) {
      user.freelancerProfile.portfolioImages = portfolioImages;
    }

    if (!user.freelancerProfile || typeof user.freelancerProfile !== "object") {
  user.freelancerProfile = {};
}
    await user.save();
    res.status(200).json({ message: 'Freelancer profile updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating freelancer profile', error: err });
  }
};

