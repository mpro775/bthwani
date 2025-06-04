import { Request, Response } from "express";
import mongoose from "mongoose";
import DeliveryStore, {
  IDeliveryStore,
} from "../../models/delivry_Marketplace_V1/DeliveryStore";
import { computeIsOpen } from "../../utils/storeStatus";

// Create a new delivery store
export const create = async (req: Request, res: Response) => {
  try {
    const body: any = { ...req.body };

    // Convert category to ObjectId if valid
    if (body.category && mongoose.Types.ObjectId.isValid(body.category)) {
      body.category = new mongoose.Types.ObjectId(body.category);
    }

    // Parse schedule JSON string into array
    if (typeof body.schedule === "string") {
      try {
        body.schedule = JSON.parse(body.schedule);
      } catch (err) {
        res.status(400).json({ message: "Invalid schedule format" });
        return;
      }
    }

    // Convert lat/lng to location object
    if (body.lat != null && body.lng != null) {
      body.location = {
        lat: parseFloat(body.lat),
        lng: parseFloat(body.lng),
      };
      delete body.lat;
      delete body.lng;
    }

    // Ensure image and logo URLs are provided
    if (!body.image || !body.logo) {
      res.status(400).json({ message: "Image and logo URLs are required" });
      return;
    }

    const data = new DeliveryStore(body);
    await data.save();
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Read all delivery stores
export const getAll = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    const filter: any = { isActive: true };

    // Filter by category if provided
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId.toString())) {
      filter.category = new mongoose.Types.ObjectId(categoryId.toString());
    }

    // Fetch stores
    const stores = await DeliveryStore.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with computed isOpen
    type StoreWithStatus = (typeof stores)[number] & { isOpen: boolean };
    const enriched = stores.map<StoreWithStatus>((store) => {
      const isOpen = computeIsOpen(
        store.schedule,
        !!store.forceClosed,
        !!store.forceOpen
      );
      return {
        ...store,
        isOpen,
      };
    });

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Read a single delivery store by ID
export const getById = async (req: Request, res: Response) => {
  try {
    const store = await DeliveryStore.findById(req.params.id).lean();
    if (!store) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    const enrichedStore = {
      ...store,
      isOpen: computeIsOpen(
        store.schedule,
        !!store.forceClosed,
        !!store.forceOpen
      ),
    };

    res.json(enrichedStore);
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

// Update an existing delivery store
export const update = async (req: Request, res: Response) => {
  try {
    const body: any = { ...req.body };

    // Convert lat/lng to location object if present
    if (body.lat != null && body.lng != null) {
      body.location = {
        lat: parseFloat(body.lat),
        lng: parseFloat(body.lng),
      };
      delete body.lat;
      delete body.lng;
    }

    // Parse schedule JSON string into array
    if (typeof body.schedule === "string") {
      try {
        body.schedule = JSON.parse(body.schedule);
      } catch (err) {
        res.status(400).json({ message: "Invalid schedule format" });
        return;
      }
    }

    // Convert category to ObjectId if valid
    if (body.category && mongoose.Types.ObjectId.isValid(body.category)) {
      body.category = new mongoose.Types.ObjectId(body.category);
    }

    const updated = await DeliveryStore.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });

    if (!updated) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a delivery store
export const remove = async (req: Request, res: Response) => {
  try {
    await DeliveryStore.findByIdAndDelete(req.params.id);
    res.json({ message: "DeliveryStore deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
