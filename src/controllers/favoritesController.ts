import { User } from "../models/user";
import { Request, Response } from "express";

export const addFavorite = async (req: Request, res: Response) => {
      if (!req.user?.uid) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  const user = await User.findOne({ firebaseUID: req.user.uid });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  } 

  if (!user.favorites.includes(req.params.itemId)) {
    user.favorites.push(req.params.itemId);
    await user.save();
  }

  res.json({ message: "Added to favorites" });
};

export const removeFavorite = async (req: Request, res: Response) => {
      if (!req.user?.uid) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  const user = await User.findOne({ firebaseUID: req.user.uid });
   if (!user) {
     res.status(404).json({ message: "User not found" });
     return;
  }
  user.favorites = user.favorites.filter((id) => id.toString() !== req.params.itemId);
  await user.save();

  res.json({ message: "Removed from favorites" });
};

export const getFavorites = async (req: Request, res: Response) => {
      if (!req.user?.uid) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

  const user = await User.findOne({ firebaseUID: req.user.uid }).populate("favorites");
     if (!user) {
     res.status(404).json({ message: "User not found" });
     return;
  }
  res.json(user.favorites);
};
