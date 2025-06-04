import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: String,
  password: { type: String, required: true },

  // 🔐 الدور حسب الـ Vertical
  role: {
    type: String,
    enum: ["rider_driver", "light_driver", "women_driver"], // فقط هذه الثلاثة
    required: true,
  },

  vehicleType: { type: String, enum: ["bike", "car"], required: true },

  isAvailable: { type: Boolean, default: true },
  isFemaleDriver: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },

  // 📍 المواقع
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: { type: Date, default: Date.now },
  },
  residenceLocation: {
    lat: Number,
    lng: Number,
    address: String,
    governorate: String,
    city: String,
  },
  otherLocations: [
    {
      label: String,
      lat: Number,
      lng: Number,
      updatedAt: { type: Date, default: Date.now },
    },
  ],

  // 💰 المحفظة
  wallet: {
    balance: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },

  deliveryStats: {
    deliveredCount: { type: Number, default: 0 },
    canceledCount: { type: Number, default: 0 },
    totalDistanceKm: { type: Number, default: 0 },
  },

  firebaseUID: String,
  createdAt: { type: Date, default: Date.now },
});

export const Driver = mongoose.model("Driver", DriverSchema);
