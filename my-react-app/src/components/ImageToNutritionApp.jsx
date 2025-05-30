import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Loader2, UploadCloud, CheckCircle, AlertTriangle, Plus, Camera } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';
import './ImageToNutritionApp.css'; // Updated CSS filename

const ImageToNutritionApp = () => {
    const [image, setImage] = useState(null);
    const [nutritionInfo, setNutritionInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAddingToTotals, setIsAddingToTotals] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [mealName, setMealName] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);

    const BACKEND_URL = 'http://localhost:5000';// 'https://testb1-fauo.onrender.com' || 

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Invalid file type. Please upload an image.');
                setImage(null);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('File size too large. Please upload an image smaller than 5MB.');
                setImage(null);
                return;
            }
            setImage(file);
            setError(null);
            setNutritionInfo(null);
            setSuccessMessage(null);
            setCameraActive(false);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
        }
    }, [stream]);

    const handleStartCamera = useCallback(async () => {
        try {
            setCameraActive(true);
            setError(null);
            setImage(null);
            
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Camera error:', err);
            setError('Could not access camera. Please check permissions and try again.');
            setCameraActive(false);
        }
    }, []);

    const handleCapture = useCallback(() => {
        if (!videoRef.current) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
            const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
            setImage(file);
            setCameraActive(false);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
        }, 'image/jpeg', 0.9);
    }, [stream]);

    const handleSubmit = useCallback(async () => {
        if (!image) {
            setError('Please select an image to analyze.');
            return;
        }

        setLoading(true);
        setError(null);
        setNutritionInfo(null);
        setSuccessMessage(null);

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await fetch(`${BACKEND_URL}/api/images/analyze-image`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = 'An error occurred while analyzing the image.';
                try {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    } else {
                        const errorText = await response.text();
                        errorMessage = errorText || 'Failed to analyze the image.';
                    }
                } catch (parseError) {
                    console.error('Error parsing error response', parseError);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            if (data?.error) {
                setError(data.error);
                setNutritionInfo(null);
            } else {
                setNutritionInfo(data);
            }
        } catch (error) {
            setError(error.message || 'An unexpected error occurred.');
            setNutritionInfo(null);
        } finally {
            setLoading(false);
        }
    }, [image]);

    const handleAddToTotals = useCallback(async () => {
        if (!nutritionInfo?.name) {
            setError('No food item recognized to add to totals.');
            return;
        }
        if (!currentUser) {
            setError('Please log in to add to your totals.');
            return;
        }

        setIsAddingToTotals(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const token = await currentUser.getIdToken();

            const foodItem = {
                foodId: uuidv4(),
                name: nutritionInfo.name,
                calories: parseFloat(nutritionInfo.calories) || 0,
                protein: parseFloat(nutritionInfo.protein) || 0,
                fat: parseFloat(nutritionInfo.fat) || 0,
                carbs: parseFloat(nutritionInfo.carbohydrates) || 0,
                source: 'image-analysis',
                quantity: parseFloat(nutritionInfo.quantity) || 1,
                unit: nutritionInfo.unit?.toLowerCase() || 'count',
            };

            const response = await fetch(`${BACKEND_URL}/api/daily-totals/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    mealName: mealName.trim() || 'Snack',
                    foodItem: foodItem,
                    date: new Date().toISOString().split('T')[0],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add to totals.');
            }

            setSuccessMessage(`${foodItem.name} added to ${mealName || 'Snack'}!`);
            setNutritionInfo(null);
            setImage(null);
            setMealName('');
        } catch (error) {
            console.error('Error adding to totals:', error);
            setError(error.message);
        } finally {
            setIsAddingToTotals(false);
        }
    }, [currentUser, nutritionInfo, mealName]);

    return (
        <div className="nutri-app">
            <div className="nutri-container">
                <header className="nutri-header">
                    <h1 className="nutri-title">
                        <span className="nutri-gradient-text">Food Nutrition Analyzer</span>
                    </h1>
                    <p className="nutri-subtitle">Snap or upload a food photo to get nutritional information</p>
                    <p className="nutri-subtitle">for more info about ingredients, intolerances or allergies, we recommend using our chatbot</p>
                </header>

                <div className="nutri-upload-section">
                    <h2 className="nutri-section-title">Capture Food Image</h2>
                    
                    <div className="nutri-image-options">
                        <div className="nutri-option-card" onClick={handleStartCamera}>
                            <div className="nutri-option-icon nutri-camera-icon">
                                <Camera size={32} />
                            </div>
                            <h3>Take Photo</h3>
                        </div>
                        
                        <label htmlFor="nutri-file-upload" className="nutri-option-card">
                            <div className="nutri-option-icon nutri-upload-icon">
                                <UploadCloud size={32} />
                            </div>
                            <h3>Upload Image</h3>
                            <input 
                                id="nutri-file-upload" 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="nutri-hidden-input" 
                            />
                        </label>
                    </div>

                    {cameraActive && (
                        <div className="nutri-camera-container">
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="nutri-camera-feed"
                            ></video>
                            <button 
                                onClick={handleCapture} 
                                className="nutri-capture-button"
                            >
                                Capture Image
                            </button>
                        </div>
                    )}

                    {image && !cameraActive && (
                        <div className="nutri-image-preview-container">
                            <h3 className="nutri-preview-title">Selected Image:</h3>
                            <div className="nutri-image-preview-wrapper">
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt="Uploaded Food"
                                    className="nutri-food-image"
                                />
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className={`nutri-analyze-button ${loading ? 'nutri-loading' : ''}`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="nutri-spinner" />
                                        Analyzing...
                                    </>
                                ) : 'Analyze Nutrition'}
                            </button>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="nutri-status-container nutri-loading">
                        <Loader2 className="nutri-spinner nutri-large" />
                        <p>Analyzing your food image...</p>
                    </div>
                )}

                {error && (
                    <div className="nutri-status-container nutri-error">
                        <AlertTriangle className="nutri-status-icon" />
                        <h3>Error</h3>
                        <p>{error}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="nutri-status-container nutri-success">
                        <CheckCircle className="nutri-status-icon" />
                        <h3>Success!</h3>
                        <p>{successMessage}</p>
                    </div>
                )}

                {nutritionInfo && !error && (
                    <div className="nutri-results">
                        <div className="nutri-results-header">
                            <CheckCircle className="nutri-success-icon" />
                            <h2>Nutrition Information</h2>
                        </div>
                        
                        {nutritionInfo.name ? (
                            <div className="nutri-food-details">
                                <div className="nutri-food-header">
                                    <h3 className="nutri-food-name">{nutritionInfo.name}</h3>
                                    {nutritionInfo.volume && (
                                        <span className="nutri-food-volume">{nutritionInfo.volume}</span>
                                    )}
                                </div>
                                
                                <div className="nutri-nutrition-grid">
                                    <div className="nutri-nutrition-item nutri-calories">
                                        <span className="nutri-nutrition-value">{nutritionInfo.calories || 'N/A'}</span>
                                        <span className="nutri-nutrition-label">Calories</span>
                                    </div>
                                    <div className="nutri-nutrition-item nutri-protein">
                                        <span className="nutri-nutrition-value">{nutritionInfo.protein || 'N/A'}g</span>
                                        <span className="nutri-nutrition-label">Protein</span>
                                    </div>
                                    <div className="nutri-nutrition-item nutri-fat">
                                        <span className="nutri-nutrition-value">{nutritionInfo.fat || 'N/A'}g</span>
                                        <span className="nutri-nutrition-label">Fat</span>
                                    </div>
                                    <div className="nutri-nutrition-item nutri-carbs">
                                        <span className="nutri-nutrition-value">{nutritionInfo.carbohydrates || 'N/A'}g</span>
                                        <span className="nutri-nutrition-label">Carbs</span>
                                    </div>
                                    {nutritionInfo.sugars && (
                                        <div className="nutri-nutrition-item nutri-sugars">
                                            <span className="nutri-nutrition-value">{nutritionInfo.sugars}g</span>
                                            <span className="nutri-nutrition-label">Sugars</span>
                                        </div>
                                    )}
                                </div>
                                
                                {currentUser && (
                                    <div className="nutri-add-to-totals">
                                        <div className="nutri-meal-name-input">
                                            <label htmlFor="nutri-meal-name">Meal Name (Optional):</label>
                                            <input
                                                type="text"
                                                id="nutri-meal-name"
                                                value={mealName}
                                                onChange={(e) => setMealName(e.target.value)}
                                                placeholder="e.g., Breakfast, Lunch"
                                            />
                                        </div>
                                        <button
                                            onClick={handleAddToTotals}
                                            disabled={isAddingToTotals}
                                            className={`nutri-add-button ${isAddingToTotals ? 'nutri-loading' : ''}`}
                                        >
                                            {isAddingToTotals ? (
                                                <>
                                                    <Loader2 className="nutri-spinner" />
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="nutri-icon" />
                                                    Add to Daily Totals
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                                
                                {!currentUser && (
                                    <p className="nutri-login-prompt">
                                        Please log in to add this to your daily totals.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="nutri-no-items">No food items recognized in the image.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageToNutritionApp;



// import React, { useState, useCallback, useEffect, useRef } from 'react';
// import { Loader2, UploadCloud, CheckCircle, AlertTriangle, Plus, Camera } from 'lucide-react';
// import { getAuth } from 'firebase/auth';
// import { v4 as uuidv4 } from 'uuid';
// import './ImageToNutritionApp.css'; // Your CSS filename

// const ImageToNutritionApp = () => {
//     const [image, setImage] = useState(null);
//     const [nutritionInfo, setNutritionInfo] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [isAddingToTotals, setIsAddingToTotals] = useState(false);
//     const [currentUser, setCurrentUser] = useState(null);
//     const [successMessage, setSuccessMessage] = useState(null);
//     const [mealName, setMealName] = useState('');
//     const [cameraActive, setCameraActive] = useState(false);
//     const videoRef = useRef(null);
//     const [stream, setStream] = useState(null);

//     // --- IMPORTANT CHANGE HERE ---
//     // This is your Node.js backend URL, handling daily totals and possibly other user-related data.
//     const BACKEND_URL = 'http://localhost:5000';
//     // This is your Python model server URL, which should be running on port 5001.
//     const MODEL_API_URL = 'http://localhost:5001';

//     // Effect to listen for Firebase Auth state changes
//     useEffect(() => {
//         const auth = getAuth();
//         const unsubscribe = auth.onAuthStateChanged((user) => {
//             setCurrentUser(user);
//         });
//         return () => unsubscribe(); // Cleanup subscription on unmount
//     }, []);

//     // Effect to stop camera stream when component unmounts or stream changes
//     useEffect(() => {
//         return () => {
//             if (stream) {
//                 stream.getTracks().forEach(track => track.stop());
//             }
//         };
//     }, [stream]);

//     // Handles file selection from the file input
//     const handleFileChange = useCallback((e) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             if (!file.type.startsWith('image/')) {
//                 setError('Invalid file type. Please upload an image.');
//                 setImage(null);
//                 return;
//             }
//             if (file.size > 5 * 1024 * 1024) { // 5MB limit
//                 setError('File size too large. Please upload an image smaller than 5MB.');
//                 setImage(null);
//                 return;
//             }
//             setImage(file);
//             setError(null);
//             setNutritionInfo(null);
//             setSuccessMessage(null);
//             setCameraActive(false); // Deactivate camera if a file is selected
//             if (stream) { // Stop camera stream if active
//                 stream.getTracks().forEach(track => track.stop());
//                 setStream(null);
//             }
//         }
//     }, [stream]);

//     // Activates the device camera
//     const handleStartCamera = useCallback(async () => {
//         try {
//             setCameraActive(true);
//             setError(null);
//             setImage(null); // Clear any previously selected image
//             setNutritionInfo(null);
//             setSuccessMessage(null);

//             const mediaStream = await navigator.mediaDevices.getUserMedia({
//                 video: { facingMode: 'environment' }, // Prefer rear camera on mobile
//                 audio: false
//             });

//             setStream(mediaStream);
//             if (videoRef.current) {
//                 videoRef.current.srcObject = mediaStream;
//             }
//         } catch (err) {
//             console.error('Camera error:', err);
//             setError('Could not access camera. Please check permissions and try again.');
//             setCameraActive(false);
//         }
//     }, []);

//     // Captures a photo from the active camera feed
//     const handleCapture = useCallback(() => {
//         if (!videoRef.current) return;

//         const canvas = document.createElement('canvas');
//         canvas.width = videoRef.current.videoWidth;
//         canvas.height = videoRef.current.videoHeight;
//         const ctx = canvas.getContext('2d');
//         ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

//         canvas.toBlob((blob) => {
//             const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
//             setImage(file);
//             setCameraActive(false); // Deactivate camera after capture
//             if (stream) { // Stop camera stream after capture
//                 stream.getTracks().forEach(track => track.stop());
//                 setStream(null);
//             }
//         }, 'image/jpeg', 0.9); // Quality 0.9
//     }, [stream]);

//     // Sends the selected/captured image to the backend for analysis
//     const handleSubmit = useCallback(async () => {
//         if (!image) {
//             setError('Please select an image to analyze.');
//             return;
//         }

//         setLoading(true);
//         setError(null);
//         setNutritionInfo(null);
//         setSuccessMessage(null);

//         const formData = new FormData();
//         formData.append('image', image);

//         try {
//             // --- IMPORTANT CHANGE HERE ---
//             // Send the image to your model server on port 5001 for analysis
//             const response = await fetch(`${MODEL_API_URL}/api/images/analyze-image`, {
//                 method: 'POST',
//                 body: formData,
//             });

//             if (!response.ok) {
//                 let errorMessage = 'An error occurred while analyzing the image.';
//                 try {
//                     const errorData = await response.json();
//                     if (errorData.error) {
//                         errorMessage = errorData.error;
//                     } else {
//                         const errorText = await response.text();
//                         errorMessage = errorText || 'Failed to analyze the image.';
//                     }
//                 } catch (parseError) {
//                     console.error('Error parsing error response', parseError);
//                     errorMessage = 'Failed to analyze the image (server response not JSON).';
//                 }
//                 throw new Error(errorMessage);
//             }

//             const data = await response.json();
//             if (data?.error) {
//                 setError(data.error);
//                 setNutritionInfo(null);
//             } else {
//                 setNutritionInfo(data);
//             }
//         } catch (error) {
//             setError(error.message || 'An unexpected error occurred.');
//             setNutritionInfo(null);
//         } finally {
//             setLoading(false);
//         }
//     }, [image]);

//     // Adds the recognized nutrition data to the user's daily totals
//     const handleAddToTotals = useCallback(async () => {
//         if (!nutritionInfo?.name) {
//             setError('No food item recognized to add to totals.');
//             return;
//         }
//         if (!currentUser) {
//             setError('Please log in to add to your totals.');
//             return;
//         }

//         setIsAddingToTotals(true);
//         setError(null);
//         setSuccessMessage(null);

//         try {
//             const token = await currentUser.getIdToken();

//             // Ensure numerical fields are parsed correctly, defaulting to 0 if N/A or missing
//             const parseFloatOrZero = (value) => {
//                 const parsed = parseFloat(value);
//                 return isNaN(parsed) ? 0 : parsed;
//             };

//             // --- IMPORTANT CHANGE HERE ---
//             // Only include calories, protein, fat, and carbs for the daily totals
//             const foodItem = {
//                 foodId: uuidv4(), // Unique ID for this specific record
//                 name: nutritionInfo.name,
//                 calories: parseFloatOrZero(nutritionInfo.calories),
//                 protein: parseFloatOrZero(nutritionInfo.protein),
//                 fat: parseFloatOrZero(nutritionInfo.fat),
//                 carbs: parseFloatOrZero(nutritionInfo.carbohydrates), // Using 'carbohydrates' as per frontend expectation
//                 // You can add more fields back here if your backend `daily-totals/add` endpoint
//                 // expects them, but based on the request, I'm limiting to these four.
//                 source: 'image-analysis',
//                 quantity: parseFloatOrZero(nutritionInfo.quantity), // Still send quantity and unit if available
//                 unit: nutritionInfo.unit?.toLowerCase() || 'serving',
//             };

//             // --- IMPORTANT CHANGE HERE ---
//             // Send the daily totals request to your Node.js backend on port 5000
//             const response = await fetch(`${BACKEND_URL}/api/daily-totals/add`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${token}`, // Send Firebase ID token for authentication
//                 },
//                 body: JSON.stringify({
//                     userId: currentUser.uid,
//                     mealName: mealName.trim() || 'Snack', // Use entered meal name or default to 'Snack'
//                     foodItem: foodItem,
//                     date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
//                 }),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error || 'Failed to add to totals.');
//             }

//             setSuccessMessage(`${foodItem.name} added to ${mealName || 'Snack'}!`);
//             setNutritionInfo(null); // Clear displayed nutrition info
//             setImage(null); // Clear selected image
//             setMealName(''); // Reset meal name input
//         } catch (error) {
//             console.error('Error adding to totals:', error);
//             setError(error.message);
//         } finally {
//             setIsAddingToTotals(false);
//         }
//     }, [currentUser, nutritionInfo, mealName]);

//     // Helper function to render a nutrition item if its value is valid
//     const renderNutritionItem = (value, label, unit = '') => {
//         if (value === null || value === undefined || value === 'N/A' || (typeof value === 'number' && isNaN(value))) {
//             return null; // Don't render if value is not available
//         }
//         let displayValue = typeof value === 'number' ? value.toFixed(2) : value; // Format numbers to 2 decimal places
//         if (displayValue === '0.00' && unit === 'g') displayValue = '0'; // Clean up 0.00g to 0g
//         return (
//             <div className="nutri-nutrition-item">
//                 <span className="nutri-nutrition-value">{displayValue}{unit}</span>
//                 <span className="nutri-nutrition-label">{label}</span>
//             </div>
//         );
//     };

//     return (
//         <div className="nutri-app">
//             <div className="nutri-container">
//                 <header className="nutri-header">
//                     <h1 className="nutri-title">
//                         <span className="nutri-gradient-text">Food Nutrition Analyzer</span>
//                     </h1>
//                     <p className="nutri-subtitle">Snap or upload a food photo to get nutritional information</p>
//                     <p className="nutri-subtitle">For more info about ingredients, intolerances or allergies, we recommend using our chatbot.</p>
//                 </header>

//                 <div className="nutri-upload-section">
//                     <h2 className="nutri-section-title">Capture Food Image</h2>

//                     <div className="nutri-image-options">
//                         {/* Take Photo Option */}
//                         <div className="nutri-option-card" onClick={handleStartCamera}>
//                             <div className="nutri-option-icon nutri-camera-icon">
//                                 <Camera size={32} />
//                             </div>
//                             <h3>Take Photo</h3>
//                         </div>

//                         {/* Upload Image Option */}
//                         <label htmlFor="nutri-file-upload" className="nutri-option-card">
//                             <div className="nutri-option-icon nutri-upload-icon">
//                                 <UploadCloud size={32} />
//                             </div>
//                             <h3>Upload Image</h3>
//                             <input
//                                 id="nutri-file-upload"
//                                 type="file"
//                                 accept="image/*"
//                                 onChange={handleFileChange}
//                                 className="nutri-hidden-input"
//                             />
//                         </label>
//                     </div>

//                     {/* Camera Feed and Capture Button */}
//                     {cameraActive && (
//                         <div className="nutri-camera-container">
//                             <video
//                                 ref={videoRef}
//                                 autoPlay
//                                 playsInline
//                                 className="nutri-camera-feed"
//                             ></video>
//                             <button
//                                 onClick={handleCapture}
//                                 className="nutri-capture-button"
//                             >
//                                 Capture Image
//                             </button>
//                         </div>
//                     )}

//                     {/* Image Preview and Analyze Button */}
//                     {image && !cameraActive && (
//                         <div className="nutri-image-preview-container">
//                             <h3 className="nutri-preview-title">Selected Image:</h3>
//                             <div className="nutri-image-preview-wrapper">
//                                 <img
//                                     src={URL.createObjectURL(image)}
//                                     alt="Uploaded Food"
//                                     className="nutri-food-image"
//                                 />
//                             </div>
//                             <button
//                                 onClick={handleSubmit}
//                                 disabled={loading}
//                                 className={`nutri-analyze-button ${loading ? 'nutri-loading' : ''}`}
//                             >
//                                 {loading ? (
//                                     <>
//                                         <Loader2 className="nutri-spinner" />
//                                         Analyzing...
//                                     </>
//                                 ) : 'Analyze Nutrition'}
//                             </button>
//                         </div>
//                     )}
//                 </div>

//                 {/* Status Messages */}
//                 {loading && (
//                     <div className="nutri-status-container nutri-loading">
//                         <Loader2 className="nutri-spinner nutri-large" />
//                         <p>Analyzing your food image...</p>
//                     </div>
//                 )}

//                 {error && (
//                     <div className="nutri-status-container nutri-error">
//                         <AlertTriangle className="nutri-status-icon" />
//                         <h3>Error</h3>
//                         <p>{error}</p>
//                     </div>
//                 )}

//                 {successMessage && (
//                     <div className="nutri-status-container nutri-success">
//                         <CheckCircle className="nutri-status-icon" />
//                         <h3>Success!</h3>
//                         <p>{successMessage}</p>
//                     </div>
//                 )}

//                 {/* Nutrition Results Display */}
//                 {nutritionInfo && !error && (
//                     <div className="nutri-results">
//                         <div className="nutri-results-header">
//                             <CheckCircle className="nutri-success-icon" />
//                             <h2>Nutrition Information</h2>
//                         </div>

//                         {nutritionInfo.name ? (
//                             <div className="nutri-food-details">
//                                 <div className="nutri-food-header">
//                                     <h3 className="nutri-food-name">{nutritionInfo.name}</h3>
//                                     {/* Display quantity and unit if available */}
//                                     {(nutritionInfo.quantity !== null && nutritionInfo.quantity !== undefined) &&
//                                        (nutritionInfo.unit !== null && nutritionInfo.unit !== undefined) && (
//                                             <span className="nutri-food-volume">
//                                                 {nutritionInfo.quantity} {nutritionInfo.unit}
//                                             </span>
//                                         )}
//                                 </div>

//                                 <div className="nutri-nutrition-grid">
//                                     {renderNutritionItem(nutritionInfo.calories, 'Calories')}
//                                     {renderNutritionItem(nutritionInfo.protein, 'Protein', 'g')}
//                                     {renderNutritionItem(nutritionInfo.fat, 'Fat', 'g')}
//                                     {renderNutritionItem(nutritionInfo.carbohydrates, 'Carbs', 'g')}
//                                     {/* Add other fields here as needed, using renderNutritionItem */}
//                                     {renderNutritionItem(nutritionInfo.sugars, 'Sugars', 'g')}
//                                     {renderNutritionItem(nutritionInfo.fiber, 'Fiber', 'g')}
//                                     {renderNutritionItem(nutritionInfo.cholesterol, 'Cholesterol', 'mg')}
//                                     {renderNutritionItem(nutritionInfo.sodium, 'Sodium', 'mg')}
//                                     {renderNutritionItem(nutritionInfo.saturated_fat, 'Sat. Fat', 'g')}
//                                     {renderNutritionItem(nutritionInfo.monounsaturated_fatty_acids, 'MUFAs', 'g')}
//                                     {renderNutritionItem(nutritionInfo.polyunsaturated_fatty_acids, 'PUFAs', 'g')}
//                                     {renderNutritionItem(nutritionInfo.vitamin_a, 'Vit. A', ' IU')}
//                                     {renderNutritionItem(nutritionInfo.vitamin_c, 'Vit. C', 'mg')}
//                                     {renderNutritionItem(nutritionInfo.vitamin_d, 'Vit. D', 'mcg')}
//                                     {renderNutritionItem(nutritionInfo.vitamin_e, 'Vit. E', 'mg')}
//                                     {renderNutritionItem(nutritionInfo.vitamin_k, 'Vit. K', 'mcg')}
//                                     {renderNutritionItem(nutritionInfo.calcium, 'Calcium', 'mg')}
//                                     {renderNutritionItem(nutritionInfo.iron, 'Iron', 'mg')}
//                                     {renderNutritionItem(nutritionInfo.magnesium, 'Magnesium', 'mg')}
//                                     {renderNutritionItem(nutritionInfo.potassium, 'Potassium', 'mg')}
//                                 </div>

//                                 {/* Add to Daily Totals Section */}
//                                 {currentUser && (
//                                     <div className="nutri-add-to-totals">
//                                         <div className="nutri-meal-name-input">
//                                             <label htmlFor="nutri-meal-name">Meal Name (Optional):</label>
//                                             <input
//                                                 type="text"
//                                                 id="nutri-meal-name"
//                                                 value={mealName}
//                                                 onChange={(e) => setMealName(e.target.value)}
//                                                 placeholder="e.g., Breakfast, Lunch"
//                                             />
//                                         </div>
//                                         <button
//                                             onClick={handleAddToTotals}
//                                             disabled={isAddingToTotals}
//                                             className={`nutri-add-button ${isAddingToTotals ? 'nutri-loading' : ''}`}
//                                         >
//                                             {isAddingToTotals ? (
//                                                 <>
//                                                     <Loader2 className="nutri-spinner" />
//                                                     Adding...
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <Plus className="nutri-icon" />
//                                                     Add to Daily Totals
//                                                 </>
//                                             )}
//                                         </button>
//                                     </div>
//                                 )}

//                                 {!currentUser && (
//                                     <p className="nutri-login-prompt">
//                                         Please log in to add this to your daily totals.
//                                     </p>
//                                 )}
//                             </div>
//                         ) : (
//                             <p className="nutri-no-items">No food items recognized in the image.</p>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ImageToNutritionApp;