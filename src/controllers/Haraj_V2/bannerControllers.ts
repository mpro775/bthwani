import { Request, Response } from "express";
import { Slider } from "../../models/Haraj_V2/Slider";

export const getSliders = async (_req: Request, res: Response) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
    res.json(sliders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching sliders", error: err });
  }
};

export const createSlider = async (req: Request, res: Response) => {
  try {
    const { category, image } = req.body;

    if (!image) {
      res.status(400).json({ message: "Image URL is required" });
      return;
    }
    const newSlider = new Slider({ image, category });
    await newSlider.save();

    res.status(201).json({ message: "Slider created", slider: newSlider });
  } catch (err) {
    res.status(500).json({ message: "Error creating slider", error: err });
  }
};
