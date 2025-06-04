import { Request, Response } from "express";
import Favorite from "../../models/Favorite";

export const addFavorite = async (req: Request, res: Response) => {
  const { userId } = req.body; // أو من التوكن
  const { itemId, itemType } = req.body;

  const exists = await Favorite.findOne({ userId, itemId, itemType });
  if (exists) {
    res.status(200).json({ message: "Already favorited" });
    return;
  }

  const favorite = new Favorite({ userId, itemId, itemType });
  await favorite.save();

  res.status(201).json(favorite);
};

export const removeFavorite = async (req: Request, res: Response) => {
  const { userId, itemId, itemType } = req.body;

  await Favorite.findOneAndDelete({ userId, itemId, itemType });

  res.status(200).json({ message: "Removed from favorites" });
};

export const getFavoritesByUser = async (req: Request, res: Response) => {
  const { userId } = req.query;

  const favorites = await Favorite.find({ userId });

  res.status(200).json(favorites);
};
