// //username working
// import React, { useState, useEffect } from 'react';
// import { auth } from '../firebaseConfig';
// import { updatePassword, sendEmailVerification } from 'firebase/auth';
// import { useNavigate } from 'react-router-dom';
// import { Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './settings.css';

// const SettingsPage = () => {
//     const [username, setUsername] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmNewPassword, setConfirmNewPassword] = useState('');
//     const [oldPassword, setOldPassword] = useState('');
//     const [isEditingUsername, setIsEditingUsername] = useState(false);
//     const [showNewPassword, setShowNewPassword] = useState(false);
//     const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
//     const [usernameUpdateError, setUsernameUpdateError] = useState('');
//     const [usernameUpdateSuccess, setUsernameUpdateSuccess] = useState('');
//     const [passwordUpdateError, setPasswordUpdateError] = useState('');
//     const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState('');
//     const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
//     const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
//     const [authLoading, setAuthLoading] = useState(true);
//     const [profileError, setProfileError] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const unsubscribe = auth.onAuthStateChanged(async (user) => {
//             if (user) {
//                 setUsername(user.displayName || '');
//                 setAuthLoading(false);
//             } else {
//                 navigate('/login');
//                 setAuthLoading(false);
//             }
//         });

//         return () => unsubscribe();
//     }, [navigate]);

//     const handleUpdateUsername = async () => {
//         if (!username) {
//             setUsernameUpdateError('Username is required.');
//             return;
//         }

//         setIsUpdatingUsername(true);
//         try {
//             const token = await auth.currentUser.getIdToken();
//             const response = await fetch('http://localhost:5000/api/auth/profile', {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({ username }),
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to update username.');
//             }

//             setUsernameUpdateSuccess('Username updated successfully!');
//             setIsEditingUsername(false);
//         } catch (error) {
//             setUsernameUpdateError(error.message || 'An error occurred.');
//         } finally {
//             setIsUpdatingUsername(false);
//         }
//     };

//     const handleUpdatePassword = async () => {
//         if (!oldPassword || !newPassword || !confirmNewPassword) {
//             setPasswordUpdateError('All password fields are required.');
//             return;
//         }

//         if (newPassword !== confirmNewPassword) {
//             setPasswordUpdateError('Passwords do not match.');
//             return;
//         }

//         setIsUpdatingPassword(true);
//         try {
//             // Firebase doesn't provide a way to verify old passwords in the backend.
//             // Use a custom backend API to verify old passwords if needed.
//             await updatePassword(auth.currentUser, newPassword);
//             setPasswordUpdateSuccess('Password updated successfully!');
//             setOldPassword('');
//             setNewPassword('');
//             setConfirmNewPassword('');
//         } catch (error) {
//             setPasswordUpdateError(error.message || 'An error occurred.');
//         } finally {
//             setIsUpdatingPassword(false);
//         }
//     };

//     if (authLoading) return <div>Loading...</div>;
//     if (profileError) return <div>Error: {profileError}</div>;

//     return (
//         <div className="settings-container">
//             <h2>Account Settings</h2>

//             {/* Username Section */}
//             <div className="setting-section">
//                 <h3>Update Username</h3>
//                 <div className="form-group">
//                     <label htmlFor="username">Username</label>
//                     <input
//                         type="text"
//                         id="username"
//                         className="form-control"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         disabled={!isEditingUsername}
//                     />
//                 </div>
//                 {isEditingUsername ? (
//                     <>
//                         <button
//                             className="btn btn-success"
//                             onClick={handleUpdateUsername}
//                             disabled={isUpdatingUsername}
//                         >
//                             {isUpdatingUsername ? <Loader2 className="spinner" size={18} /> : 'Save'}
//                         </button>
//                         <button
//                             className="btn btn-secondary"
//                             onClick={() => setIsEditingUsername(false)}
//                         >
//                             Cancel
//                         </button>
//                     </>
//                 ) : (
//                     <button
//                         className="btn btn-primary"
//                         onClick={() => setIsEditingUsername(true)}
//                     >
//                         Edit
//                     </button>
//                 )}
//                 {usernameUpdateError && <div className="alert alert-danger">{usernameUpdateError}</div>}
//                 {usernameUpdateSuccess && <div className="alert alert-success">{usernameUpdateSuccess}</div>}
//             </div>

