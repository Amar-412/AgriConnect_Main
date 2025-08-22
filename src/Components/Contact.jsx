import React, { useState, useEffect } from "react";
import "./contact.css";

const Contact = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    { url: "images/farmer5.jpg", message: "Welcome to Agri Sustain!" },
    { url: "images/farmer2.jpg", message: "Connect With Us Today" },
    { url: "images/farmer3.jpg", message: "We Are Here To Help" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  const handleSendLocation = () => {
    if (!phoneNumber) {
      alert("Please enter a valid phone number!");
      return;
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
          setLocation(loc);
          
          // Send the location via SMS to the provided phone number
          const message = `Emergency! Here is my location: ${loc}`;
          window.open(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
          
          alert(`Location sent to ${phoneNumber}:\n${loc}`);
        },
        () => {
          alert("Unable to retrieve your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <section className="contact-section">
      {/* Image Slider */}
      <div className="image-slider">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentIndex ? "active" : ""}`}
          >
            <img src={image.url} alt={`Slide ${index + 1}`} />
            <div className="slide-message">{image.message}</div>
          </div>
        ))}
      </div>

      <div className="message">
        <p>
          The Government of India has implemented various schemes to uplift the agricultural sector and support the livelihoods of farmers. These schemes aim to enhance agricultural productivity, ensure financial stability, and promote sustainable practices. Key initiatives include Pradhan Mantri Kisan Samman Nidhi (PM-KISAN), which provides direct income support to small and marginal farmers, and Pradhan Mantri Fasal Bima Yojana (PMFBY), offering crop insurance against natural calamities. The Soil Health Card Scheme helps farmers optimize the use of fertilizers based on soil quality, while Kisan Credit Card (KCC) facilitates easy credit access. Additionally, the Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) focuses on improving irrigation facilities, and the e-NAM (National Agriculture Market) promotes fair and transparent agricultural trade. These initiatives collectively aim to empower farmers, enhance their income, and secure the nation's food supply.
        </p>
      </div>

      {/* Contact Section */}
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p>Feel free to reach out for more information about Agri Sustain.</p>
        <form>
          <label>
            Your Message:
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here"
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>

      {/* SOS Feature */}
      <div className="sos-container">
        <h2>SOS Feature</h2>
        <p>Send your current location to a trusted contact.</p>
        <label>
          Mobile Number:
          <input
            type="tel"
            placeholder="Enter mobile number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </label>
        <button onClick={handleSendLocation}>Send Location</button>
        {location && <p>Last Sent Location: {location}</p>}
      </div>
    </section>
  );
};

export default Contact;
