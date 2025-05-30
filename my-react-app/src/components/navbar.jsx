
// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { User, ChevronDown, LogOut, Settings, User as UserIcon, Menu, X, Mail, PieChart, Calculator, TrendingUp, HomeIcon } from 'lucide-react';
// import logo from '../assets/images/KETO_WARRIOR.png';
// import './navbar.css';

// const Navbar = ({ onCalorieCounterClick }) => {
//     const [showCalculatorDropdown, setShowCalculatorDropdown] = useState(false);
//     const [showProfileDropdown, setShowProfileDropdown] = useState(false);
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const storedUser = JSON.parse(localStorage.getItem('user'));
//         setIsLoggedIn(!!storedUser);
//     }, []);

//     const handleLogout = () => {
//         localStorage.removeItem('user');
//         setIsLoggedIn(false);
//         navigate('/login');
//     };

//     const toggleMobileMenu = () => {
//         setIsMobileMenuOpen(!isMobileMenuOpen);
//         document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
//     };

//     const closeMobileMenu = () => {
//         setIsMobileMenuOpen(false);
//         document.body.style.overflow = 'auto';
//     };

//     return (
//         <>
//             <nav className="navbar">
//                 <div className="navbar-container">
//                     <Link className="navbar-brand" to="/" onClick={closeMobileMenu}>
//                         <img src={logo} alt="Keto Warrior Logo" className="navbar-logo" />
//                     </Link>
                    
//                     <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
//                         <ul className="nav-list">
//                         <li className="nav-item">
//                                 <Link 
//                                     className="nav-link" 
//                                     to="/"
//                                     onClick={closeMobileMenu}
//                                 >
//                                     <HomeIcon size={18} className="nav-icon" />
//                                     <span>Home</span>
//                                 </Link>
//                             </li>
//                             <li className="nav-item">
//                                 <Link 
//                                     className="nav-link" 
//                                     to="/DailyTotals"
//                                     onClick={closeMobileMenu}
//                                 >
//                                     <PieChart size={18} className="nav-icon" />
//                                     <span>Today's Macros</span>
//                                 </Link>
//                             </li>
//                             <li className="nav-item">
//                                 <Link 
//                                     className="nav-link" 
//                                     to="/DashData"
//                                     onClick={closeMobileMenu}
//                                 >
//                                     <TrendingUp size={18} className="nav-icon" />
//                                     <span>Your Progress</span>
//                                 </Link>
//                             </li>
                            
//                             <li className="nav-item dropdown">
//                                 <button
//                                     className="nav-link dropdown-toggle"
//                                     onClick={() => setShowCalculatorDropdown(!showCalculatorDropdown)}
//                                     aria-expanded={showCalculatorDropdown}
//                                 >
//                                     <Calculator size={18} className="nav-icon" />
//                                     <span>Calculators</span>
//                                     <ChevronDown size={16} className={`dropdown-icon ${showCalculatorDropdown ? 'rotate-180' : ''}`} />
//                                 </button>
//                                 <ul className={`dropdown-menu ${showCalculatorDropdown ? 'show' : ''}`}>
//                                     <li>
//                                         <Link 
//                                             className="dropdown-item" 
//                                             to="/bmi-calculator"
//                                             onClick={closeMobileMenu}
//                                         >
//                                             BMI Calculator
//                                         </Link>
//                                     </li>
//                                     <li>
//                                         <Link 
//                                             className="dropdown-item" 
//                                             to="/ideal-weight-calculator"
//                                             onClick={closeMobileMenu}
//                                         >
//                                             Ideal Weight Calculator
//                                         </Link>
//                                     </li>
//                                 </ul>
//                             </li>
//                         </ul>

//                         <div className="navbar-actions">
//                             {isLoggedIn ? (
//                                 <div className="profile-dropdown">
//                                     <button 
//                                         className="profile-button"
//                                         onClick={() => setShowProfileDropdown(!showProfileDropdown)}
//                                         aria-expanded={showProfileDropdown}
//                                     >
//                                         <User size={20} className="profile-icon" />
//                                     </button>
//                                     <ul className={`dropdown-menu dropdown-menu-end ${showProfileDropdown ? 'show' : ''}`}>
//                                         <li>
//                                             <Link 
//                                                 className="dropdown-item" 
//                                                 to="/profile"
//                                                 onClick={closeMobileMenu}
//                                             >
//                                                 <UserIcon size={16} className="me-2" /> Profile
//                                             </Link>
//                                         </li>
//                                         <li>
//                                             <Link 
//                                                 className="dropdown-item" 
//                                                 to="/settings"
//                                                 onClick={closeMobileMenu}
//                                             >
//                                                 <Settings size={16} className="me-2" /> Settings
//                                             </Link>
//                                         </li>
//                                         <li>
//                                             <Link 
//                                                 className="dropdown-item" 
//                                                 to="/contact"
//                                                 onClick={closeMobileMenu}
//                                             >
//                                                 <Mail size={16} className="me-2" /> Contact us
//                                             </Link>
//                                         </li>
//                                         <li className="dropdown-divider"></li>
//                                         <li>
//                                             <button 
//                                                 className="dropdown-item" 
//                                                 onClick={() => {
//                                                     handleLogout();
//                                                     closeMobileMenu();
//                                                 }}
//                                             >
//                                                 <LogOut size={16} className="me-2" /> Logout
//                                             </button>
//                                         </li>
//                                     </ul>
//                                 </div>
//                             ) : (
//                                 <Link 
//                                     className="login-button" 
//                                     to="/login"
//                                     onClick={closeMobileMenu}
//                                 >
//                                     Login
//                                 </Link>
//                             )}
//                         </div>
//                     </div>

