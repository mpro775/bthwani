"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    driverId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }, // role === 'driver'
    storeId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'DeliveryStore' },
    status: {
        type: String,
        enum: ["pending", "assigned", "delivering", "delivered", "cancelled"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        enum: ['wallet', 'cod'], // Cod = Cash On Delivery
        required: true
    },
    paid: {
        type: Boolean,
        default: false
    },
    items: [{
            productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'DeliveryProduct', required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            unitPrice: { type: Number, required: true }
        }],
    price: { type: Number, required: true },
    address: {
        label: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        }
    }, city: String,
    notes: String,
    assignedAt: Date,
    deliveredAt: Date
}, { timestamps: true });
orderSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.status === 'assigned') {
        update.assignedAt = new Date();
    }
    if (update.status === 'delivered') {
        update.deliveredAt = new Date();
    }
    this.setUpdate(update);
    next();
});
exports.default = (0, mongoose_1.model)('DeliveryOrder', orderSchema);
