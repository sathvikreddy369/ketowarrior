// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { auth, db } from "../firebaseConfig";
// import { Calendar, User, Cake, Ruler, Scale, HeartPulse, ChevronRight, Edit2, Check, X } from "lucide-react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import "./profile.css";

// const ProfilePage = () => {
//     const [userProfile, setUserProfile] = useState(null);
//     const [username, setUsername] = useState("");
//     const [dob, setDob] = useState(null);
//     const [age, setAge] = useState("");
//     const [gender, setGender] = useState("");
//     const [height, setHeight] = useState("");
//     const [weight, setWeight] = useState("");
//     const [bmi, setBmi] = useState("");
//     const [bmiCategory, setBmiCategory] = useState("");
//     const [macrosToTrack, setMacrosToTrack] = useState([]);
//     const [macroTargets, setMacroTargets] = useState({});
//     const [editable, setEditable] = useState(false);
//     const [saving, setSaving] = useState(false);
//     const [showSavedPopup, setShowSavedPopup] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const navigate = useNavigate();

//     const availableMacros = ['calories', 'protein', 'fat', 'carbs'];

//     useEffect(() => {
//         const fetchUserProfile = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);
//                 const currentUser = auth.currentUser;
//                 if (!currentUser) {
//                     navigate("/login");
//                     return;
//                 }
//                 const userId = currentUser.uid;
//                 const userProfileRef = doc(db, "userProfiles", userId);
//                 const docSnap = await getDoc(userProfileRef);

//                 if (docSnap.exists()) {
//                     const profileData = docSnap.data();
//                     setUserProfile(profileData);
//                     setUsername(profileData.username || "");
//                     if (profileData.dob) {
//                         const initialDob = new Date(profileData.dob);
//                         setDob(initialDob);
//                         calculateAge(initialDob);
//                     }
//                     setGender(profileData.gender || "");
//                     setHeight(profileData.height || "");
//                     setWeight(profileData.weight || "");
//                     setMacrosToTrack(Array.isArray(profileData.macrosToTrack) ? profileData.macrosToTrack : []);

//                     const initialMacroTargets = {};
//                     availableMacros.forEach(macro => {
//                         initialMacroTargets[macro] = profileData?.macroTargets?.[macro] || 0;
//                     });
//                     setMacroTargets(profileData?.macroTargets || initialMacroTargets);
//                 } else {
//                     setError("Profile data not found");
//                 }
//             } catch (err) {
//                 console.error("Error fetching user profile:", err);
//                 setError("Failed to load profile");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchUserProfile();
//     }, [navigate]);

//     const calculateAge = (date) => {
//         if (date) {
//             const today = new Date();
//             let calculatedAge = today.getFullYear() - date.getFullYear();
//             const monthDiff = today.getMonth() - date.getMonth();
//             if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
//                 calculatedAge--;
//             }
//             setAge(calculatedAge >= 0 ? calculatedAge : "");
//         } else {
//             setAge("");
//         }
//     };

//     const handleDobChange = (date) => {
//         setDob(date);
//         calculateAge(date);
//     };

//     useEffect(() => {
//         if (height && weight) {
//             const heightInMeters = parseFloat(height) / 100;
//             const weightValue = parseFloat(weight);
//             if (heightInMeters > 0 && weightValue > 0) {
//                 const calculatedBmi = (weightValue / (heightInMeters * heightInMeters)).toFixed(1);
//                 setBmi(calculatedBmi);

//                 if (calculatedBmi < 18.5) {
//                     setBmiCategory("Underweight");
//                 } else if (calculatedBmi >= 18.5 && calculatedBmi < 25) {
//                     setBmiCategory("Normal weight");
//                 } else if (calculatedBmi >= 25 && calculatedBmi < 30) {
//                     setBmiCategory("Overweight");
//                 } else {
//                     setBmiCategory("Obese");
//                 }
//             } else {
//                 setBmi("");
//                 setBmiCategory("");
//             }
//         } else {
//             setBmi("");
//             setBmiCategory("");
//         }
//     }, [height, weight]);

