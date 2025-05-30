import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from "./components/navbar";
import HomePage from "./components/home";
import ContactForm from './components/ContactForm';
import BMICalculator from './components/BMICalculator';
import IdealWeightCalculator from './components/IdealWeightCalculator';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProfilePage from './components/profile';
import ManualSearchHome from './components/ManualSearchHome';
import DailyTotals from './components/DailyTotals';
import DashData from './components/DashData';
import SettingsPage from './components/SettingsPage';
import ChatbotWindow from './components/ChatbotWindow';
import ImageToNutritionApp from './components/ImageToNutritionApp';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/bmi-calculator" element={<BMICalculator />} />
          <Route path="/ideal-weight-calculator" element={<IdealWeightCalculator />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/ManualSearchHome" element={<ManualSearchHome />} />
          <Route path="/DailyTotals" element={<DailyTotals />} />
          <Route path="/DashData" element={<DashData />} /> 
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/chatbot" element={<ChatbotWindow />} />
          <Route path="/imageee" element={<ImageToNutritionApp />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;