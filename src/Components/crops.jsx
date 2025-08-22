import React, { useEffect, useState } from 'react';
import projectsData from './cropsData';
import './crops.css';

const Crops = () => {
  const [cropPrices, setCropPrices] = useState({});

  // Function to fetch prices from the API
  const fetchPrices = async () => {
    try {
      const response = await axios.get('https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=579b464db66ec23bdd0000011a3d34ba831d462471750c44dc8751a1&format=csv&filters%5BState.keyword%5D=Jharkhand&filters%5BDistrict.keyword%5D=bokaro&filters%5BCommodity', {
        params: {
          apiKey: '579b464db66ec23bdd0000011a3d34ba831d462471750c44dc8751a1', // Replace with your actual API key
        },
      });

      // Assuming the response is an object with crop names as keys and their prices as values
      setCropPrices(response.data);
    } catch (error) {
      console.error('Error fetching crop prices:', error);
    }
  };

  // Fetch prices on component mount and set an interval to update prices periodically
  useEffect(() => {
    fetchPrices();
    const intervalId = setInterval(fetchPrices, 60000); // Update every 1 minute

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, []);

  return (
    <section className="projects-section">
      <h1>CROPS</h1>
      <p>Get the prices of your crops according to the market!</p>
      
      <div className="gallery">
        {projectsData.map((project) => (
          <div className="gallery-item" key={project.id}>
            
            <img loading='lazy' src={project.imgSrc} alt={project.title} className="gallery-image" />
            <div className="overlay">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              {/* Display the price dynamically from the API */}
              <p className="price">
                {cropPrices[project.title] 
                  ? `Current Price: ${cropPrices[project.title]} ₹ per kg`
                  : 'Price not available'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Crops;
