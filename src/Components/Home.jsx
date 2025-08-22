import React from 'react';
import './Home.css'; // Importing a separate CSS file for styling
import ImageSlider from './imageSlider';
import ProductGallery from './ProductGallery';

const Home = () => {
  return (
    <>
      <section className="home-section">
        <div className="video-container">
        <video autoPlay muted loop preload="metadata" poster="banner.jpg" className="background-video">
        <source src="farmer.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

          <div className="overlay-message">
            <h1>Welcome to Agri Sustain</h1>
            <p>
              At Agri Sustain, we are dedicated to supporting farmers through innovative solutions, sustainable practices, and access to critical resources. Whether you're looking for the latest government schemes, updates on crop prices, or easy access to agricultural tools, our platform is here to help you grow and thrive.
            </p>
          </div>
        </div>
      </section>

      {/* Additional section for more information */}
      <section className="info-section">
        <div className="info-container">
          <h1>OUR MISSION</h1>
          <div className='info-p' >
          <p>
            Our mission is to foster sustainable agricultural practices that help farmers achieve long-term productivity and prosperity. Through cutting-edge technology, data-driven insights, and community support, we aim to empower farmers with the tools they need to succeed in today’s dynamic environment.
          </p>
          <ImageSlider/>
        </div>

        <h1>FEEDSTOCKS</h1>
        <ProductGallery/>


        </div>
      </section>
    </>
  );
};

export default Home;