//                     <button
//                         className="navbar-toggler"
//                         onClick={toggleMobileMenu}
//                         aria-label="Toggle navigation"
//                         aria-expanded={isMobileMenuOpen}
//                     >
//                         <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
//                             <span></span>
//                             <span></span>
//                             <span></span>
//                         </div>
//                     </button>
//                 </div>
//             </nav>

//             {/* Mobile menu backdrop */}
//             {isMobileMenuOpen && (
//                 <div className="mobile-menu-backdrop" onClick={closeMobileMenu}></div>
//             )}
//         </>
//     );
// };

// export default Navbar;



// import React, { useState, useEffect, useRef } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Home, PieChart, LineChart, Calculator, User, ChevronDown, LogOut, Settings, Mail, Menu, X } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { auth } from '../firebaseConfig';
// import { onAuthStateChanged } from 'firebase/auth';
// import logo from '../assets/images/KETO_WARRIOR.png';
// import './navbar.css';

// const Navbar = () => {
//     const [showCalculatorDropdown, setShowCalculatorDropdown] = useState(false);
//     const [showProfileDropdown, setShowProfileDropdown] = useState(false);
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//     const [user, setUser] = useState(null);
//     const navigate = useNavigate();
//     const calculatorDropdownRef = useRef(null);
//     const profileDropdownRef = useRef(null);

//     useEffect(() => {
//         const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//             setUser(currentUser);
//         });
//         return () => unsubscribe();
//     }, []);

//     const handleLogout = async () => {
//         try {
//             await auth.signOut();
//             navigate('/login');
//         } catch (error) {
//             console.error('Logout error:', error);
//         }
//     };

//     const toggleMobileMenu = () => {
//         setIsMobileMenuOpen(!isMobileMenuOpen);
//         document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
//     };

//     const closeMobileMenu = () => {
//         setIsMobileMenuOpen(false);
//         document.body.style.overflow = 'auto';
//     };

//     const toggleCalculatorDropdown = () => {
//         setShowCalculatorDropdown(!showCalculatorDropdown);
//     };

//     const toggleProfileDropdown = () => {
//         setShowProfileDropdown(!showProfileDropdown);
//     };

//     useEffect(() => {
//         function handleClickOutside(event) {
//             if (calculatorDropdownRef.current && !calculatorDropdownRef.current.contains(event.target)) {
//                 setShowCalculatorDropdown(false);
//             }
//             if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
//                 setShowProfileDropdown(false);
//             }
//         }

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [calculatorDropdownRef, profileDropdownRef]);

//     return (
//         <>
//             <nav className="tech-navbar">
//                 <div className="navbar-container">
//                     <Link className="navbar-brand" to="/" onClick={closeMobileMenu}>
//                         <motion.img
//                             src={logo}
//                             alt="Keto Warrior Logo"
//                             className="navbar-logo"
//                             whileHover={{ scale: 1.05 }}
//                             transition={{ type: 'spring', stiffness: 300 }}
//                         />
//                     </Link>

