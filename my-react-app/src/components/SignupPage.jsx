// import React, { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";
// import { auth, db } from "../firebaseConfig";
// import { Eye, EyeOff, Loader2 } from "lucide-react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./signup.css";
// import logo from "../assets/images/KETO_WARRIOR.png"; // Adjust path to your logo

// const SignupPage = () => {
//     const [username, setUsername] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState(false);
//     const [redirectTimer, setRedirectTimer] = useState(5);
//     const [loading, setLoading] = useState(false);
//     const [googleLoading, setGoogleLoading] = useState(false);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const navigate = useNavigate();

//     useEffect(() => {
//         let timer;
//         if (success && redirectTimer > 0) {
//             timer = setTimeout(() => {
//                 setRedirectTimer((prev) => prev - 1);
//             }, 1000);
//         } else if (success && redirectTimer === 0) {
//             navigate("/login");
//         }
//         return () => clearTimeout(timer);
//     }, [success, navigate, redirectTimer]);

//     const handleSignup = async (e) => {
//         e.preventDefault();
//         setError("");
//         setSuccess(false);
//         setLoading(true);
//         setIsSubmitting(true);

//         if (!username || !email || !password || !confirmPassword) {
//             setError("Please fill in all fields.");
//             setLoading(false);
//             setIsSubmitting(false);
//             return;
//         }

//         if (password !== confirmPassword) {
//             setError("Passwords do not match.");
//             setLoading(false);
//             setIsSubmitting(false);
//             return;
//         }

//         try {
//             // Simulate network delay for demo purposes (remove in production)
//             await new Promise(resolve => setTimeout(resolve, 1500));
            
//             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//             const user = userCredential.user;

//             // Update Firebase Auth profile with the username
//             await updateProfile(user, { displayName: username });

//             // Store additional user data in Firestore
//             await setDoc(doc(db, "users", user.uid), {
//                 uid: user.uid,
//                 username: username,
//                 email: email,
//                 createdAt: new Date(),
//                 authProvider: "email",
//             });

//             // Create a user profile document
//             await setDoc(doc(db, "userProfiles", user.uid), {
//                 userId: user.uid,
//                 username: username,
//                 email: email,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//             });

//             setSuccess(true);
//         } catch (firebaseError) {
//             console.error("Signup Error:", firebaseError.message);
//             let errorMessage = "Signup failed. Please try again.";
            
//             // More user-friendly error messages
//             switch (firebaseError.code) {
//                 case "auth/email-already-in-use":
//                     errorMessage = "This email is already in use.";
//                     break;
//                 case "auth/invalid-email":
//                     errorMessage = "Please enter a valid email address.";
//                     break;
//                 case "auth/weak-password":
//                     errorMessage = "Password should be at least 6 characters.";
//                     break;
//             }
            
//             setError(errorMessage);
//         } finally {
//             setLoading(false);
//             setIsSubmitting(false);
//         }
//     };

//     const signInWithGoogle = async () => {
//         setError("");
//         setGoogleLoading(true);
        
//         try {
//             const provider = new GoogleAuthProvider();
//             const result = await signInWithPopup(auth, provider);
//             const user = result.user;

//             // Check if user is new or existing
//             const isNewUser = result._tokenResponse.isNewUser;

//             if (isNewUser) {
//                 // Store additional user data in Firestore for new users
//                 await setDoc(doc(db, "users", user.uid), {
//                     uid: user.uid,
//                     username: user.displayName || user.email.split('@')[0],
//                     email: user.email,
//                     createdAt: new Date(),
//                     authProvider: "google",
//                 });

//                 // Create a user profile document
//                 await setDoc(doc(db, "userProfiles", user.uid), {
//                     userId: user.uid,
//                     username: user.displayName || user.email.split('@')[0],
//                     email: user.email,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                 });
//             }

//             // Redirect to home page after successful signup/login
//             navigate("/");
//         } catch (error) {
//             console.error("Google Signup Error:", error.message);
//             setError("Google signup failed. Please try again.");
//         } finally {
//             setGoogleLoading(false);
//         }
//     };

//     const handleContinueToLogin = () => {
//         navigate("/login");
//     };

