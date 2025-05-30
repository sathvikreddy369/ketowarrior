import React from 'react';
import image from '../assets/images/your-image1.jpg';
import './recommendationsHome.css';

const RecommendationsHome = () => {
  return (
    <div className="recommended-articles">
      <h2 className="recommended-header">RECOMMENDED</h2>
      <div className="article">
        <img src={image} alt="Article 1" className="article-image" />
        <div className="article-content">
          <h3>These Are The Best Times To Drink Water</h3>
          <p>Whether you're just waking up or in a midday slump, see when you should be drinking water.</p>
        </div>
      </div>
      <div className="article">
        <img src={image} alt="Article 2" className="article-image" />
        <div className="article-content">
          <h3>25 Super Snacks With 100 Calories Or Less</h3>
          <p>These snacks are quicker, cheaper, and less processed than many 100-calorie snack packs.</p>
        </div>
      </div>
      <div className="article">
        <img src={image} alt="Article 3" className="article-image" />
        <div className="article-content">
          <h3>Surprising Reasons You're Gaining Weight</h3>
          <p>Even with the same routine, weight still increasing? Discover how medications, sleep problems, and more can contribute.</p>
        </div>
      </div>
      <div className="article">
        <img src={image} alt="Article 4" className="article-image" />
        <div className="article-content">
          <h3>The Truth About Carbohydrates</h3>
          <p>Learn more about what carbs do for you and how to get them.</p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsHome;
