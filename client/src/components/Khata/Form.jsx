import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Form = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    contactNumber: "",
    items: [{ id: Date.now(), name: "", quantity: "", price: "" }],
  });

  const [total, setTotal] = useState(0);

  // ✅ Add new item row
  const addField = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), name: "", quantity: "", price: "" }],
    }));
  };

  // ✅ Handle customer details
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle dynamic item change
  const handleItemChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    }));
  };

  // ✅ Calculate total on change
  useEffect(() => {
    const newTotal = formData.items.reduce((acc, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return acc + qty * price;
    }, 0);
    setTotal(newTotal);
  }, [formData]);

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        customerName: formData.customerName,
        contactNumber: formData.contactNumber,
        items: formData.items.map((i) => ({
          item: i.name,
          quantity: Number(i.quantity),
          price: Number(i.price),
        })),
      };

      await axios.post(
        "https://store-management-backend-hcpb.onrender.com/api/sessions/create",
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success("Session created successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save session. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white shadow-md rounded-lg mt-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">
        Store Management Form
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Name */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label className="sm:w-40 text-sm font-medium">Customer Name</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="flex-1 p-2 border rounded-md w-full"
            required
          />
        </div>

        {/* Contact Number */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label className="sm:w-40 text-sm font-medium">Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="flex-1 p-2 border rounded-md w-full"
            required
          />
        </div>

        {/* Items */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Items</h3>

          {formData.items.map((field) => (
            <div
              key={field.id}
              className="border p-3 rounded-md mb-4 bg-gray-50 space-y-4"
            >
              {/* Item Name */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-32 text-sm font-medium">Item</label>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => handleItemChange(field.id, "name", e.target.value)}
                  className="flex-1 p-2 border rounded-md w-full"
                />
              </div>

              {/* Quantity */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-32 text-sm font-medium">
                  Quantity / Weight
                </label>
                <input
                  type="number"
                  value={field.quantity}
                  onChange={(e) => handleItemChange(field.id, "quantity", e.target.value)}
                  className="flex-1 p-2 border rounded-md w-full"
                />
              </div>

              {/* Price */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <label className="sm:w-32 text-sm font-medium">Price</label>
                <input
                  type="number"
                  value={field.price}
                  onChange={(e) => handleItemChange(field.id, "price", e.target.value)}
                  className="flex-1 p-2 border rounded-md w-full"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addField}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-full sm:w-auto"
          >
            + Add Item
          </button>
        </div>

        {/* Total */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label className="sm:w-40 text-sm font-bold">Total</label>
          <input
            type="text"
            value={total}
            readOnly
            className="flex-1 p-2 border rounded-md bg-gray-100 font-semibold w-full"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {loading ? "Creating..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default Form;
