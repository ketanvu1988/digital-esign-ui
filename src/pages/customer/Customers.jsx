import { useEffect, useState } from "react";
import "./Customers.css";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    email: "",
    mobile: ""
  });
  const [editing, setEditing] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    fetch("http://localhost:8080/api/customers", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setCustomers)
      .catch(console.error);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveCustomer = () => {
    const url = editing
      ? `http://localhost:8080/api/customers/${form.id}`
      : "http://localhost:8080/api/customers";

    fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    }).then(() => {
      resetForm();
      loadCustomers();
    });
  };

  const editCustomer = (c) => {
    setForm(c);
    setEditing(true);
  };

  const deleteCustomer = (id) => {
    if (!window.confirm("Delete this customer?")) return;

    fetch(`http://localhost:8080/api/customers/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }).then(loadCustomers);
  };

  const resetForm = () => {
    setForm({ id: null, name: "", email: "", mobile: "" });
    setEditing(false);
  };

  return (
    <div className="page">

      <h2>Manage Customers</h2>

      {/* FORM */}
      <div className="customer-form">
        <input
          name="name"
          placeholder="Customer Name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="mobile"
          placeholder="Mobile"
          value={form.mobile}
          onChange={handleChange}
        />

        <button onClick={saveCustomer}>
          {editing ? "Update" : "Save"}
        </button>

        {editing && (
          <button className="cancel" onClick={resetForm}>
            Cancel
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="doc-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.mobile}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => editCustomer(c)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteCustomer(c.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan="5" className="empty">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