//                     <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
//                         <ul className="nav-list">
//                             <li className="nav-item">
//                                 <Link
//                                     className="nav-link"
//                                     to="/"
//                                     onClick={closeMobileMenu}
//                                 >
//                                     <Home size={18} className="nav-icon" />
//                                     <span>Home</span>
//                                 </Link>
//                             </li>
//                             {user && (
//                                 <>
//                                     <li className="nav-item">
//                                         <Link
//                                             className="nav-link"
//                                             to="/DailyTotals"
//                                             onClick={closeMobileMenu}
//                                         >
//                                             <PieChart size={18} className="nav-icon" />
//                                             <span>Today's Macros</span>
//                                         </Link>
//                                     </li>
//                                     <li className="nav-item">
//                                         <Link
//                                             className="nav-link"
//                                             to="/DashData"
//                                             onClick={closeMobileMenu}
//                                         >
//                                             <LineChart size={18} className="nav-icon" />
//                                             <span>Progress</span>
//                                         </Link>
//                                     </li>
//                                 </>
//                             )}
//                             <li className="nav-item dropdown" ref={calculatorDropdownRef}>
//                                 <button
//                                     className="nav-link dropdown-toggle"
//                                     onClick={toggleCalculatorDropdown}
//                                     aria-expanded={showCalculatorDropdown}
//                                 >
//                                     <Calculator size={18} className="nav-icon" />
//                                     <span>Calculators</span>
//                                     <motion.div
//                                         className="dropdown-icon"
//                                         animate={{ rotate: showCalculatorDropdown ? 180 : 0 }}
//                                         transition={{ duration: 0.2 }}
//                                     >
//                                         <ChevronDown size={16} />
//                                     </motion.div>
//                                 </button>
//                                 <div className={`dropdown-menu ${showCalculatorDropdown ? 'show' : ''}`}>
//                                     <Link
//                                         className="dropdown-item"
//                                         to="/bmi-calculator"
//                                         onClick={closeMobileMenu}
//                                     >
//                                         BMI Calculator
//                                     </Link>
//                                     <Link
//                                         className="dropdown-item"
//                                         to="/ideal-weight-calculator"
//                                         onClick={closeMobileMenu}
//                                     >
//                                         Ideal Weight Calculator
//                                     </Link>
//                                 </div>
//                             </li>
//                         </ul>

//                         <div className="navbar-actions">
//                             {user ? (
//                                 <div className="profile-dropdown" ref={profileDropdownRef}>
//                                     <button
//                                         className="profile-button"
//                                         onClick={toggleProfileDropdown}
//                                         aria-expanded={showProfileDropdown}
//                                     >
//                                         <motion.div
//                                             whileHover={{ scale: 1.1 }}
//                                             whileTap={{ scale: 0.95 }}
//                                         >
//                                             <User size={20} className="profile-icon" />
//                                         </motion.div>
//                                     </button>
//                                     <div className={`dropdown-menu dropdown-menu-end ${showProfileDropdown ? 'show' : ''}`}>
//                                         <Link
//                                             className="dropdown-item"
//                                             to="/profile"
//                                             onClick={closeMobileMenu}
//                                         >
//                                             <User size={16} className="me-2" /> Profile
//                                         </Link>
//                                         <Link
//                                             className="dropdown-item"
//                                             to="/settings"
//                                             onClick={closeMobileMenu}
//                                         >
//                                             <Settings size={16} className="me-2" /> Settings
//                                         </Link>
//                                         <Link
//                                             className="dropdown-item"
//                                             to="/contact"
//                                             onClick={closeMobileMenu}
//                                         >
//                                             <Mail size={16} className="me-2" /> Contact
//                                         </Link>
//                                         <div className="dropdown-divider"></div>
//                                         <button
//                                             className="dropdown-item"
//                                             onClick={() => {
//                                                 handleLogout();
//                                                 closeMobileMenu();
//                                             }}
//                                         >
//                                             <LogOut size={16} className="me-2" /> Logout
//                                         </button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <motion.div
//                                     whileHover={{ scale: 1.05 }}
//                                     whileTap={{ scale: 0.95 }}
//                                 >
//                                     <Link
//                                         className="login-button"
//                                         to="/login"
//                                         onClick={closeMobileMenu}
//                                     >
//                                         Login
//                                     </Link>
//                                 </motion.div>
//                             )}
//                         </div>
//                     </div>

//                     <motion.button
//                         className="navbar-toggler"
//                         onClick={toggleMobileMenu}
//                         aria-label="Toggle navigation"
//                         aria-expanded={isMobileMenuOpen}
//                         whileTap={{ scale: 0.9 }}
//                     >
//                         <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
//                             <span className="hamburger-line"></span>
//                             <span className="hamburger-line"></span>
//                             <span className="hamburger-line"></span>
//                         </div>
//                     </motion.button>
//                 </div>
//             </nav>

//             {/* Mobile menu backdrop */}
//             <AnimatePresence>
//                 {isMobileMenuOpen && (
//                     <motion.div
//                         className="mobile-menu-backdrop"
//                         onClick={closeMobileMenu}
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                     />
//                 )}
//             </AnimatePresence>
//         </>
//     );
// };

// export default Navbar;

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, PieChart, LineChart, Calculator, User, ChevronDown, LogOut, Settings, Mail, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import logo from '../assets/images/KETO_WARRIOR.png';
import './navbar.css';

