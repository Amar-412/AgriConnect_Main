import React, { useState, useEffect } from 'react';
import './Imageslider.css'; // Import the CSS file for styling

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Array of image sources
  const images = [
    'images/farmer1.jpg', 
    'images/farmer2.jpg',
    'images/farmer3.jpg',
    'images/farmer4.jpg',
    'images/farmer5.jpg'
  ];

  const totalImages = images.length;

  // Function to go to the next image
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
  };

  // Function to go to the previous image
  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
  };

  // Use effect to set up the automatic image change
  useEffect(() => {
    const intervalId = setInterval(nextImage, 3000); // Change image every 3 seconds

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="slider-container">
      <div className="slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {images.map((image, index) => (
          <img loading='lazy'
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className="slider-image"
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