//             {/* Password Section */}
//             <div className="setting-section">
//                 <h3>Update Password</h3>
//                 <div className="form-group">
//                     <label htmlFor="oldPassword">Old Password</label>
//                     <input
//                         type="password"
//                         id="oldPassword"
//                         className="form-control"
//                         value={oldPassword}
//                         onChange={(e) => setOldPassword(e.target.value)}
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="newPassword">New Password</label>
//                     <input
//                         type={showNewPassword ? 'text' : 'password'}
//                         id="newPassword"
//                         className="form-control"
//                         value={newPassword}
//                         onChange={(e) => setNewPassword(e.target.value)}
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="confirmNewPassword">Confirm New Password</label>
//                     <input
//                         type={showConfirmNewPassword ? 'text' : 'password'}
//                         id="confirmNewPassword"
//                         className="form-control"
//                         value={confirmNewPassword}
//                         onChange={(e) => setConfirmNewPassword(e.target.value)}
//                     />
//                 </div>
//                 <button
//                     className="btn btn-warning"
//                     onClick={handleUpdatePassword}
//                     disabled={isUpdatingPassword}
//                 >
//                     {isUpdatingPassword ? <Loader2 className="spinner" size={18} /> : 'Update Password'}
//                 </button>
//                 {passwordUpdateError && <div className="alert alert-danger">{passwordUpdateError}</div>}
//                 {passwordUpdateSuccess && <div className="alert alert-success">{passwordUpdateSuccess}</div>}
//             </div>
//         </div>
//     );
// };

// export default SettingsPage;








// //username,password both working
// import React, { useState, useEffect } from 'react';
// import { auth, reauthenticateWithCredential, EmailAuthProvider } from '../firebaseConfig';
// import { updatePassword, sendEmailVerification } from 'firebase/auth';
// import { useNavigate } from 'react-router-dom';
// import { Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './settings.css';

// const SettingsPage = () => {
//     const [username, setUsername] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmNewPassword, setConfirmNewPassword] = useState('');
//     const [oldPassword, setOldPassword] = useState('');
//     const [isEditingUsername, setIsEditingUsername] = useState(false);
//     const [showNewPassword, setShowNewPassword] = useState(false);
//     const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
//     const [usernameUpdateError, setUsernameUpdateError] = useState('');
//     const [usernameUpdateSuccess, setUsernameUpdateSuccess] = useState('');
//     const [passwordUpdateError, setPasswordUpdateError] = useState('');
//     const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState('');
//     const [oldPasswordError, setOldPasswordError] = useState('');
//     const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
//     const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
//     const [isReauthenticating, setIsReauthenticating] = useState(false);
//     const [authLoading, setAuthLoading] = useState(true);
//     const [profileError, setProfileError] = useState(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const unsubscribe = auth.onAuthStateChanged(async (user) => {
//             if (user) {
//                 setUsername(user.displayName || '');
//                 setAuthLoading(false);
//             } else {
//                 navigate('/login');
//                 setAuthLoading(false);
//             }
//         });

//         return () => unsubscribe();
//     }, [navigate]);

//     const handleUpdateUsername = async () => {
//         if (!username) {
//             setUsernameUpdateError('Username is required.');
//             return;
//         }

//         setIsUpdatingUsername(true);
//         setUsernameUpdateError('');
//         setUsernameUpdateSuccess('');
//         try {
//             const token = await auth.currentUser.getIdToken();
//             const response = await fetch('http://localhost:5000/api/auth/profile', {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({ username }),
//             });

//             const data = await response.json();

//             if (!response.ok) {
//                 throw new Error(data.message || 'Failed to update username.');
//             }

//             setUsernameUpdateSuccess(data.message || 'Username updated successfully!');
//             setIsEditingUsername(false);
//         } catch (error) {
//             setUsernameUpdateError(error.message || 'An error occurred.');
//         } finally {
//             setIsUpdatingUsername(false);
//         }
//     };