const Navbar = () => {
    const [showCalculatorDropdown, setShowCalculatorDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const calculatorDropdownRef = useRef(null);
    const profileDropdownRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : 'auto';
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = 'auto';
        setShowCalculatorDropdown(false);
        setShowProfileDropdown(false);
    };

    const toggleCalculatorDropdown = () => {
        setShowCalculatorDropdown(!showCalculatorDropdown);
    };

    const toggleProfileDropdown = () => {
        setShowProfileDropdown(!showProfileDropdown);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (calculatorDropdownRef.current && !calculatorDropdownRef.current.contains(event.target)) {
                setShowCalculatorDropdown(false);
            }
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setShowProfileDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [calculatorDropdownRef, profileDropdownRef]);

    return (
        <>
            <nav className="tech-navbar">
                <div className="navbar-container">
                    <Link className="navbar-brand" to="/" onClick={closeMobileMenu}>
                        <motion.img
                            src={logo}
                            alt="Keto Warrior Logo"
                            className="navbar-logo"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        />
                    </Link>

                    <div className={`navbar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                        <ul className="nav-list">
                            <li className="nav-item">
                                <Link
                                    className="nav-link"
                                    to="/"
                                    onClick={closeMobileMenu}
                                >
                                    <Home size={18} className="nav-icon" />
                                    <span>Home</span>
                                </Link>
                            </li>
                            {user && (
                                <>
                                    <li className="nav-item">
                                        <Link
                                            className="nav-link"
                                            to="/DailyTotals"
                                            onClick={closeMobileMenu}
                                        >
                                            <PieChart size={18} className="nav-icon" />
                                            <span>Today's Macros</span>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link
                                            className="nav-link"
                                            to="/DashData"
                                            onClick={closeMobileMenu}
                                        >
                                            <LineChart size={18} className="nav-icon" />
                                            <span>Progress</span>
                                        </Link>
                                    </li>
                                </>
                            )}
                            <li className="nav-item dropdown" ref={calculatorDropdownRef}>
                                <button
                                    className="nav-link dropdown-toggle"
                                    onClick={toggleCalculatorDropdown}
                                    aria-expanded={showCalculatorDropdown}
                                >
                                    <Calculator size={18} className="nav-icon" />
                                    <span>Calculators</span>
                                    <motion.div
                                        className="dropdown-icon"
                                        animate={{ rotate: showCalculatorDropdown ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown size={16} />
                                    </motion.div>
                                </button>
                                <div className={`dropdown-menu ${showCalculatorDropdown ? 'show' : ''}`}>
                                    <Link
                                        className="dropdown-item"
                                        to="/bmi-calculator"
                                        onClick={closeMobileMenu}
                                    >
                                        BMI Calculator
                                    </Link>
                                    <Link
                                        className="dropdown-item"
                                        to="/ideal-weight-calculator"
                                        onClick={closeMobileMenu}
                                    >
                                        Ideal Weight Calculator
                                    </Link>
                                </div>
                            </li>

                            {user && (
                                <li className="nav-item dropdown" ref={profileDropdownRef}>
                                    <button
                                        className="nav-link dropdown-toggle"
                                        onClick={toggleProfileDropdown}
                                        aria-expanded={showProfileDropdown}
                                    >
                                        <User size={18} className="nav-icon" />
                                        <span>Profile</span>
                                        <motion.div
                                            className="dropdown-icon"
                                            animate={{ rotate: showProfileDropdown ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown size={16} />
                                        </motion.div>
                                    </button>
                                    <div className={`dropdown-menu dropdown-menu-end ${showProfileDropdown ? 'show' : ''}`}>
                                        <Link
                                            className="dropdown-item"
                                            to="/profile"
                                            onClick={closeMobileMenu}
                                        >
                                            <User size={16} className="me-2" /> Profile
                                        </Link>
                                        <Link
                                            className="dropdown-item"
                                            to="/settings"
                                            onClick={closeMobileMenu}
                                        >
                                            <Settings size={16} className="me-2" /> Settings
                                        </Link>
                                        <Link
                                            className="dropdown-item"
                                            to="/contact"
                                            onClick={closeMobileMenu}
                                        >
                                            <Mail size={16} className="me-2" /> Contact
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => {
                                                handleLogout();
                                                closeMobileMenu();
                                            }}
                                        >
                                            <LogOut size={16} className="me-2" /> Logout
                                        </button>
                                    </div>
                                </li>
                            )}
                        </ul>

                        {!user && (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    className="login-button"
                                    to="/login"
                                    onClick={closeMobileMenu}
                                >
                                    Login
                                </Link>
                            </motion.div>
                        )}
                    </div>

                    <motion.button
                        className="navbar-toggler"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle navigation"
                        aria-expanded={isMobileMenuOpen}
                        whileTap={{ scale: 0.9 }}
                    >
                        <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                        </div>
                    </motion.button>
                </div>
            </nav>

            {/* Mobile menu backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="mobile-menu-backdrop"
                        onClick={closeMobileMenu}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;