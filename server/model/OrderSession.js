import mongoose from "mongoose";

// item schema
const itemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

// customer ka session schema
const orderSessionSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    items: [itemSchema], // saare items ek array me
    grandTotal: { type: Number, required: true }, // sum of all items total
    remaining: {
      type: Number,
      default: function () {
        return this.grandTotal; // 👈 on creation, remaining = grandTotal
      },
    },

    // 👇 yahan relation banaya with User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true } // auto adds createdAt, updatedAt
);

export default mongoose.model("OrderSession", orderSessionSchema);