//     return (
//         <div className="signup-container">
//             {/* Background with logo */}
//             <div className="signup-background">
//                 <div className="logo-container">
//                     <img src={logo} alt="Company Logo" className="logo" />
//                 </div>
//                 <div className="background-overlay"></div>
//             </div>

//             {/* Main content */}
//             <div className="signup-content">
//                 <div className="signup-card-container">
//                     <div className={`signup-card ${isSubmitting ? 'submitting' : ''}`}>
//                         <div className="card-header">
//                             <h2>Create Your Account</h2>
//                             <p>Join our community today</p>
//                         </div>

//                         <div className="card-body">
//                             {error && (
//                                 <div className="alert alert-danger fade-in">
//                                     <div className="alert-icon">
//                                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                             <circle cx="12" cy="12" r="10"></circle>
//                                             <line x1="12" y1="8" x2="12" y2="12"></line>
//                                             <line x1="12" y1="16" x2="12.01" y2="16"></line>
//                                         </svg>
//                                     </div>
//                                     <div className="alert-message">{error}</div>
//                                 </div>
//                             )}

//                             <form onSubmit={handleSignup} style={{ display: success ? 'none' : 'block' }}>
//                                 <div className="form-group">
//                                     <label htmlFor="username">Username</label>
//                                     <div className="input-with-icon">
//                                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
//                                             <circle cx="12" cy="7" r="4"></circle>
//                                         </svg>
//                                         <input
//                                             type="text"
//                                             id="username"
//                                             value={username}
//                                             onChange={(e) => setUsername(e.target.value)}
//                                             placeholder="Choose a username"
//                                             required
//                                             disabled={loading}
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-group">
//                                     <label htmlFor="email">Email Address</label>
//                                     <div className="input-with-icon">
//                                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                             <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
//                                             <polyline points="22,6 12,13 2,6"></polyline>
//                                         </svg>
//                                         <input
//                                             type="email"
//                                             id="email"
//                                             value={email}
//                                             onChange={(e) => setEmail(e.target.value)}
//                                             placeholder="Enter your email"
//                                             required
//                                             disabled={loading}
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-group">
//                                     <label htmlFor="password">Password</label>
//                                     <div className="input-with-icon">
//                                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                             <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
//                                             <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
//                                         </svg>
//                                         <input
//                                             type={showPassword ? "text" : "password"}
//                                             id="password"
//                                             value={password}
//                                             onChange={(e) => setPassword(e.target.value)}
//                                             placeholder="Create a password"
//                                             required
//                                             disabled={loading}
//                                         />
//                                         <button
//                                             type="button"
//                                             className="password-toggle"
//                                             onClick={() => setShowPassword(!showPassword)}
//                                             disabled={loading}
//                                         >
//                                             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                                         </button>
//                                     </div>
//                                 </div>

//                                 <div className="form-group">
//                                     <label htmlFor="confirmPassword">Confirm Password</label>
//                                     <div className="input-with-icon">
//                                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                             <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
//                                             <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
//                                         </svg>
//                                         <input
//                                             type="password"
//                                             id="confirmPassword"
//                                             value={confirmPassword}
//                                             onChange={(e) => setConfirmPassword(e.target.value)}
//                                             placeholder="Confirm your password"
//                                             required
//                                             disabled={loading}
//                                         />
//                                     </div>
//                                 </div>

//                                 <button type="submit" className="signup-button" disabled={loading}>
//                                     {loading ? (
//                                         <>
//                                             <Loader2 className="spinner" size={20} />
//                                             <span>Creating Account...</span>
//                                         </>
//                                     ) : (
//                                         "Sign Up"
//                                     )}
//                                 </button>
//                             </form>

//                             <div className="divider">
//                                 <span>or</span>
//                             </div>

//                             <button 
//                                 type="button" 
//                                 className="google-signup-button"
//                                 onClick={signInWithGoogle}
//                                 disabled={googleLoading}
//                             >
//                                 {googleLoading ? (
//                                     <>
//                                         <Loader2 className="spinner" size={20} />
//                                         <span>Signing Up...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                             <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
//                                             <path d="M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z" fill="#FF3D00"/>
//                                             <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.6055 17.5455 13.3575 18 12 18C9.39902 18 7.19052 16.3415 6.35852 14.027L3.09752 16.5395C4.75252 19.778 8.11352 22 12 22Z" fill="#4CAF50"/>
//                                             <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2555 15.1185 16.536 16.083 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
//                                         </svg>
//                                         <span>Sign up with Google</span>
//                                     </>
//                                 )}
//                             </button>