//     const handleUpdatePassword = async () => {
//         if (!oldPassword) {
//             setOldPasswordError("Old password is required.");
//             return;
//         }
//         if (!newPassword || !confirmNewPassword) {
//             setPasswordUpdateError('New password and confirmation are required.');
//             return;
//         }
//         if (newPassword !== confirmNewPassword) {
//             setPasswordUpdateError('Passwords do not match.');
//             return;
//         }

//         setIsReauthenticating(true);
//         setOldPasswordError('');
//         setPasswordUpdateError('');
//         setPasswordUpdateSuccess('');

//         const user = auth.currentUser;
//         const credential = EmailAuthProvider.credential(user.email, oldPassword);

//         try {
//             await reauthenticateWithCredential(user, credential);
//             console.log('User re-authenticated successfully.');
//             setIsReauthenticating(false);

//             setIsUpdatingPassword(true);
//             try {
//                 const token = await user.getIdToken();
//                 const response = await fetch("http://localhost:5000/api/auth/password", {
//                     method: "PUT",
//                     headers: {
//                         "Content-Type": "application/json",
//                         "Authorization": `Bearer ${token}`
//                     },
//                     body: JSON.stringify({ newPassword })
//                 });

//                 const data = await response.json();

//                 if (!response.ok) {
//                     throw new Error(data.message || "Failed to update password on the server.");
//                 }

//                 setPasswordUpdateSuccess(data.message || "Password updated successfully!");
//                 setOldPassword('');
//                 setNewPassword('');
//                 setConfirmNewPassword('');
//             } catch (error) {
//                 console.error("Error updating password on server:", error);
//                 setPasswordUpdateError(error.message || "An error occurred while updating password.");
//             } finally {
//                 setIsUpdatingPassword(false);
//             }

//         } catch (error) {
//             console.error('Error re-authenticating:', error);
//             setOldPasswordError(error.message || 'Incorrect old password.');
//             setIsReauthenticating(false);
//         }
//     };

//     if (authLoading) return <div>Loading...</div>;
//     if (profileError) return <div>Error: {profileError}</div>;

//     return (
//         <div className="settings-container">
//             <h2>Account Settings</h2>

//             {/* Username Section */}
//             <div className="setting-section">
//                 <h3>Update Username</h3>
//                 <div className="form-group">
//                     <label htmlFor="username">Username</label>
//                     <input
//                         type="text"
//                         id="username"
//                         className="form-control"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         disabled={!isEditingUsername}
//                     />
//                 </div>
//                 {isEditingUsername ? (
//                     <>
//                         <button
//                             className="btn btn-success"
//                             onClick={handleUpdateUsername}
//                             disabled={isUpdatingUsername}
//                         >
//                             {isUpdatingUsername ? <Loader2 className="spinner" size={18} /> : 'Save'}
//                         </button>
//                         <button
//                             className="btn btn-secondary"
//                             onClick={() => setIsEditingUsername(false)}
//                         >
//                             Cancel
//                         </button>
//                     </>
//                 ) : (
//                     <button
//                         className="btn btn-primary"
//                         onClick={() => setIsEditingUsername(true)}
//                     >
//                         Edit
//                     </button>
//                 )}
//                 {usernameUpdateError && <div className="alert alert-danger">{usernameUpdateError}</div>}
//                 {usernameUpdateSuccess && <div className="alert alert-success">{usernameUpdateSuccess}</div>}
//             </div>

