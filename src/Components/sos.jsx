import React from 'react';

const SOS = () => {
    const handleSOSClick = () => {
        // Replace with your actual location URL or coordinates
        const locationUrl = "https://www.google.com/maps?q=Your+Location+Here";

        // Initiate the call
        window.location.href = "tel:108";

        // Open the location link in a new tab
        window.open(locationUrl, '_blank');
    };

    return (
        <a className='sos1' onClick={handleSOSClick} style={{ cursor: 'pointer' }}>
            <img className='sos' src="images/help.png" alt="Help" />
        </a>
    );
};

export default SOS;