//                             <div className="login-link">
//                                 Already have an account? <Link to="/login">Log in</Link>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Success overlay */}
//             {success && (
//                 <div className="success-overlay">
//                     <div className="success-card">
//                         <div className="success-icon">
//                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                 <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
//                                 <polyline points="22 4 12 14.01 9 11.01"></polyline>
//                             </svg>
//                         </div>
//                         <h3>Registration Successful!</h3>
//                         <p>Welcome to our community! Redirecting in {redirectTimer} seconds...</p>
//                         <button onClick={handleContinueToLogin} className="continue-button">
//                             Continue to Login
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* Loading overlay */}
//             {(loading || googleLoading) && (
//                 <div className="loading-overlay">
//                     <div className="loading-spinner">
//                         <Loader2 size={48} className="spinner" />
//                         <p>{googleLoading ? "Signing up with Google..." : "Creating your account..."}</p>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default SignupPage;





// import React, { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";
// import { auth, db } from "../firebaseConfig";
// import { Eye, EyeOff, Loader2 } from "lucide-react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "./signup.css";
// import logo from "../assets/images/KETO_WARRIOR.png"; // Adjust path to your logo

// const SignupPage = () => {
//     const [username, setUsername] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState(false);
//     const [redirectTimer, setRedirectTimer] = useState(5);
//     const [loading, setLoading] = useState(false);
//     const [googleLoading, setGoogleLoading] = useState(false);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [verificationSent, setVerificationSent] = useState(false); // New state
//     const navigate = useNavigate();

//     useEffect(() => {
//         let timer;
//         if (verificationSent && redirectTimer > 0) {
//             timer = setTimeout(() => {
//                 setRedirectTimer((prev) => prev - 1);
//             }, 1000);
//         } else if (verificationSent && redirectTimer === 0) {
//             navigate("/login"); // Or a page instructing them to check their email
//         }
//         return () => clearTimeout(timer);
//     }, [verificationSent, navigate, redirectTimer]);

//     const handleSignup = async (e) => {
//         e.preventDefault();
//         setError("");
//         setSuccess(false);
//         setLoading(true);
//         setIsSubmitting(true);
//         setVerificationSent(false); // Reset verification sent state

//         if (!username || !email || !password || !confirmPassword) {
//             setError("Please fill in all fields.");
//             setLoading(false);
//             setIsSubmitting(false);
//             return;
//         }

//         if (password !== confirmPassword) {
//             setError("Passwords do not match.");
//             setLoading(false);
//             setIsSubmitting(false);
//             return;
//         }

//         try {
//             // Simulate network delay for demo purposes (remove in production)
//             await new Promise(resolve => setTimeout(resolve, 1500));

//             const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//             const user = userCredential.user;

//             // Update Firebase Auth profile with the username
//             await updateProfile(user, { displayName: username });

//             // Store additional user data in Firestore
//             await setDoc(doc(db, "users", user.uid), {
//                 uid: user.uid,
//                 username: username,
//                 email: email,
//                 createdAt: new Date(),
//                 authProvider: "email",
//                 emailVerified: false, // Initially set to false
//             });

//             // Create a user profile document
//             await setDoc(doc(db, "userProfiles", user.uid), {
//                 userId: user.uid,
//                 username: username,
//                 email: email,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//             });

//             // Send email verification
//             await sendEmailVerification(user);
//             setVerificationSent(true);
//             setSuccess(true); // Indicate signup success for UI changes
//         } catch (firebaseError) {
//             console.error("Signup Error:", firebaseError.message);
//             let errorMessage = "Signup failed. Please try again.";

//             // More user-friendly error messages
//             switch (firebaseError.code) {
//                 case "auth/email-already-in-use":
//                     errorMessage = "This email is already in use.";
//                     break;
//                 case "auth/invalid-email":
//                     errorMessage = "Please enter a valid email address.";
//                     break;
//                 case "auth/weak-password":
//                     errorMessage = "Password should be at least 6 characters.";
//                     break;
//             }