//             {/* Password Section */}
//             <div className="setting-section">
//                 <h3>Update Password</h3>
//                 <div className="form-group">
//                     <label htmlFor="oldPassword">Old Password</label>
//                     <input
//                         type="password"
//                         id="oldPassword"
//                         className="form-control"
//                         value={oldPassword}
//                         onChange={(e) => setOldPassword(e.target.value)}
//                     />
//                     {oldPasswordError && <div className="alert alert-danger">{oldPasswordError}</div>}
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="newPassword">New Password</label>
//                     <input
//                         type={showNewPassword ? 'text' : 'password'}
//                         id="newPassword"
//                         className="form-control"
//                         value={newPassword}
//                         onChange={(e) => setNewPassword(e.target.value)}
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="confirmNewPassword">Confirm New Password</label>
//                     <input
//                         type={showConfirmNewPassword ? 'text' : 'password'}
//                         id="confirmNewPassword"
//                         className="form-control"
//                         value={confirmNewPassword}
//                         onChange={(e) => setConfirmNewPassword(e.target.value)}
//                     />
//                 </div>
//                 <button
//                     className="btn btn-warning"
//                     onClick={handleUpdatePassword}
//                     disabled={isUpdatingPassword || isReauthenticating}
//                 >
//                     {isReauthenticating
//                         ? <><Loader2 className="spinner" size={18} /> Verifying...</>
//                         : isUpdatingPassword
//                             ? <><Loader2 className="spinner" size={18} /> Updating...</>
//                             : 'Update Password'}
//                 </button>
//                 {passwordUpdateError && <div className="alert alert-danger">{passwordUpdateError}</div>}
//                 {passwordUpdateSuccess && <div className="alert alert-success">{passwordUpdateSuccess}</div>}
//             </div>
//         </div>
//     );
// };

// export default SettingsPage;



// //perfect
// import React, { useState, useEffect } from 'react';
// import { auth, reauthenticateWithCredential, EmailAuthProvider } from '../firebaseConfig';
// import { updatePassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
// import { useNavigate } from 'react-router-dom';
// import { Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './settings.css';
// //import './forgotpassword.css'; // Import the forgot password styles

// const SettingsPage = () => {
//     const [username, setUsername] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmNewPassword, setConfirmNewPassword] = useState('');
//     const [oldPassword, setOldPassword] = useState('');
//     const [isEditingUsername, setIsEditingUsername] = useState(false);
//     const [showNewPassword, setShowNewPassword] = useState(false);
//     const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
//     const [showOldPassword, setShowOldPassword] = useState(false); // New state for old password visibility
//     const [usernameUpdateError, setUsernameUpdateError] = useState('');
//     const [usernameUpdateSuccess, setUsernameUpdateSuccess] = useState('');
//     const [passwordUpdateError, setPasswordUpdateError] = useState('');
//     const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState('');
//     const [oldPasswordError, setOldPasswordError] = useState('');
//     const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
//     const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
//     const [isReauthenticating, setIsReauthenticating] = useState(false);
//     const [authLoading, setAuthLoading] = useState(true);
//     const [profileError, setProfileError] = useState(null);
//     const navigate = useNavigate();

//     // Forgot Password Popup State and Functions
//     const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
//     const [resetEmail, setResetEmail] = useState('');
//     const [resetError, setResetError] = useState('');
//     const [resetSuccess, setResetSuccess] = useState('');
//     const [resetLoading, setResetLoading] = useState(false);

//     useEffect(() => {
//         const unsubscribe = auth.onAuthStateChanged(async (user) => {
//             if (user) {
//                 setUsername(user.displayName || '');
//                 setAuthLoading(false);
//             } else {
//                 navigate('/login');
//                 setAuthLoading(false);
//             }
//         });

//         return () => unsubscribe();
//     }, [navigate]);

//     const handleUpdateUsername = async () => {
//         if (!username) {
//             setUsernameUpdateError('Username is required.');
//             return;
//         }

//         setIsUpdatingUsername(true);
//         setUsernameUpdateError('');
//         setUsernameUpdateSuccess('');
//         try {
//             const token = await auth.currentUser.getIdToken();
//             const response = await fetch('http://localhost:5000/api/auth/profile', {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({ username }),
//             });

//             const data = await response.json();

//             if (!response.ok) {
//                 throw new Error(data.message || 'Failed to update username.');
//             }

//             setUsernameUpdateSuccess(data.message || 'Username updated successfully!');
//             setIsEditingUsername(false);
//         } catch (error) {
//             setUsernameUpdateError(error.message || 'An error occurred.');
//         } finally {
//             setIsUpdatingUsername(false);
//         }
//     };