//     const handleAddMacro = (macro) => {
//         if (!macrosToTrack.includes(macro)) {
//             setMacrosToTrack([...macrosToTrack, macro]);
//             setMacroTargets(prev => ({
//                 ...prev,
//                 [macro]: 0
//             }));
//         }
//     };

//     const handleRemoveMacro = (macro) => {
//         setMacrosToTrack(macrosToTrack.filter(m => m !== macro));
//         const newTargets = { ...macroTargets };
//         delete newTargets[macro];
//         setMacroTargets(newTargets);
//     };

//     const handleMacroTargetChange = (macro, value) => {
//         setMacroTargets(prev => ({
//             ...prev,
//             [macro]: Math.max(0, parseFloat(value) || 0)
//         }));
//     };

//     const handleUpdate = async (e) => {
//         e.preventDefault();
//         setSaving(true);
//         setError(null);
//         try {
//             const currentUser = auth.currentUser;
//             if (!currentUser) {
//                 navigate("/login");
//                 return;
//             }
//             const userId = currentUser.uid;
//             const userProfileRef = doc(db, "userProfiles", userId);
//             const dobString = dob ? dob.toISOString() : null;

//             await updateDoc(userProfileRef, {
//                 username,
//                 dob: dobString,
//                 gender,
//                 height: parseFloat(height) || null,
//                 weight: parseFloat(weight) || null,
//                 macrosToTrack,
//                 macroTargets,
//                 updatedAt: new Date(),
//             });

//             setSaving(false);
//             setEditable(false);
//             setShowSavedPopup(true);
//             setTimeout(() => setShowSavedPopup(false), 3000);

//             const docSnap = await getDoc(userProfileRef);
//             if (docSnap.exists()) {
//                 setUserProfile(docSnap.data());
//             }
//         } catch (err) {
//             console.error("Profile update error:", err);
//             setError("Failed to save profile");
//             setSaving(false);
//         }
//     };

//     const handleCancel = () => {
//         setEditable(false);
//         setUsername(userProfile?.username || "");
//         setDob(userProfile?.dob ? new Date(userProfile.dob) : null);
//         setGender(userProfile?.gender || "");
//         setHeight(userProfile?.height || "");
//         setWeight(userProfile?.weight || "");
//         setMacrosToTrack(userProfile?.macrosToTrack || []);
//         setMacroTargets(userProfile?.macroTargets || {});
//         setError(null);
//     };

//     if (loading) {
//         return (
//             <div className="profile-loading">
//                 <div className="spinner"></div>
//                 <p>Loading your profile...</p>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="profile-error">
//                 <div className="error-card">
//                     <div className="error-icon">!</div>
//                     <h3>Error Loading Profile</h3>
//                     <p>{error}</p>
//                     <button className="retry-button" onClick={() => window.location.reload()}>
//                         Try Again
//                     </button>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="profile-container">
//             <div className="profile-header">
//                 <div className="profile-avatar">
//                     <div className="avatar-circle">
//                         <User size={32} />
//                     </div>
//                 </div>
//                 <div className="profile-info">
//                     <h1 className="profile-username">{username}</h1>
//                     <p className="profile-subtitle">Nutrition Tracker Profile</p>
//                 </div>
//             </div>

//             <div className="profile-card">
//                 <div className="profile-card-header">
//                     <h2>Personal Information</h2>
//                     {!editable ? (
//                         <button className="edit-button" onClick={() => setEditable(true)}>
//                             <Edit2 size={18} className="me-2" />
//                             Edit Profile
//                         </button>
//                     ) : (
//                         <div className="edit-actions">
//                             <button className="cancel-button" onClick={handleCancel} disabled={saving}>
//                                 <X size={18} className="me-2" />
//                                 Cancel
//                             </button>
//                             <button className="save-button" onClick={handleUpdate} disabled={saving}>
//                                 {saving ? (
//                                     <>
//                                         <span className="spinner"></span>
//                                         Saving...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Check size={18} className="me-2" />
//                                         Save Changes
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     )}
//                 </div>

