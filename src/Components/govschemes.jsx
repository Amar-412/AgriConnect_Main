import React from 'react';
import styles from './Schemes.module.css'; // Import CSS module
import schemes from './schemesData';
import ImageSlider from './cardSlider';  // Import the ImageSlider component

const GovSchemes = () => {
  return (
    <div className={styles.container}>
      <h1>Indian Government Schemes for Farmers</h1>
      
      {/* Add the ImageSlider below the H1 */}
      <ImageSlider />

      <div className='gov-schemes-text'>
        <p>
          Indian government schemes for farmers play a crucial role in uplifting the agricultural sector and improving the livelihoods of farmers across the country. These schemes provide financial assistance, subsidies, and access to modern technology, helping farmers increase productivity and reduce costs. Programs like <strong>Pradhan Mantri Fasal Bima Yojana</strong> offer crop insurance to protect against unpredictable weather conditions, while <strong>PM-Kisan</strong> ensures direct income support to small and marginal farmers. Additionally, initiatives such as <strong>Kisan Credit Card</strong> provide easy access to credit at lower interest rates. These schemes not only reduce the financial burden on farmers but also promote sustainable farming practices, enhance crop yields, and ensure food security, contributing to the overall growth of India's rural economy.
        </p>
      </div>


      <div className="row mt-5"> {/* Add margin-top for spacing */}
        {schemes.map((scheme, index) => (
          <div key={index} className="col-md-6 mb-4">
            <div className={`card ${styles.schemeCard} h-100`}>
              <div className="card-body">
                <h5 className={styles.cardTitle}>{scheme.name}</h5>
                <p className={styles.cardText}>{scheme.description}</p>
                <a
                  href={scheme.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn ${styles.btnPrimary}`}
                >
                  Click-to-Visit
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GovSchemes;