//     const handleUpdatePassword = async () => {
//         if (!oldPassword) {
//             setOldPasswordError("Old password is required.");
//             return;
//         }
//         if (!newPassword || !confirmNewPassword) {
//             setPasswordUpdateError('New password and confirmation are required.');
//             return;
//         }
//         if (newPassword !== confirmNewPassword) {
//             setPasswordUpdateError('Passwords do not match.');
//             return;
//         }

//         setIsReauthenticating(true);
//         setOldPasswordError('');
//         setPasswordUpdateError('');
//         setPasswordUpdateSuccess('');

//         const user = auth.currentUser;
//         const credential = EmailAuthProvider.credential(user.email, oldPassword);

//         try {
//             await reauthenticateWithCredential(user, credential);
//             console.log('User re-authenticated successfully.');
//             setIsReauthenticating(false);

//             setIsUpdatingPassword(true);
//             try {
//                 const token = await user.getIdToken();
//                 const response = await fetch("http://localhost:5000/api/auth/password", {
//                     method: "PUT",
//                     headers: {
//                         "Content-Type": "application/json",
//                         "Authorization": `Bearer ${token}`
//                     },
//                     body: JSON.stringify({ newPassword })
//                 });

//                 const data = await response.json();

//                 if (!response.ok) {
//                     throw new Error(data.message || "Failed to update password on the server.");
//                 }

//                 setPasswordUpdateSuccess(data.message || "Password updated successfully!");
//                 setOldPassword('');
//                 setNewPassword('');
//                 setConfirmNewPassword('');
//             } catch (error) {
//                 console.error("Error updating password on server:", error);
//                 setPasswordUpdateError(error.message || "An error occurred while updating password.");
//             } finally {
//                 setIsUpdatingPassword(false);
//             }

//         } catch (error) {
//             console.error('Error re-authenticating:', error);
//             setOldPasswordError(error.message || 'Incorrect old password.');
//             setIsReauthenticating(false);
//         }
//     };

//     // Forgot Password Functions
//     const handleForgotPasswordClick = () => {
//         setShowForgotPasswordPopup(true);
//     };

//     const handleResetPassword = async (e) => {
//         e.preventDefault();
//         setResetError('');
//         setResetSuccess('');
//         setResetLoading(true);

//         if (!resetEmail) {
//             setResetError('Please enter your email address.');
//             setResetLoading(false);
//             return;
//         }

//         try {
//             await sendPasswordResetEmail(auth, resetEmail);
//             setResetSuccess('Password reset email sent! Please check your inbox (and spam folder).');
//         } catch (firebaseError) {
//             console.error('Forgot Password Error:', firebaseError.message);
//             let errorMessage = 'Failed to send reset email. Please try again.';
//             switch (firebaseError.code) {
//                 case 'auth/user-not-found':
//                     errorMessage = 'There is no user record corresponding to this email.';
//                     break;
//                 case 'auth/invalid-email':
//                     errorMessage = 'Please enter a valid email address.';
//                     break;
//             }
//             setResetError(errorMessage);
//         } finally {
//             setResetLoading(false);
//         }
//     };

//     const closeForgotPasswordPopup = () => {
//         setShowForgotPasswordPopup(false);
//         setResetEmail('');
//         setResetError('');
//         setResetSuccess('');
//     };

//     if (authLoading) return <div>Loading...</div>;
//     if (profileError) return <div>Error: {profileError}</div>;

//     return (
//         <div className="settings-container">
//             <h2>Account Settings</h2>

//             {/* Username Section */}
//             <div className="setting-section">
//                 <h3>Update Username</h3>
//                 <div className="form-group">
//                     <label htmlFor="username">Username</label>
//                     <input
//                         type="text"
//                         id="username"
//                         className="form-control"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         disabled={!isEditingUsername}
//                     />
//                 </div>
//                 {isEditingUsername ? (
//                     <>
//                         <button
//                             className="btn btn-success"
//                             onClick={handleUpdateUsername}
//                             disabled={isUpdatingUsername}
//                         >
//                             {isUpdatingUsername ? <Loader2 className="spinner" size={18} /> : 'Save'}
//                         </button>
//                         <button
//                             className="btn btn-secondary"
//                             onClick={() => setIsEditingUsername(false)}
//                         >
//                             Cancel
//                         </button>
//                     </>
//                 ) : (
//                     <button
//                         className="btn btn-primary"
//                         onClick={() => setIsEditingUsername(true)}
//                     >
//                         Edit
//                     </button>
//                 )}
//                 {usernameUpdateError && <div className="alert alert-danger">{usernameUpdateError}</div>}
//                 {usernameUpdateSuccess && <div className="alert alert-success">{usernameUpdateSuccess}</div>}
//             </div>

