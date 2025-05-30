import React, { useState } from "react";
import emailjs from "emailjs-com";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ContactForm.css"; // Import custom CSS for added styling

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    query: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("Sending...");
  
    const serviceID = "ketowarrior_lo7p3ti";
    const templateID = "template_l4v1se3";
    const userID = "TiPzxagvRdKCbOX_C";
  
    // Ensure the data is correctly formatted
    const emailData = {
      name: formData.name,
      email: formData.email,
      query: formData.query,
    };
  
    console.log("Email Data Being Sent:", emailData);
  
    emailjs
      .send(serviceID, templateID, emailData, userID)
      .then(() => {
        setStatus("Your query has been sent successfully!");
        setFormData({ name: "", email: "", query: "" });
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        setStatus("Failed to send your query. Please try again later.");
      });
  };
  

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Contact Us</h2>
      <form onSubmit={handleSubmit} className="shadow-lg p-4 rounded bg-light custom-form">
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Full Name
          </label>
          <input
            type="text"
            className="form-control custom-input"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            type="email"
            className="form-control custom-input"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email address"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="query" className="form-label">
            Your Query
          </label>
          <textarea
            className="form-control custom-input"
            id="query"
            name="query"
            rows="5"
            value={formData.query}
            onChange={handleChange}
            required
            placeholder="Write your query here"
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary w-100 custom-btn">
          Send Message
        </button>
        {status && <div className="mt-3 alert alert-info">{status}</div>}
      </form>
    </div>
  );
};

export default ContactForm;