//             setError(errorMessage);
//         } finally {
//             setLoading(false);
//             setIsSubmitting(false);
//         }
//     };

//     const signInWithGoogle = async () => {
//         setError("");
//         setGoogleLoading(true);
//         setVerificationSent(false); // Reset verification sent state

//         try {
//             const provider = new GoogleAuthProvider();
//             const result = await signInWithPopup(auth, provider);
//             const user = result.user;

//             // Check if user is new or existing
//             const isNewUser = result._tokenResponse.isNewUser;

//             if (isNewUser) {
//                 // Store additional user data in Firestore for new users
//                 await setDoc(doc(db, "users", user.uid), {
//                     uid: user.uid,
//                     username: user.displayName || user.email.split('@')[0],
//                     email: user.email,
//                     createdAt: new Date(),
//                     authProvider: "google",
//                     emailVerified: user.emailVerified, // Google might verify
//                 });

//                 // Create a user profile document
//                 await setDoc(doc(db, "userProfiles", user.uid), {
//                     userId: user.uid,
//                     username: user.displayName || user.email.split('@')[0],
//                     email: user.email,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                 });
//             } else {
//                 // Update the emailVerified status in Firestore if it's true
//                 if (user.emailVerified) {
//                     await setDoc(doc(db, "users", user.uid), { emailVerified: true }, { merge: true });
//                 }
//             }

//             // Redirect to home page after successful signup/login
//             navigate("/");
//         } catch (error) {
//             console.error("Google Signup Error:", error.message);
//             setError("Google signup failed. Please try again.");
//         } finally {
//             setGoogleLoading(false);
//         }
//     };

//     const handleContinueToLogin = () => {
//         navigate("/login");
//     };

//     return (
//         <div className="signup-container">
//             {/* Background with logo */}
//             <div className="signup-background">
//                 <div className="logo-container">
//                     <img src={logo} alt="Company Logo" className="logo" />
//                 </div>
//                 <div className="background-overlay"></div>
//             </div>

//             {/* Main content */}
//             <div className="signup-content">
//                 <div className="signup-card-container">
//                     <div className={`signup-card ${isSubmitting ? 'submitting' : ''}`}>
//                         <div className="card-header">
//                             <h2>Create Your Account</h2>
//                             <p>Join our community today</p>
//                         </div>

//                         <div className="card-body">
//                             {error && (
//                                 <div className="alert alert-danger fade-in">
//                                     <div className="alert-icon">
//                                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                             <circle cx="12" cy="12" r="10"></circle>
//                                             <line x1="12" y1="8" x2="12" y2="12"></line>
//                                             <line x1="12" y1="16" x2="12.01" y2="16"></line>
//                                         </svg>
//                                     </div>
//                                     <div className="alert-message">{error}</div>
//                                 </div>
//                             )}

//                             <form onSubmit={handleSignup} style={{ display: success ? 'none' : 'block' }}>
//                                 <div className="form-group">
//                                     <label htmlFor="username">Username</label>
//                                     <div className="input-with-icon">
//                                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
//                                             <circle cx="12" cy="7" r="4"></circle>
//                                         </svg>
//                                         <input
//                                             type="text"
//                                             id="username"
//                                             value={username}
//                                             onChange={(e) => setUsername(e.target.value)}
//                                             placeholder="Choose a username"
//                                             required
//                                             disabled={loading}
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-group">
//                                     <label htmlFor="email">Email Address</label>
//                                     <div className="input-with-icon">
//                                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                             <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
//                                             <polyline points="22,6 12,13 2,6"></polyline>
//                                         </svg>
//                                         <input
//                                             type="email"
//                                             id="email"
//                                             value={email}
//                                             onChange={(e) => setEmail(e.target.value)}
//                                             placeholder="Enter your email"
//                                             required
//                                             disabled={loading}
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-group">
//                                     <label htmlFor="password">Password</label>
//                                     <div className="input-with-icon">
//                                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                             <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
//                                             <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
//                                         </svg>
//                                         <input
//                                             type={showPassword ? "text" : "password"}
//                                             id="password"
//                                             value={password}
//                                             onChange={(e) => setPassword(e.target.value)}
//                                             placeholder="Create a password"
//                                             required
//                                             disabled={loading}
//                                         />
//                                         <button
//                                             type="button"
//                                             className="password-toggle"
//                                             onClick={() => setShowPassword(!showPassword)}
//                                             disabled={loading}
//                                         >
//                                             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                                         </button>
//                                     </div>
//                                 </div>

