import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./login.css";
import logo from "../assets/images/KETO_WARRIOR.png";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [redirectTimer, setRedirectTimer] = useState(5);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (success && redirectTimer > 0) {
            timer = setTimeout(() => {
                setRedirectTimer((prev) => prev - 1);
            }, 1000);
        } else if (success && redirectTimer === 0) {
            navigate("/profile");
        }
        return () => clearTimeout(timer);
    }, [success, navigate, redirectTimer]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);
        setIsSubmitting(true);
        setRedirectTimer(5);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;



            const token = await user.getIdToken();
            console.log("Login Token ID:", token); // Log the token ID


            
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                localStorage.setItem("user", JSON.stringify({ uid: user.uid, email: user.email, ...userData }));
            } else {
                localStorage.setItem("user", JSON.stringify({ uid: user.uid, email: user.email }));
            }

            setSuccess(true);
        } catch (firebaseError) {
            console.error("Login Error:", firebaseError.message);
            let errorMessage = "Login failed. Please try again.";

            switch (firebaseError.code) {
                case "auth/user-not-found":
                    errorMessage = "No account found with this email.";
                    break;
                case "auth/wrong-password":
                    errorMessage = "Incorrect password. Please try again.";
                    break;
                case "auth/too-many-requests":
                    errorMessage = "Too many attempts. Please try again later.";
                    break;
                case "auth/invalid-email":
                    errorMessage = "Please enter a valid email address.";
                    break;
                default:
                    errorMessage = "Login failed. Please check your credentials.";
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    const handleContinue = () => {
        navigate("/profile");
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);

            if (!docSnap.exists()) {
              await setDoc(userDocRef, {
                email: user.email,
                displayName: user.displayName,
              });
            }

            localStorage.setItem("user", JSON.stringify({ uid: user.uid, email: user.email, displayName: user.displayName }));
            setSuccess(true);
        } catch (error) {
            console.error("Google Sign-In Error:", error.message);
            setError("Failed to sign in with Google.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="logo-container">
                    <img src={logo} alt="Company Logo" className="logo" />
                </div>
                <div className="background-overlay"></div>
            </div>

            <div className="login-content">
                <div className="login-card-container">
                    <div className={`login-card ${isSubmitting ? 'submitting' : ''}`}>
                        <div className="card-header">
                            <h2>Welcome Back</h2>
                            <p>Sign in to your account</p>
                        </div>

                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger fade-in">
                                    <div className="alert-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                        </svg>
                                    </div>
                                    <div className="alert-message">{error}</div>
                                </div>
                            )}

                            <form onSubmit={handleLogin}>
                                {/* ... (email and password inputs) ... */}
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <div className="input-with-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
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

                                <div className="form-options">
                                    <div className="form-check">
                                        <input type="checkbox" id="remember" className="form-check-input" />
                                        <label htmlFor="remember" className="form-check-label">Remember me</label>
                                    </div>
                                    <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
                                </div>

                                <button type="submit" className="login-button" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="spinner" size={20} />
                                            <span>Signing In...</span>
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </button>
                            </form>

                            <div className="divider">
                                <span>or</span>
                            </div>

                            <div className="social-login">
                                <button type="button" className="social-button google" onClick={handleGoogleSignIn} disabled={loading}>
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107" />
                                        <path d="M3.15302 7.3455L6.43852 9.755C7.32752 7.554 9.48052 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15902 2 4.82802 4.1685 3.15302 7.3455Z" fill="#FF3D00" />
                                        <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.6055 17.5455 13.3575 18 12 18C9.39902 18 7.19052 16.3415 6.35852 14.027L3.09752 16.5395C4.75252 19.778 8.11352 22 12 22Z" fill="#4CAF50" />
                                        <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2555 15.1185 16.536 16.083 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2" />
                                    </svg>
                                    Continue with Google
                                </button>
                            </div>

                            <div className="signup-link">
                                Don't have an account? <Link to="/signup">Sign up</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {success && (
                <div className="success-overlay">
                    <div className="success-card">
                        <div className="success-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h3>Login Successful!</h3>
                        <p>Welcome back! Redirecting in {redirectTimer} seconds...</p>
                        <button onClick={handleContinue} className="continue-button">
                            Continue to Dashboard
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <Loader2 size={48} className="spinner" />
                        <p>Authenticating...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginPage;