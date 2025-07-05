import { Request, Response } from "express";
import DeliveryStore from "../../models/delivry_Marketplace_V1/DeliveryStore";
import Order from "../../models/delivry_Marketplace_V1/Order";
import { User } from "../../models/user";
import Driver from "../../models/Driver_app/driver";

export const getStoresReport = async (req: Request, res: Response) => {
  try {
    const { search, active, category } = req.query as {
      search?: string;
      active?: string;
      category?: string;
    };
    const filter: any = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (active !== undefined) {
      filter.isActive = active === "true";
    }
    if (category) {
      filter.category = category;
    }
    const stores = await DeliveryStore.find(filter)
      .populate("category", "name")
      .lean();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: "Error fetching stores report", error: err });
  }
};

export const getOrdersReport = async (req: Request, res: Response) => {
  try {
    const { status, store, driver, user, from, to } = req.query as {
      status?: string;
      store?: string;
      driver?: string;
      user?: string;
      from?: string;
      to?: string;
    };
    const filter: any = {};
    if (status) filter.status = status;
    if (store) filter["subOrders.store"] = store;
    if (driver) filter.driver = driver;
    if (user) filter.user = user;
    if (from || to) {
      filter.createdAt = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to ? { $lte: new Date(to) } : {}),
      };
    }
    const orders = await Order.find(filter)
      .populate("user", "fullName")
      .populate("driver", "fullName")
      .populate("subOrders.store", "name")
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders report", error: err });
  }
};

export const getCustomersReport = async (req: Request, res: Response) => {
  try {
    const { search, verified, banned } = req.query as {
      search?: string;
      verified?: string;
      banned?: string;
    };
    const filter: any = { role: "user" };
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (verified !== undefined) filter.isVerified = verified === "true";
    if (banned !== undefined) filter.isBanned = banned === "true";
    const customers = await User.find(filter)
      .select("fullName phone email isVerified isBanned createdAt")
      .lean();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching customers report", error: err });
  }
};

export const getUsersReport = async (req: Request, res: Response) => {
  try {
    const { role, active } = req.query as {
      role?: string;
      active?: string;
    };
    const filter: any = {};
    if (role) filter.role = role;
    if (active !== undefined) filter.isActive = active === "true";
    const users = await User.find(filter)
      .select("fullName phone email role isActive createdAt")
      .lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users report", error: err });
  }
};

export const getDriversReport = async (req: Request, res: Response) => {
  try {
    const { search, available, verified, banned, type } = req.query as {
      search?: string;
      available?: string;
      verified?: string;
      banned?: string;
      type?: string;
    };
    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (available !== undefined) filter.isAvailable = available === "true";
    if (verified !== undefined) filter.isVerified = verified === "true";
    if (banned !== undefined) filter.isBanned = banned === "true";
    if (type) filter.driverType = type;
    const drivers = await Driver.find(filter)
      .select("fullName phone driverType isAvailable isVerified isBanned")
      .lean();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching drivers report", error: err });
  }
};