//                                 <div className="form-group">
//                                     <label htmlFor="confirmPassword">Confirm Password</label>
//                                     <div className="input-with-icon">
//                                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                             <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
//                                             <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
//                                         </svg>
//                                         <input
//                                             type="password"
//                                             id="confirmPassword"
//                                             value={confirmPassword}
//                                             onChange={(e) => setConfirmPassword(e.target.value)}
//                                             placeholder="Confirm your password"
//                                             required
//                                             disabled={loading}
//                                         />
//                                     </div>
//                                 </div>

//                                 <button type="submit" className="signup-button" disabled={loading}>
//                                     {loading ? (
//                                         <>
//                                             <Loader2 className="spinner" size={20} />
//                                             <span>Creating Account...</span>
//                                         </>
//                                     ) : (
//                                         "Sign Up"
//                                     )}
//                                 </button>
//                             </form>

//                             <div className="divider">
//                                 <span>or</span>
//                             </div>

//                             <button
//                                 type="button"
//                                 className="google-signup-button"
//                                 onClick={signInWithGoogle}
//                                 disabled={googleLoading}
//                             >
//                                 {googleLoading ? (
//                                     <>
//                                         <Loader2 className="spinner" size={20} />
//                                         <span>Signing Up...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                                             <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
//                                             <path d="M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z" fill="#FF3D00"/>
//                                             <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.6055 17.5455 13.3575 18 12 18C9.39902 18 7.19052 16.3415 6.35852 14.027L3.09752 16.5395C4.75252 19.778 8.11352 22 12 22Z" fill="#4CAF50"/>
//                                             <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2555 15.1185 16.536 16.083 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
//                                         </svg>
//                                         <span>Sign up with Google</span>
//                                     </>
//                                 )}
//                             </button>

//                             <div className="login-link">
//                                 Already have an account? <Link to="/login">Log in</Link>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Success overlay (now indicates email sent) */}
//             {success && (
//                 <div className="success-overlay">
//                     <div className="success-card">
//                         <div className="success-icon">
//                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                 <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
//                                 <polyline points="22 4 12 14.01 9 11.01"></polyline>
//                             </svg>
//                         </div>
//                         <h3>Registration Successful!</h3>
//                         <p>A verification email has been sent to your address.</p>
//                         <p>Please check your inbox (and spam folder) and click the link to verify your account.</p>
//                         <p>Redirecting to login in {redirectTimer} seconds...</p>
//                         <button onClick={handleContinueToLogin} className="continue-button">
//                             Continue to Login
//                         </button>
//                     </div>
//                 </div>
//             )}

//             {/* Loading overlay */}
//             {(loading || googleLoading) && (
//                 <div className="loading-overlay">
//                     <div className="loading-spinner">
//                         <Loader2 size={48} className="spinner" />
//                         <p>{googleLoading ? "Signing up with Google..." : "Creating your account..."}</p>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default SignupPage;





