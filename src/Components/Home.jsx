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
            <h1>Welcome to Agri Connect</h1>
            <p>
              At Agri Connect, we are dedicated to empower farmers by providing them with a digital platform to transform their crops into value-added products, connect directly with global buyers, and embrace technology for sustainable growth.
              </p>
          </div>
        </div>
      </section>

      {/* Additional section for more information */}
      <section className="info-section">
        <div className="info-container">
          <h1>OUR VISION</h1>
          <div className='info-p' >
          <p>
            Our vision is to create a sustainable digital ecosystem that empowers farmers to transform their crops into high-value products, connect with global buyers, and leverage technology for growth, innovation, and prosperity.
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