//                 <div className="profile-form">
//                     <div className="form-grid">
//                         <div className="form-group">
//                             <label className="form-label">
//                                 <Cake size={20} className="icon" />
//                                 Date of Birth
//                             </label>
//                             <DatePicker
//                                 selected={dob}
//                                 onChange={handleDobChange}
//                                 dateFormat="MMMM d, yyyy"
//                                 className="form-control"
//                                 showMonthDropdown
//                                 showYearDropdown
//                                 dropdownMode="select"
//                                 placeholderText="Select date"
//                                 disabled={!editable}
//                                 wrapperClassName="date-picker-wrapper"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 <Cake size={20} className="icon" />
//                                 Age
//                             </label>
//                             <div className="form-value">{age || "-"}</div>
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 <User size={20} className="icon" />
//                                 Gender
//                             </label>
//                             <select
//                                 className="form-control"
//                                 value={gender}
//                                 onChange={(e) => setGender(e.target.value)}
//                                 disabled={!editable}
//                             >
//                                 <option value="">Select Gender</option>
//                                 <option value="male">Male</option>
//                                 <option value="female">Female</option>
//                                 <option value="other">Other</option>
//                                 <option value="prefer-not-to-say">Prefer not to say</option>
//                             </select>
//                         </div>
//                     </div>

//                     <div className="form-grid">
//                         <div className="form-group">
//                             <label className="form-label">
//                                 <Ruler size={20} className="icon" />
//                                 Height (cm)
//                             </label>
//                             <input
//                                 type="number"
//                                 className="form-control"
//                                 value={height}
//                                 onChange={(e) => setHeight(e.target.value)}
//                                 disabled={!editable}
//                                 min="100"
//                                 max="250"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label className="form-label">
//                                 <Scale size={20} className="icon" />
//                                 Weight (kg)
//                             </label>
//                             <input
//                                 type="number"
//                                 className="form-control"
//                                 value={weight}
//                                 onChange={(e) => setWeight(e.target.value)}
//                                 disabled={!editable}
//                                 min="30"
//                                 max="300"
//                             />
//                         </div>
//                     </div>

//                     <div className="bmi-section">
//                         <div className="bmi-card">
//                             <div className="bmi-header">
//                                 <HeartPulse size={20} className="icon" />
//                                 <h3>BMI</h3>
//                             </div>
//                             <div className="bmi-content">
//                                 {bmi ? (
//                                     <>
//                                         <div className="bmi-value">{bmi}</div>
//                                         <div className={`bmi-category ${bmiCategory.toLowerCase().replace(' ', '-')}`}>
//                                             {bmiCategory}
//                                         </div>
//                                     </>
//                                 ) : (
//                                     <div className="bmi-empty">Enter height and weight to calculate BMI</div>
//                                 )}
//                             </div>
//                         </div>
//                         <div className="bmi-info">
//                             <p>BMI (Body Mass Index) is a measure of body fat based on height and weight.</p>
//                             <ul className="bmi-ranges">
//                                 <li><span className="underweight"></span> Underweight: &lt;18.5</li>
//                                 <li><span className="normal"></span> Normal: 18.5-24.9</li>
//                                 <li><span className="overweight"></span> Overweight: 25-29.9</li>
//                                 <li><span className="obese"></span> Obese: ≥30</li>
//                             </ul>
//                         </div>
//                     </div>

//                     <div className="macros-section">
//                         <div className="section-header">
//                             <ChevronRight size={20} className="icon" />
//                             <h3>Nutrition Tracking Preferences</h3>
//                         </div>
                        