import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./signup.css";
import logo from "../assets/images/KETO_WARRIOR.png"; // Adjust path to your logo

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  //const [redirectTimer, setRedirectTimer] = useState(5); // Removed redirectTimer
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false); // New state
  const navigate = useNavigate();

  // useEffect(() => {
  //   let timer;
  //   if (verificationSent && redirectTimer > 0) {
  //     timer = setTimeout(() => {
  //       setRedirectTimer((prev) => prev - 1);
  //     }, 1000);
  //   } else if (verificationSent && redirectTimer === 0) {
  //     navigate("/login"); // Or a page instructing them to check their email
  //   }
  //   return () => clearTimeout(timer);
  // }, [verificationSent, navigate, redirectTimer]); // Removed redirectTimer dependency

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    setIsSubmitting(true);
    setVerificationSent(false); // Reset verification sent state

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate network delay for demo purposes (remove in production)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update Firebase Auth profile with the username
      await updateProfile(user, { displayName: username });

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: username,
        email: email,
        createdAt: new Date(),
        authProvider: "email",
        emailVerified: false, // Initially set to false
      });

      // Create a user profile document
      await setDoc(doc(db, "userProfiles", user.uid), {
        userId: user.uid,
        username: username,
        email: email,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Send email verification
      await sendEmailVerification(user);
      setVerificationSent(true);
      setSuccess(true); // Indicate signup success for UI changes
    } catch (firebaseError) {
      console.error("Signup Error:", firebaseError.message);
      let errorMessage = "Signup failed. Please try again.";

      // More user-friendly error messages
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already in use.";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address.";
          break;
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters.";
          break;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const signInWithGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    setVerificationSent(false); // Reset verification sent state

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user is new or existing
      const isNewUser = result._tokenResponse.isNewUser;

      if (isNewUser) {
        // Store additional user data in Firestore for new users
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          username: user.displayName || user.email.split("@")[0],
          email: user.email,
          createdAt: new Date(),
          authProvider: "google",
          emailVerified: user.emailVerified, // Google might verify
        });

        // Create a user profile document
        await setDoc(doc(db, "userProfiles", user.uid), {
          userId: user.uid,
          username: user.displayName || user.email.split("@")[0],
          email: user.email,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // Update the emailVerified status in Firestore if it's true
        if (user.emailVerified) {
          await setDoc(
            doc(db, "users", user.uid),
            { emailVerified: true },
            { merge: true }
          );
        }
      }

      // Redirect to home page after successful signup/login
      navigate("/");
    } catch (error) {
      console.error("Google Signup Error:", error.message);
      setError("Google signup failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleContinueToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="signup-container">
      {/* Background with logo */}
      <div className="signup-background">
        <div className="logo-container">
          <img src={logo} alt="Company Logo" className="logo" />
        </div>
        <div className="background-overlay"></div>
      </div>

      {/* Main content */}
      <div className="signup-content">
        <div className="signup-card-container">
          <div className={`signup-card ${isSubmitting ? "submitting" : ""}`}>
            <div className="card-header">
              <h2>Create Your Account</h2>
              <p>Join our community today</p>
            </div>

            <div className="card-body">
              {error && (
                <div className="alert alert-danger fade-in">
                  <div className="alert-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <div className="alert-message">{error}</div>
                </div>
              )}

              <form
                onSubmit={handleSignup}
                style={{ display: success ? "none" : "block" }}
              >
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <div className="input-with-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-with-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="input-with-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="input-with-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="signup-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="spinner" size={20} />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>

              <div className="divider">
                <span>or</span>
              </div>

              <button
                type="button"
                className="google-signup-button"
                onClick={signInWithGoogle}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    <span>Signing Up...</span>
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                        fill="#FFC107"
                      />
                      <path
                        d="M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z"
                        fill="#FF3D00"
                      />
                      <path
                        d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.6055 17.5455 13.3575 18 12 18C9.39902 18 7.19052 16.3415 6.35852 14.027L3.09752 16.5395C4.75252 19.778 8.11352 22 12 22Z"
                        fill="#4CAF50"
                      />
                      <path
                        d="M21.8055 10.0415H21V10H12V14H17.6515C17.2555 15.1185 16.536 16.083 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z"
                        fill="#1976D2"
                      />
                    </svg>
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>

              <div className="login-link">
                Already have an account? <Link to="/login">Log in</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success overlay (now with Gmail link and continue button) */}
      {success && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="success-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3>Registration Successful!</h3>
            <p>A verification email has been sent to your address.</p>
            <p>
              Please check your inbox (and spam folder). You can go directly
              to Gmail using the link below:
            </p>
            <p>
              <a
                href="https://mail.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="gmail-link"
              >
                Open Gmail
              </a>
            </p>
            <button onClick={handleContinueToLogin} className="continue-button">
              Continue to Login
            </button>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {(loading || googleLoading) && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <Loader2 size={48} className="spinner" />
            <p>
              {googleLoading ? "Signing up with Google..." : "Creating your account..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;