//             {/* Password Section */}
//             <div className="setting-section">
//                 <h3>Update Password</h3>
//                 {/* Old Password */}
// <div className="form-group">
//     <label htmlFor="oldPassword">Old Password</label>
//     <div className="password-input-container">
//         <>
//             <input
//                 type={showOldPassword ? 'text' : 'password'}
//                 id="oldPassword"
//                 className="form-control"
//                 value={oldPassword}
//                 onChange={(e) => setOldPassword(e.target.value)}
//             />
//             <button
//                 type="button"
//                 className="password-toggle-button"
//                 onClick={() => setShowOldPassword(!showOldPassword)}
//             >
//                 {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//         </>
//     </div>
//     {oldPasswordError && <div className="alert alert-danger">{oldPasswordError}</div>}
// </div>

// {/* New Password */}
// <div className="form-group">
//     <label htmlFor="newPassword">New Password</label>
//     <div className="password-input-container">
//         <>
//             <input
//                 type={showNewPassword ? 'text' : 'password'}
//                 id="newPassword"
//                 className="form-control"
//                 value={newPassword}
//                 onChange={(e) => setNewPassword(e.target.value)}
//             />
//             <button
//                 type="button"
//                 className="password-toggle-button"
//                 onClick={() => setShowNewPassword(!showNewPassword)}
//             >
//                 {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//         </>
//     </div>
// </div>

// {/* Confirm New Password */}
// <div className="form-group">
//     <label htmlFor="confirmNewPassword">Confirm New Password</label>
//     <div className="password-input-container">
//         <>
//             <input
//                 type={showConfirmNewPassword ? 'text' : 'password'}
//                 id="confirmNewPassword"
//                 className="form-control"
//                 value={confirmNewPassword}
//                 onChange={(e) => setConfirmNewPassword(e.target.value)}
//             />
//             <button
//                 type="button"
//                 className="password-toggle-button"
//                 onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
//             >
//                 {showConfirmNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//         </>
//     </div>
// </div>
//                 <button
//                     className="btn btn-warning"
//                     onClick={handleUpdatePassword}
//                     disabled={isUpdatingPassword || isReauthenticating}
//                 >
//                     {isReauthenticating
//                         ? <><Loader2 className="spinner" size={18} /> Verifying...</>
//                         : isUpdatingPassword
//                             ? <><Loader2 className="spinner" size={18} /> Updating...</>
//                             : 'Update Password'}
//                 </button>
//                 {passwordUpdateError && <div className="alert alert-danger">{passwordUpdateError}</div>}
//                 {passwordUpdateSuccess && <div className="alert alert-success">{passwordUpdateSuccess}</div>}
//                 <p className="forgot-password-text" onClick={handleForgotPasswordClick}>Forgot Password? Click here</p>
//             </div>

//             {/* Forgot Password Popup */}
//             {showForgotPasswordPopup && (
//                 <div className="forgot-password-popup">
//                     <div className="forgot-password-popup-content">
//                         <span className="close-button" onClick={closeForgotPasswordPopup}>&times;</span>
//                         <h3>Reset Password</h3>
//                         <p>Enter your email to receive a reset link.</p>
//                         {resetError && <div className="alert alert-danger">{resetError}</div>}
//                         {resetSuccess && <div className="alert alert-success">{resetSuccess}</div>}
//                         <form onSubmit={handleResetPassword}>
//                             <div className="form-group">
//                                 <label htmlFor="resetEmail">Email</label>
//                                 <input
//                                     type="email"
//                                     id="resetEmail"
//                                     className="form-control"
//                                     value={resetEmail}
//                                     onChange={(e) => setResetEmail(e.target.value)}
//                                     required
//                                 />
//                             </div>
//                             <button type="submit" className="btn btn-primary" disabled={resetLoading}>
//                                 {resetLoading ? <><Loader2 className="spinner" size={18} /> Sending...</> : 'Send Reset Link'}
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default SettingsPage;





