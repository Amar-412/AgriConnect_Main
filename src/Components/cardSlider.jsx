import React, { useState, useEffect } from 'react';
import styles from './cardSlider.module.css'; // Use CSS modules

const slides = [
  { id: 1, title: 'Glacier', location: 'Montana', img: '/images/gov1.webp' },
  { id: 2, title: 'Grand Canyon', location: 'Arizona', img: '/images/gov2.jpg' },
  { id: 3, title: 'Yosemite', location: 'California', img: '/images/gov3.webp' },
  { id: 4, title: 'Yellowstone', location: 'Wyoming - Montana - Idaho', img: '/images/gov4.jpg' },
];

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  return (
    <div className={styles.sliderContainer}>
      <h2>Goverment Schemes</h2>
      <div className={styles.slider}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${index === currentIndex ? styles.active : ''}`}
            style={{
              backgroundImage: `url(${slide.img})`,
            }}
          >
            <div className={styles.slideContent}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;
