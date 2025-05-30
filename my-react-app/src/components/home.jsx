import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
    Home, PieChart, LineChart, Calculator, Camera, Search, User,
    MessageSquare, ArrowRight, ChevronDown, ChevronUp, X,
    Image, Zap, Plus, CheckCircle, BarChart2, Smartphone
} from 'lucide-react';
import { FaRobot } from 'react-icons/fa';
import Navbar from './navbar';
import Footer from './Footer';
import ChatbotWindow from './ChatbotWindow';
import './home.css';
import heroImage from '../assets/images/main2_2.png';
import analyzerImage from '../assets/images/main2_2.png';
import feature1Image from '../assets/images/chatbot.png';
import feature2Image from '../assets/images/database.png';
import feature3Image from '../assets/images/progress.png';
import step1Image from '../assets/images/step1.png';
import step2Image from '../assets/images/step2.png';
import step3Image from '../assets/images/step3.png';
import step4Image from '../assets/images/step4.png';
const HomePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showChatbotGreeting, setShowChatbotGreeting] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isMobile) {
            const timer = setTimeout(() => {
                setShowChatbotGreeting(true);
                const hideTimer = setTimeout(() => {
                    setShowChatbotGreeting(false);
                }, 3000);
                return () => clearTimeout(hideTimer);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isMobile]);

    const goToManualSearch = () => {
        navigate('/ManualSearchHome');
    };

    const triggerImageUpload = () => {
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        imageInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                navigate('/imageee', { state: { imageFile: file } });
            }
        };
        imageInput.click();
    };

    const toggleChatbot = () => {
        setIsChatbotOpen(!isChatbotOpen);
    };

    const navigateToFeature = (route) => {
        navigate(route);
    };

    const stepsData = [
        {
            number: "1",
            title: "Track calories, macros & more",
            description: "Use our AI-powered food analyzer to track your meals with ease. Just snap a photo! or Use our manual search.",
            image: step1Image
        },
        {
            number: "2",
            title: "Click on analyze and get macros",
            description: "Get instant feedback on your meal's nutritional content.",
            image: step2Image
        },
        {
            number: "3",
            title: "Add to daily totals",
            description: "Easily name your meals and add them to your daily totals with just a click.",
            image: step3Image
        },
        {
            number: "4",
            title: "You are all set!",
            description: "You have successfully added your meal! View them in daily totals.",
            image: step4Image
        }
    ];

    const features = [
        {
            title: "AI-Powered chatbot",
            description: "Our advanced AI chatbot is here to assist you with all your nutrition-related queries.",
            image: feature1Image,
            icon: <Zap size={24} className="feature-icon" />
        },
        {
            title: "Manual Food Search",
            description: "Search our comprehensive database of over 10,000 food items with detailed nutrition info.",
            image: feature2Image,
            icon: <Search size={24} className="feature-icon" />
        },
        {
            title: "Progress Tracking",
            description: "Visualize your nutrition journey with interactive charts and personalized insights.",
            image: feature3Image,
            icon: <LineChart size={24} className="feature-icon" />
        }
    ];

    return (
        <div className="home-page">
            <Navbar />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <motion.div
                            className="hero-text"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="hero-title">
                                {user ? (
                                    <>
                                        Welcome Back, <span className="text-gradient">Nutrition Explorer</span>
                                    </>
                                ) : (
                                    <>
                                        Your <span className="text-gradient">AI-Powered</span> Nutrition Companion
                                    </>
                                )}
                            </h1>
                            <p className="hero-subtitle">
                                {user ? (
                                    "Track your meals, monitor progress, and stay on target with your health goals."
                                ) : (
                                    "Revolutionize how you track nutrition with computer vision and AI technology."
                                )}
                            </p>
                            <div className="hero-actions">
                                {user ? (
                                    <motion.button
                                        className="btn-primary"
                                        onClick={() => navigate("/DailyTotals")}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Today's totals <ArrowRight size={18} />
                                    </motion.button>
                                ) : (
                                    <>
                                        <motion.button
                                            className="btn-primary"
                                            onClick={() => navigate("/signup")}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Get Started <ArrowRight size={18} />
                                        </motion.button>
                                        <motion.button
                                            className="btn-outline"
                                            onClick={() => navigate("/login")}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Login
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                        <motion.div
                            className="hero-image-container"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <img
                                src={user ? analyzerImage : heroImage}
                                alt={user ? "Food analyzer interface" : "Healthy food analysis"}
                                className="hero-image"
                            />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How It Works Section (Styled like the image) - Only show when logged out */}
            {!user && (
                <section className="how-it-works-section-image">
                    <div className="container">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="section-title"
                        >
                            Hit your health goals in 1-2-3
                        </motion.h2>
                        <div className="steps-layout">
                            {stepsData.map((step, index) => (
                                <motion.div
                                    key={index}
                                    className={`step-item`}
                                    style={{ flexDirection: index % 2 === 1 ? 'row-reverse' : 'row' }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.2 }}
                                >
                                    <div className="image-container">
                                        <img src={step.image} alt={step.title} className="step-image" />
                                    </div>
                                    <div className="text-container">
                                        <span className="step-number">{step.number}</span>
                                        <h3 className="step-title">{step.title}</h3>
                                        <p className="step-description">{step.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Main Content (Features for non-logged-in users) */}
            {!user && (
                <section className="features-section">
                    <div className="container">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="section-title"
                        >
                            Advanced Features
                        </motion.h2>
                        <div className="features-grid">
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    className="feature-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.2 }}
                                >
                                    <div className="feature-image-container">
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            className="feature-image"
                                        />
                                    </div>
                                    <div className="feature-content">
                                        <div className="feature-icon-container">
                                            {feature.icon}
                                        </div>
                                        <h3 className="feature-title">{feature.title}</h3>
                                        <p className="feature-description">{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Quick Actions for logged-in users */}
            {user && (
                <section className="quick-actions-section">
                    <div className="container">
                        <motion.h2
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="section-title"
                        >
                            Quick Actions
                        </motion.h2>
                        <div className="quick-actions-grid">
                            {[
                                {
                                    icon: <Search size={24} />,
                                    title: "Manual Search",
                                    description: "Search food database",
                                    action: goToManualSearch
                                },
                                {
                                    icon: <Camera size={24} />,
                                    title: "Image Analysis",
                                    description: "Analyze food photos",
                                    route: "/imageee"
                                },
                                {
                                    icon: <PieChart size={24} />,
                                    title: "Today's Macros",
                                    description: "Your daily progress",
                                    route: "/DailyTotals"
                                },
                                {
                                    icon: <LineChart size={24} />,
                                    title: "Progress Tracker",
                                    description: "Your stats and trends",
                                    route: "/DashData"
                                },
                                {
                                    icon: <Calculator size={24} />,
                                    title: "Calculators",
                                    description: "BMI & ideal weight",
                                    route: "/bmi-calculator"
                                },
                                {
                                    icon: <User size={24} />,
                                    title: "Profile",
                                    description: "Manage account",
                                    route: "/profile"
                                }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    className="action-card"
                                    whileHover={{ y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    onClick={() => feature.route ? navigateToFeature(feature.route) : feature.action()}
                                >
                                    <div className="action-icon">
                                        {feature.icon}
                                    </div>
                                    <h3 className="action-title">{feature.title}</h3>
                                    <p className="action-description">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            {!user && (
                <section className="cta-section">
                    <div className="container">
                        <motion.div
                            className="cta-content"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="cta-title">Ready to Transform Your Nutrition?</h2>
                            <p className="cta-text">Join thousands of users who are achieving their health goals with our platform.</p>
                            <motion.button
                                className="btn-primary"
                                onClick={() => navigate("/signup")}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Start Your Journey Today <ArrowRight size={18} />
                            </motion.button>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Chatbot Integration */}
            <div className="chatbot-container">
                <AnimatePresence>
                    {showChatbotGreeting && (
                        <motion.div
                            className="chatbot-greeting"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span>Hey! I'm Nutri AI</span>
                            <button
                                className="close-greeting"
                                onClick={() => setShowChatbotGreeting(false)}
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.div
                    className="chatbot-toggle"
                    onClick={toggleChatbot}
                    aria-label="Open Chatbot"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <div className="chatbot-bubble">
                        <FaRobot className="chatbot-icon" />
                        {!isMobile && <span className="chatbot-text">Ask me about nutrition</span>}
                        {isChatbotOpen ? (
                            <ChevronDown className="chatbot-arrow" />
                        ) : (
                            <ChevronUp className="chatbot-arrow" />
                        )}
                    </div>
                </motion.div>

                <AnimatePresence>
                    {isChatbotOpen && (
                        <ChatbotWindow onClose={toggleChatbot} />
                    )}
                </AnimatePresence>
            </div>

            <Footer />
        </div>
    );
};

export default HomePage;