import React, { useState, useEffect } from 'react';
import { auth, reauthenticateWithCredential, EmailAuthProvider } from '../firebaseConfig';
import { updatePassword, sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CheckCircle, AlertTriangle, Mail, User, Lock } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './settings.css';

const SettingsPage = () => {
    // State variables
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [usernameUpdateError, setUsernameUpdateError] = useState('');
    const [usernameUpdateSuccess, setUsernameUpdateSuccess] = useState('');
    const [passwordUpdateError, setPasswordUpdateError] = useState('');
    const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState('');
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isReauthenticating, setIsReauthenticating] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [profileError, setProfileError] = useState(null);
    const [showForgotPasswordPopup, setShowForgotPasswordPopup] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUsername(user.displayName || '');
                setAuthLoading(false);
            } else {
                navigate('/login');
                setAuthLoading(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleUpdateUsername = async () => {
        if (!username) {
            setUsernameUpdateError('Username is required.');
            return;
        }

        setIsUpdatingUsername(true);
        setUsernameUpdateError('');
        setUsernameUpdateSuccess('');
        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update username.');
            }

            setUsernameUpdateSuccess(data.message || 'Username updated successfully!');
            setIsEditingUsername(false);
        } catch (error) {
            setUsernameUpdateError(error.message || 'An error occurred.');
        } finally {
            setIsUpdatingUsername(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!oldPassword) {
            setOldPasswordError("Old password is required.");
            return;
        }
        if (!newPassword || !confirmNewPassword) {
            setPasswordUpdateError('New password and confirmation are required.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordUpdateError('Passwords do not match.');
            return;
        }

        setIsReauthenticating(true);
        setOldPasswordError('');
        setPasswordUpdateError('');
        setPasswordUpdateSuccess('');

        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, oldPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            setIsReauthenticating(false);

            setIsUpdatingPassword(true);
            try {
                const token = await user.getIdToken();
                const response = await fetch("http://localhost:5000/api/auth/password", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ newPassword })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to update password on the server.");
                }

                setPasswordUpdateSuccess(data.message || "Password updated successfully!");
                setOldPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } catch (error) {
                setPasswordUpdateError(error.message || "An error occurred while updating password.");
            } finally {
                setIsUpdatingPassword(false);
            }

        } catch (error) {
            setOldPasswordError(error.message || 'Incorrect old password.');
            setIsReauthenticating(false);
        }
    };

    const handleForgotPasswordClick = () => {
        setShowForgotPasswordPopup(true);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetError('');
        setResetSuccess('');
        setResetLoading(true);

        if (!resetEmail) {
            setResetError('Please enter your email address.');
            setResetLoading(false);
            return;
        }

        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetSuccess('Password reset email sent! Please check your inbox (and spam folder).');
        } catch (firebaseError) {
            let errorMessage = 'Failed to send reset email. Please try again.';
            switch (firebaseError.code) {
                case 'auth/user-not-found':
                    errorMessage = 'There is no user record corresponding to this email.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
            }
            setResetError(errorMessage);
        } finally {
            setResetLoading(false);
        }
    };

    const closeForgotPasswordPopup = () => {
        setShowForgotPasswordPopup(false);
        setResetEmail('');
        setResetError('');
        setResetSuccess('');
    };

    if (authLoading) {
        return (
            <div className="loading-container">
                <Loader2 className="spinner" size={32} />
                <p>Loading your settings...</p>
            </div>
        );
    }

    if (profileError) {
        return (
            <div className="error-container">
                <AlertTriangle size={32} className="text-danger" />
                <p className="error-message">Error: {profileError}</p>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="settings-page">
            <div className="settings-container">
                <div className="settings-header">
                    <h1>Account Settings</h1>
                    <p className="text-muted">Manage your account details and security</p>
                </div>

                {/* Username Section */}
                <div className="settings-card">
                    <div className="card-header">
                        <User size={20} />
                        <h3>Profile Information</h3>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    id="username"
                                    className="form-control"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={!isEditingUsername}
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>
                        
                        {isEditingUsername ? (
                            <div className="button-group">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleUpdateUsername}
                                    disabled={isUpdatingUsername}
                                >
                                    {isUpdatingUsername ? (
                                        <>
                                            <Loader2 className="spinner" size={18} /> Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setIsEditingUsername(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                className="btn btn-outline-primary"
                                onClick={() => setIsEditingUsername(true)}
                            >
                                Edit Username
                            </button>
                        )}
                        
                        {usernameUpdateError && (
                            <div className="alert alert-danger mt-3">
                                <AlertTriangle size={18} /> {usernameUpdateError}
                            </div>
                        )}
                        {usernameUpdateSuccess && (
                            <div className="alert alert-success mt-3">
                                <CheckCircle size={18} /> {usernameUpdateSuccess}
                            </div>
                        )}
                    </div>
                </div>

                {/* Password Section */}
                <div className="settings-card">
                    <div className="card-header">
                        <Lock size={20} />
                        <h3>Password Settings</h3>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label htmlFor="oldPassword">Current Password</label>
                            <div className="password-input">
                                <input
                                    type={showOldPassword ? 'text' : 'password'}
                                    id="oldPassword"
                                    className="form-control"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Enter your current password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    aria-label={showOldPassword ? "Hide password" : "Show password"}
                                >
                                    {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {oldPasswordError && (
                                <small className="text-danger">{oldPasswordError}</small>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <div className="password-input">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    className="form-control"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter your new password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmNewPassword">Confirm New Password</label>
                            <div className="password-input">
                                <input
                                    type={showConfirmNewPassword ? 'text' : 'password'}
                                    id="confirmNewPassword"
                                    className="form-control"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    placeholder="Confirm your new password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                    aria-label={showConfirmNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleUpdatePassword}
                            disabled={isUpdatingPassword || isReauthenticating}
                        >
                            {isReauthenticating ? (
                                <>
                                    <Loader2 className="spinner" size={18} /> Verifying...
                                </>
                            ) : isUpdatingPassword ? (
                                <>
                                    <Loader2 className="spinner" size={18} /> Updating...
                                </>
                            ) : (
                                'Update Password'
                            )}
                        </button>

                        <p className="forgot-password-link" onClick={handleForgotPasswordClick}>
                            Forgot your password? Click here to reset
                        </p>

                        {passwordUpdateError && (
                            <div className="alert alert-danger mt-3">
                                <AlertTriangle size={18} /> {passwordUpdateError}
                            </div>
                        )}
                        {passwordUpdateSuccess && (
                            <div className="alert alert-success mt-3">
                                <CheckCircle size={18} /> {passwordUpdateSuccess}
                            </div>
                        )}
                    </div>
                </div>

                {/* Support Section */}
                <div className="support-section">
                    <p>
                        Need help with account ownership or deletion?{' '}
                        <a href="/contact" className="contact-link">
                            Contact us
                        </a>
                    </p>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPasswordPopup && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Reset Password</h3>
                            <button className="close-button" onClick={closeForgotPasswordPopup}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>Enter your email address and we'll send you a link to reset your password.</p>
                            
                            {resetError && (
                                <div className="alert alert-danger">
                                    <AlertTriangle size={18} /> {resetError}
                                </div>
                            )}
                            {resetSuccess && (
                                <div className="alert alert-success">
                                    <CheckCircle size={18} /> {resetSuccess}
                                </div>
                            )}

                            <form onSubmit={handleResetPassword}>
                                <div className="form-group">
                                    <label htmlFor="resetEmail">Email Address</label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <Mail size={18} />
                                        </span>
                                        <input
                                            type="email"
                                            id="resetEmail"
                                            className="form-control"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={closeForgotPasswordPopup}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={resetLoading}
                                    >
                                        {resetLoading ? (
                                            <>
                                                <Loader2 className="spinner" size={18} /> Sending...
                                            </>
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;