//                         <div className="macros-selection">
//                             <h4>Macros to Track</h4>
//                             <div className="macros-options">
//                                 {availableMacros.map(macro => (
//                                     <div key={macro} className="macro-option">
//                                         <input
//                                             type="checkbox"
//                                             id={`macro-${macro}`}
//                                             checked={macrosToTrack.includes(macro)}
//                                             onChange={(e) => e.target.checked
//                                                 ? handleAddMacro(macro)
//                                                 : handleRemoveMacro(macro)}
//                                             disabled={!editable}
//                                         />
//                                         <label htmlFor={`macro-${macro}`} className="macro-label">
//                                             <span className="macro-checkbox"></span>
//                                             <span className="macro-name">{macro.charAt(0).toUpperCase() + macro.slice(1)}</span>
//                                         </label>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {macrosToTrack.length > 0 && (
//                             <div className="macro-targets">
//                                 <h4>Daily Macro Targets</h4>
//                                 <div className="targets-grid">
//                                     {macrosToTrack.map(macro => (
//                                         <div key={macro} className="target-item">
//                                             <label htmlFor={`target-${macro}`} className="target-label">
//                                                 {macro.charAt(0).toUpperCase() + macro.slice(1)}
//                                             </label>
//                                             <div className="target-input-container">
//                                                 <input
//                                                     type="number"
//                                                     id={`target-${macro}`}
//                                                     className="target-input"
//                                                     value={macroTargets[macro] || 0}
//                                                     onChange={(e) => handleMacroTargetChange(macro, e.target.value)}
//                                                     min="0"
//                                                     step={macro === 'calories' ? '10' : '1'}
//                                                     disabled={!editable}
//                                                 />
//                                                 <span className="target-unit">
//                                                     {macro === 'calories' ? 'kcal' : 'g'}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {showSavedPopup && (
//                 <div className="profile-saved-popup">
//                     <div className="popup-card">
//                         <div className="popup-icon success">
//                             <Check size={32} />
//                         </div>
//                         <h3>Profile Updated</h3>
//                         <p>Your changes have been saved successfully</p>
//                         <button
//                             className="popup-button"
//                             onClick={() => setShowSavedPopup(false)}
//                         >
//                             Continue
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ProfilePage;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { 
  Calendar, User, Cake, Ruler, Scale, HeartPulse, 
  ChevronRight, Edit2, Check, X, AlertTriangle,
  Plus, Minus, Activity, Droplet, Zap, Utensils
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./profile.css";


const ProfilePage = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [username, setUsername] = useState("");
    const [dob, setDob] = useState(null);
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [bmi, setBmi] = useState("");
    const [bmiCategory, setBmiCategory] = useState("");
    const [macrosToTrack, setMacrosToTrack] = useState([]);
    const [macroTargets, setMacroTargets] = useState({});
    const [allergies, setAllergies] = useState([]);
    const [intolerances, setIntolerances] = useState([]);
    const [medicalConditions, setMedicalConditions] = useState([]);
    const [dietaryPreferences, setDietaryPreferences] = useState([]);
    const [newHealthItem, setNewHealthItem] = useState({
        allergy: "",
        intolerance: "",
        condition: "",
        preference: ""
    });
    const [editable, setEditable] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showSavedPopup, setShowSavedPopup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const availableMacros = ['calories', 'protein', 'fat', 'carbs'];
    const healthSuggestions = {
        allergens: ['Dairy', 'Eggs', 'Tree nuts', 'Peanuts', 'Shellfish', 'Wheat', 'Soy', 'Fish', 'Sesame', 'Mustard'],
        intolerances: ['Lactose', 'Gluten', 'Fructose', 'Histamine', 'Caffeine', 'Alcohol', 'Sulfites', 'FODMAPs'],
        conditions: ['Diabetes', 'High blood pressure', 'Heart disease', 'Celiac disease', 
                    'Irritable bowel syndrome (IBS)', 'Crohn\'s disease', 'Ulcerative colitis', 
                    'GERD', 'Kidney disease', 'Thyroid disorder'],
        preferences: ['Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-free', 'Dairy-free', 
                     'Keto', 'Paleo', 'Mediterranean', 'Low-carb', 'Low-sodium', 'Halal', 'Kosher']
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    navigate("/login");
                    return;
                }
                const userId = currentUser.uid;
                const userProfileRef = doc(db, "userProfiles", userId);
                const docSnap = await getDoc(userProfileRef);

                if (docSnap.exists()) {
                    const profileData = docSnap.data();
                    setUserProfile(profileData);
                    setUsername(profileData.username || "");
                    if (profileData.dob) {
                        const initialDob = new Date(profileData.dob);
                        setDob(initialDob);
                        calculateAge(initialDob);
                    }
                    setGender(profileData.gender || "");
                    setHeight(profileData.height || "");
                    setWeight(profileData.weight || "");
                    setMacrosToTrack(Array.isArray(profileData.macrosToTrack) ? profileData.macrosToTrack : []);
                    setAllergies(Array.isArray(profileData.allergies) ? profileData.allergies : []);
                    setIntolerances(Array.isArray(profileData.intolerances) ? profileData.intolerances : []);
                    setMedicalConditions(Array.isArray(profileData.medicalConditions) ? profileData.medicalConditions : []);
                    setDietaryPreferences(Array.isArray(profileData.dietaryPreferences) ? profileData.dietaryPreferences : []);

                    const initialMacroTargets = {};
                    availableMacros.forEach(macro => {
                        initialMacroTargets[macro] = profileData?.macroTargets?.[macro] || 0;
                    });
                    setMacroTargets(profileData?.macroTargets || initialMacroTargets);
                } else {
                    setError("Profile data not found");
                }
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const calculateAge = (date) => {
        if (date) {
            const today = new Date();
            let calculatedAge = today.getFullYear() - date.getFullYear();
            const monthDiff = today.getMonth() - date.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
                calculatedAge--;
            }
            setAge(calculatedAge >= 0 ? calculatedAge : "");
        } else {
            setAge("");
        }
    };

    const handleDobChange = (date) => {
        setDob(date);
        calculateAge(date);
    };

    useEffect(() => {
        if (height && weight) {
            const heightInMeters = parseFloat(height) / 100;
            const weightValue = parseFloat(weight);
            if (heightInMeters > 0 && weightValue > 0) {
                const calculatedBmi = (weightValue / (heightInMeters * heightInMeters)).toFixed(1);
                setBmi(calculatedBmi);

                if (calculatedBmi < 18.5) {
                    setBmiCategory("Underweight");
                } else if (calculatedBmi >= 18.5 && calculatedBmi < 25) {
                    setBmiCategory("Normal weight");
                } else if (calculatedBmi >= 25 && calculatedBmi < 30) {
                    setBmiCategory("Overweight");
                } else {
                    setBmiCategory("Obese");
                }
            } else {
                setBmi("");
                setBmiCategory("");
            }
        } else {
            setBmi("");
            setBmiCategory("");
        }
    }, [height, weight]);

    const handleAddMacro = (macro) => {
        if (!macrosToTrack.includes(macro)) {
            setMacrosToTrack([...macrosToTrack, macro]);
            setMacroTargets(prev => ({
                ...prev,
                [macro]: 0
            }));
        }
    };

    const handleRemoveMacro = (macro) => {
        setMacrosToTrack(macrosToTrack.filter(m => m !== macro));
        const newTargets = { ...macroTargets };
        delete newTargets[macro];
        setMacroTargets(newTargets);
    };

    const handleMacroTargetChange = (macro, value) => {
        setMacroTargets(prev => ({
            ...prev,
            [macro]: Math.max(0, parseFloat(value) || 0)
        }));
    };

    const handleAddHealthItem = (field) => {
        if (newHealthItem[field].trim() === '') return;
        
        const setterMap = {
            allergy: setAllergies,
            intolerance: setIntolerances,
            condition: setMedicalConditions,
            preference: setDietaryPreferences
        };

        setterMap[field](prev => [...prev, newHealthItem[field]]);
        setNewHealthItem(prev => ({ ...prev, [field]: '' }));
    };

    const handleRemoveHealthItem = (field, index) => {
        const setterMap = {
            allergy: setAllergies,
            intolerance: setIntolerances,
            condition: setMedicalConditions,
            preference: setDietaryPreferences
        };

        setterMap[field](prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                navigate("/login");
                return;
            }
            const userId = currentUser.uid;
            const userProfileRef = doc(db, "userProfiles", userId);
            const dobString = dob ? dob.toISOString() : null;

            await updateDoc(userProfileRef, {
                username,
                dob: dobString,
                gender,
                height: parseFloat(height) || null,
                weight: parseFloat(weight) || null,
                macrosToTrack,
                macroTargets,
                allergies,
                intolerances,
                medicalConditions,
                dietaryPreferences,
                updatedAt: new Date(),
            });

            setSaving(false);
            setEditable(false);
            setShowSavedPopup(true);
            setTimeout(() => setShowSavedPopup(false), 3000);

            const docSnap = await getDoc(userProfileRef);
            if (docSnap.exists()) {
                setUserProfile(docSnap.data());
            }
        } catch (err) {
            console.error("Profile update error:", err);
            setError("Failed to save profile");
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditable(false);
        setUsername(userProfile?.username || "");
        setDob(userProfile?.dob ? new Date(userProfile.dob) : null);
        setGender(userProfile?.gender || "");
        setHeight(userProfile?.height || "");
        setWeight(userProfile?.weight || "");
        setMacrosToTrack(userProfile?.macrosToTrack || []);
        setMacroTargets(userProfile?.macroTargets || {});
        setAllergies(userProfile?.allergies || []);
        setIntolerances(userProfile?.intolerances || []);
        setMedicalConditions(userProfile?.medicalConditions || []);
        setDietaryPreferences(userProfile?.dietaryPreferences || []);
        setError(null);
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-error">
                <div className="error-card">
                    <div className="error-icon">
                        <AlertTriangle size={32} />
                    </div>
                    <h3>Error Loading Profile</h3>
                    <p>{error}</p>
                    <button className="retry-button" onClick={() => window.location.reload()}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    <div className="avatar-circle">
                        <User size={32} />
                    </div>
                </div>
                <div className="profile-info">
                    <h1 className="profile-username">{username}</h1>
                    <p className="profile-subtitle">Nutrition & Health Profile</p>
                </div>
            </div>

            <div className="profile-card">
                <div className="profile-card-header">
                    <h2>Personal Information</h2>
                    {!editable ? (
                        <button className="edit-button" onClick={() => setEditable(true)}>
                            <Edit2 size={18} className="me-2" />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button className="cancel-button" onClick={handleCancel} disabled={saving}>
                                <X size={18} className="me-2" />
                                Cancel
                            </button>
                            <button className="save-button" onClick={handleUpdate} disabled={saving}>
                                {saving ? (
                                    <>
                                        <span className="spinner"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check size={18} className="me-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <form className="profile-form" onSubmit={handleUpdate}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">
                                <Cake size={20} className="icon" />
                                Date of Birth
                            </label>
                            <DatePicker
                                selected={dob}
                                onChange={handleDobChange}
                                dateFormat="MMMM d, yyyy"
                                className="form-control"
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                placeholderText="Select date"
                                disabled={!editable}
                                wrapperClassName="date-picker-wrapper"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Cake size={20} className="icon" />
                                Age
                            </label>
                            <div className="form-value">{age || "-"}</div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <User size={20} className="icon" />
                                Gender
                            </label>
                            <select
                                className="form-control"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                disabled={!editable}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">
                                <Ruler size={20} className="icon" />
                                Height (cm)
                            </label>
                            <input
                                type="number"
                                className="form-control"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                disabled={!editable}
                                min="100"
                                max="250"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Scale size={20} className="icon" />
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                className="form-control"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                disabled={!editable}
                                min="30"
                                max="300"
                            />
                        </div>
                    </div>

                    <div className="bmi-section">
                        <div className="bmi-card">
                            <div className="bmi-header">
                                <HeartPulse size={20} className="icon" />
                                <h3>BMI</h3>
                            </div>
                            <div className="bmi-content">
                                {bmi ? (
                                    <>
                                        <div className="bmi-value">{bmi}</div>
                                        {/* <div className={`bmi-category ${bmiCategory.toLowerCase().replace(' ', '-')}`}> */}
                                        <div className={`bmi-category ${bmiCategory.toLowerCase().split(' ')[0]}`}>
                                            {bmiCategory}
                                        </div>
                                    </>
                                ) : (
                                    <div className="bmi-empty">Enter height and weight to calculate BMI</div>
                                )}
                            </div>
                        </div>
                        <div className="bmi-info">
                            <p>BMI (Body Mass Index) is a measure of body fat based on height and weight.</p>
                            <ul className="bmi-ranges">
                                <li><span className="underweight"></span> Underweight: &lt;18.5</li>
                                <li><span className="normal"></span> Normal: 18.5-24.9</li>
                                <li><span className="overweight"></span> Overweight: 25-29.9</li>
                                <li><span className="obese"></span> Obese: ≥30</li>
                            </ul>
                        </div>
                    </div>

                    {/* Health Information Section */}
                    <div className="health-section">
                        <div className="section-header">
                            <ChevronRight size={20} className="icon" />
                            <h3>Health Information</h3>
                        </div>

                        {/* Allergies */}
                        <div className="health-group">
                            <label className="health-label">
                                <AlertTriangle size={18} className="icon" />
                                Food Allergies
                            </label>
                            <div className="health-tags">
                                {allergies.map((allergy, index) => (
                                    <span key={index} className="health-tag">
                                        {allergy}
                                        {editable && (
                                            <button 
                                                type="button"
                                                className="remove-tag"
                                                onClick={() => handleRemoveHealthItem('allergy', index)}
                                            >
                                                <Minus size={14} />
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {editable && (
                                    <div className="health-input-container">
                                        <input
                                            type="text"
                                            value={newHealthItem.allergy}
                                            onChange={(e) => setNewHealthItem({...newHealthItem, allergy: e.target.value})}
                                            placeholder="Add allergy"
                                            list="allergy-suggestions"
                                            className="health-input"
                                        />
                                        <datalist id="allergy-suggestions">
                                            {healthSuggestions.allergens.map((item, i) => (
                                                <option key={i} value={item} />
                                            ))}
                                        </datalist>
                                        <button 
                                            type="button"
                                            className="add-tag-button"
                                            onClick={() => handleAddHealthItem('allergy')}
                                            disabled={!newHealthItem.allergy.trim()}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Intolerances */}
                        <div className="health-group">
                            <label className="health-label">
                                <AlertTriangle size={18} className="icon" />
                                Food Intolerances
                            </label>
                            <div className="health-tags">
                                {intolerances.map((intolerance, index) => (
                                    <span key={index} className="health-tag">
                                        {intolerance}
                                        {editable && (
                                            <button 
                                                type="button"
                                                className="remove-tag"
                                                onClick={() => handleRemoveHealthItem('intolerance', index)}
                                            >
                                                <Minus size={14} />
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {editable && (
                                    <div className="health-input-container">
                                        <input
                                            type="text"
                                            value={newHealthItem.intolerance}
                                            onChange={(e) => setNewHealthItem({...newHealthItem, intolerance: e.target.value})}
                                            placeholder="Add intolerance"
                                            list="intolerance-suggestions"
                                            className="health-input"
                                        />
                                        <datalist id="intolerance-suggestions">
                                            {healthSuggestions.intolerances.map((item, i) => (
                                                <option key={i} value={item} />
                                            ))}
                                        </datalist>
                                        <button 
                                            type="button"
                                            className="add-tag-button"
                                            onClick={() => handleAddHealthItem('intolerance')}
                                            disabled={!newHealthItem.intolerance.trim()}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Medical Conditions */}
                        <div className="health-group">
                            <label className="health-label">
                                <HeartPulse size={18} className="icon" />
                                Medical Conditions
                            </label>
                            <div className="health-tags">
                                {medicalConditions.map((condition, index) => (
                                    <span key={index} className="health-tag">
                                        {condition}
                                        {editable && (
                                            <button 
                                                type="button"
                                                className="remove-tag"
                                                onClick={() => handleRemoveHealthItem('condition', index)}
                                            >
                                                <Minus size={14} />
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {editable && (
                                    <div className="health-input-container">
                                        <input
                                            type="text"
                                            value={newHealthItem.condition}
                                            onChange={(e) => setNewHealthItem({...newHealthItem, condition: e.target.value})}
                                            placeholder="Add condition"
                                            list="condition-suggestions"
                                            className="health-input"
                                        />
                                        <datalist id="condition-suggestions">
                                            {healthSuggestions.conditions.map((item, i) => (
                                                <option key={i} value={item} />
                                            ))}
                                        </datalist>
                                        <button 
                                            type="button"
                                            className="add-tag-button"
                                            onClick={() => handleAddHealthItem('condition')}
                                            disabled={!newHealthItem.condition.trim()}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Dietary Preferences */}
                        <div className="health-group">
                            <label className="health-label">
                                <Utensils size={18} className="icon" />
                                Dietary Preferences
                            </label>
                            <div className="health-tags">
                                {dietaryPreferences.map((preference, index) => (
                                    <span key={index} className="health-tag">
                                        {preference}
                                        {editable && (
                                            <button 
                                                type="button"
                                                className="remove-tag"
                                                onClick={() => handleRemoveHealthItem('preference', index)}
                                            >
                                                <Minus size={14} />
                                            </button>
                                        )}
                                    </span>
                                ))}
                                {editable && (
                                    <div className="health-input-container">
                                        <input
                                            type="text"
                                            value={newHealthItem.preference}
                                            onChange={(e) => setNewHealthItem({...newHealthItem, preference: e.target.value})}
                                            placeholder="Add preference"
                                            list="preference-suggestions"
                                            className="health-input"
                                        />
                                        <datalist id="preference-suggestions">
                                            {healthSuggestions.preferences.map((item, i) => (
                                                <option key={i} value={item} />
                                            ))}
                                        </datalist>
                                        <button 
                                            type="button"
                                            className="add-tag-button"
                                            onClick={() => handleAddHealthItem('preference')}
                                            disabled={!newHealthItem.preference.trim()}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Nutrition Tracking Preferences */}
                    <div className="macros-section">
                        <div className="section-header">
                            <ChevronRight size={20} className="icon" />
                            <h3>Nutrition Tracking Preferences</h3>
                        </div>
                        
                        <div className="macros-selection">
                            <h4>Macros to Track</h4>
                            <div className="macros-options">
                                {availableMacros.map(macro => (
                                    <div key={macro} className="macro-option">
                                        <input
                                            type="checkbox"
                                            id={`macro-${macro}`}
                                            checked={macrosToTrack.includes(macro)}
                                            onChange={(e) => e.target.checked
                                                ? handleAddMacro(macro)
                                                : handleRemoveMacro(macro)}
                                            disabled={!editable}
                                        />
                                        <label htmlFor={`macro-${macro}`} className="macro-label">
                                            <span className="macro-icon">
                                                {macro === 'calories' && <Zap size={16} />}
                                                {macro === 'protein' && <Activity size={16} />}
                                                {macro === 'fat' && <Droplet size={16} />}
                                                {macro === 'carbs' && <Utensils size={16} />}
                                            </span>
                                            <span className="macro-name">{macro.charAt(0).toUpperCase() + macro.slice(1)}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {macrosToTrack.length > 0 && (
                            <div className="macro-targets">
                                <h4>Daily Macro Targets</h4>
                                <div className="targets-grid">
                                    {macrosToTrack.map(macro => (
                                        <div key={macro} className="target-item">
                                            <label htmlFor={`target-${macro}`} className="target-label">
                                                <span className="macro-icon">
                                                    {macro === 'calories' && <Zap size={16} />}
                                                    {macro === 'protein' && <Activity size={16} />}
                                                    {macro === 'fat' && <Droplet size={16} />}
                                                    {macro === 'carbs' && <Utensils size={16} />}
                                                </span>
                                                {macro.charAt(0).toUpperCase() + macro.slice(1)}
                                            </label>
                                            <div className="target-input-container">
                                                <input
                                                    type="number"
                                                    id={`target-${macro}`}
                                                    className="target-input"
                                                    value={macroTargets[macro] || 0}
                                                    onChange={(e) => handleMacroTargetChange(macro, e.target.value)}
                                                    min="0"
                                                    step={macro === 'calories' ? '10' : '1'}
                                                    disabled={!editable}
                                                />
                                                <span className="target-unit">
                                                    {macro === 'calories' ? 'kcal' : 'g'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {showSavedPopup && (
                <div className="profile-saved-popup">
                    <div className="popup-card">
                        <div className="popup-icon success">
                            <Check size={32} />
                        </div>
                        <h3>Profile Updated</h3>
                        <p>Your changes have been saved successfully</p>
                        <button
                            className="popup-button"
                            onClick={() => setShowSavedPopup(false)}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;