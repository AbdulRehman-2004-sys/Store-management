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

  // Add new row
  const addField = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), name: "", quantity: "", price: "" }],
    }));
  };

  // Customer details
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Dynamic items
  const handleItemChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    }));
  };

  // Calculate total
  useEffect(() => {
    const newTotal = formData.items.reduce((acc, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      return acc + qty * price;
    }, 0);
    setTotal(newTotal);
  }, [formData]);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        customerName: formData.customerName,
        contactNumber: formData.contactNumber,
        items: formData.items.map((i) => ({
          item: i.name, // ✅ fix: backend expects "name"
          quantity: Number(i.quantity),
          price: Number(i.price)
        })),
      };

      const res = await axios.post("http://localhost:8080/api/sessions/create", payload,
        {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true,
        } // 👈 allow cookies to be sent
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
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-4">
      <h2 className="text-2xl font-bold mb-4">Store Management Form</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Name */}
        <div className="flex items-center gap-4">
          <label className="w-40 text-sm font-medium">Customer Name</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="flex-1 p-2 border rounded-md"
            required
          />
        </div>

        {/* Contact Number */}
        <div className="flex items-center gap-4">
          <label className="w-40 text-sm font-medium">Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            className="flex-1 p-2 border rounded-md"
            required
          />
        </div>

        {/* Items */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Items</h3>
          {formData.items.map((field) => (
            <div key={field.id} className="border p-3 rounded-md mb-3 bg-gray-50">
              <div className="flex items-center gap-4 mb-2">
                <label className="w-32 text-sm font-medium">Item</label>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => handleItemChange(field.id, "name", e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                />
              </div>

              <div className="flex items-center gap-4 mb-2">
                <label className="w-32 text-sm font-medium">Quantity / Weight</label>
                <input
                  type="number"
                  value={field.quantity}
                  onChange={(e) => handleItemChange(field.id, "quantity", e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                />
              </div>

              <div className="flex items-center gap-4 mb-2">
                <label className="w-32 text-sm font-medium">Price</label>
                <input
                  type="number"
                  value={field.price}
                  onChange={(e) => handleItemChange(field.id, "price", e.target.value)}
                  className="flex-1 p-2 border rounded-md"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addField}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            + Add Item
          </button>
        </div>

        {/* Total */}
        <div className="flex items-center gap-4">
          <label className="w-40 text-sm font-bold">Total</label>
          <input
            type="text"
            value={total}
            readOnly
            className="flex-1 p-2 border rounded-md bg-gray-100 font-semibold"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {loading ? "creating..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default Form;
