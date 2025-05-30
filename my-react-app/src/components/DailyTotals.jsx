// //working till showing log,streak numeric data
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//     Button,
//     Table,
//     Container,
//     Row,
//     Col,
//     Alert,
//     Spinner,
//     Card,
//     Modal,
//     Badge,
//     ProgressBar,
//     ListGroup
// } from "react-bootstrap";
// import { getAuth } from "firebase/auth";
// import { FiTrash2, FiInfo, FiCheckCircle, FiXCircle } from "react-icons/fi";
// import "./DailyTotals.css";

// const DailyTotals = () => {
//     const [dailyData, setDailyData] = useState(null);
//     const [weeklyStreak, setWeeklyStreak] = useState(null);
//     const [consistencyStreak, setConsistencyStreak] = useState(null);
//     const [userProfile, setUserProfile] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [showConfirmModal, setShowConfirmModal] = useState(false);
//     const [itemToRemove, setItemToRemove] = useState(null);
//     const auth = getAuth();

//     useEffect(() => {
//         const unsubscribe = auth.onAuthStateChanged(user => {
//             if (user) {
//                 fetchData();
//                 fetchStreakData();
//                 fetchUserProfile();
//             } else {
//                 // Optionally handle the case where the user is logged out
//                 setDailyData(null);
//                 setWeeklyStreak(null);
//                 setConsistencyStreak(null);
//                 setUserProfile(null);
//             }
//         });

//         // Initial fetch if user is already logged in
//         if (auth.currentUser) {
//             fetchData();
//             fetchStreakData();
//             fetchUserProfile();
//         }

//         return () => unsubscribe(); // Cleanup the listener
//     }, [auth]); // Depend on 'auth' to re-run if the auth object changes (unlikely but good practice)

//     const getAuthToken = async () => {
//         if (auth.currentUser) {
//             try {
//                 const token = await auth.currentUser.getIdToken();
//                 return token;
//             } catch (error) {
//                 console.error("Error getting ID token:", error);
//                 setError("Authentication error. Please log in again.");
//                 setLoading(false);
//                 return null;
//             }
//         } else {
//             setError("User not logged in.");
//             setLoading(false);
//             return null;
//         }
//     };

//     const fetchData = async () => {
//         try {
//             setLoading(true);
//             setError("");
//             const token = await getAuthToken();
//             if (!token) return;

//             const dailyRes = await axios.get(`http://localhost:5000/api/daily-totals`, {
//                 headers: { Authorization: `Bearer ${token}` },
//             });

//             setDailyData(dailyRes.data);
//         } catch (err) {
//             setError("Failed to load daily totals. Please try again later.");
//             console.error("Error fetching daily totals:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchStreakData = async () => {
//         try {
//             const token = await getAuthToken();
//             if (!token) return;

//             const [weeklyRes, consistencyRes] = await Promise.all([
//                 axios.get(`http://localhost:5000/api/streaks/weekly-streak`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 }),
//                 axios.get(`http://localhost:5000/api/streaks/consistency-streak`, { // Ensure this URL is correct
//                     headers: { Authorization: `Bearer ${token}` },
//                 }),
//             ]);

//             setWeeklyStreak(weeklyRes.data?.reachedTargetDays);
//             setConsistencyStreak(consistencyRes.data?.streakLength); // Expecting 'streakLength' from the new backend endpoint
//         } catch (err) {
//             console.error("Error fetching streak data:", err);
//             // Optionally set an error message for streaks if it's critical
//         }
//     };

//     const fetchUserProfile = async () => {
//         try {
//             const token = await getAuthToken();
//             if (!token) return;

//             const profileRes = await axios.get(`http://localhost:5000/api/users/me/profile`, { // Using /me/profile as per your routes
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             setUserProfile(profileRes.data);
//         } catch (err) {
//             console.error("Error fetching user profile:", err);
//             setError("Failed to load user profile data.");
//         }
//     };

//     const handleRemoveMeal = async () => {
//         try {
//             setError("");
//             const token = await getAuthToken();
//             if (!token) return;

//             await axios.post(
//                 "http://localhost:5000/api/daily-totals/remove",
//                 {
//                     mealName: itemToRemove.mealName,
//                     foodItemId: itemToRemove.foodId,
//                 },
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                 }
//             );
//             fetchData();
//         } catch (err) {
//             setError("Error removing meal. Please try again.");
//             console.error("Error removing meal:", err);
//         } finally {
//             setShowConfirmModal(false);
//             setItemToRemove(null);
//         }
//     };

//     const confirmRemove = (mealName, foodId) => {
//         setItemToRemove({ mealName, foodId });
//         setShowConfirmModal(true);
//     };

//     const renderTargetStatus = (actual, target, label) => {
//         const met = actual >= target;
//         return (
//             <div className="d-flex align-items-center justify-content-between">
//                 <span>{label}: {actual?.toFixed(0) || 0}{label === 'Protein' || label === 'Fat' || label === 'Carbs' ? 'g' : ''}</span>
//                 <Badge pill bg={met ? "success" : "danger"}>
//                     {met ? <FiCheckCircle /> : <FiXCircle />} {met ? "Met" : "Not Met"}
//                 </Badge>
//             </div>
//         );
//     };

//     const getTodaysTargets = () => {
//         return userProfile?.macroTargets || {
//             calories: 1000, // Default if not in profile
//             protein: 1000,   // Default if not in profile
//             fat: 1000,       // Default if not in profile
//             carbs: 1000,     // Default if not in profile
//         };
//     };

//     const todaysTargets = getTodaysTargets();

//     return (
//         <Container className="daily-totals-container mt-5">
//             <div className="page-header mb-4">
//                 <h1>Nutrition Dashboard</h1>
//                 <p className="text-muted">Track your daily nutrition and progress</p>
//             </div>

//             {loading ? (
//                 <div className="loading-screen text-center">
//                     <Spinner animation="border" variant="primary" />
//                     <p>Loading your nutrition data...</p>
//                 </div>
//             ) : error ? (
//                 <Alert variant="danger" className="mt-4">
//                     {error}
//                     <Button variant="link" onClick={fetchData} className="p-0 ms-2">
//                         Try again
//                     </Button>
//                 </Alert>
//             ) : (
//                 <>
//                     <Card className="mb-4">
//                         <Card.Header className="d-flex justify-content-between align-items-center">
//                             <h4 className="mb-0">
//                                 <FiInfo className="me-2" /> Today's Meal Log
//                             </h4>
//                             <Badge bg="light" text="dark" pill>
//                                 {dailyData?.meals?.reduce((acc, meal) => acc + meal.foodItems.length, 0) || 0} items
//                             </Badge>
//                         </Card.Header>
//                         <Card.Body className="p-3">
//                             {dailyData && dailyData.meals && dailyData.meals.length > 0 ? (
//                                 <div className="table-responsive">
//                                     <Table hover className="meal-table">
//                                         <thead>
//                                             <tr>
//                                                 <th>Meal</th>
//                                                 <th>Food Item</th>
//                                                 <th>Calories</th>
//                                                 <th>Protein</th>
//                                                 <th>Fat</th>
//                                                 <th>Carbs</th>
//                                                 <th>Actions</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {dailyData.meals.map((meal) =>
//                                                 meal.foodItems.map((food) => (
//                                                     <tr key={`${meal.mealName}-${food.foodId}`}>
//                                                         <td>
//                                                             <Badge bg="secondary" className="meal-badge">
//                                                                 {meal.mealName}
//                                                             </Badge>
//                                                         </td>
//                                                         <td>{food.name}</td>
//                                                         <td>{food.calories || 0}</td>
//                                                         <td>{food.protein || 0}g</td>
//                                                         <td>{food.fat || 0}g</td>
//                                                         <td>{food.carbs || food.carbohydrate || 0}g</td>
//                                                         <td>
//                                                             <Button
//                                                                 variant="outline-danger"
//                                                                 size="sm"
//                                                                 onClick={() => confirmRemove(meal.mealName, food.foodId)}
//                                                                 title="Remove item"
//                                                             >
//                                                                 <FiTrash2 />
//                                                             </Button>
//                                                         </td>
//                                                     </tr>
//                                                 ))
//                                             )}
//                                         </tbody>
//                                     </Table>
//                                 </div>
//                             ) : (
//                                 <div className="empty-state text-center py-4">
//                                     <img
//                                         src="https://cdn-icons-png.flaticon.com/512/3079/3079158.png"
//                                         alt="No meals"
//                                         width="100"
//                                         className="mb-3"
//                                     />
//                                     <h5>No meals logged today</h5>
//                                     <p className="text-muted">Add your first meal to start tracking your nutrition</p>
//                                 </div>
//                             )}
//                         </Card.Body>
//                     </Card>

//                     {dailyData?.dailyTotal && userProfile?.macroTargets && (
//                         <Card className="mb-4">
//                             <Card.Header>
//                                 <h4 className="mb-0">Today's Targets</h4>
//                             </Card.Header>
//                             <Card.Body>
//                                 <ListGroup variant="flush">
//                                     <ListGroup.Item>
//                                         {renderTargetStatus(dailyData.dailyTotal.calories, todaysTargets.calories, "Calories")}
//                                     </ListGroup.Item>
//                                     <ListGroup.Item>
//                                         {renderTargetStatus(dailyData.dailyTotal.protein, todaysTargets.protein, "Protein")}
//                                     </ListGroup.Item>
//                                     <ListGroup.Item>
//                                         {renderTargetStatus(dailyData.dailyTotal.fat, todaysTargets.fat, "Fat")}
//                                     </ListGroup.Item>
//                                     <ListGroup.Item>
//                                         {renderTargetStatus(dailyData.dailyTotal.carbs || dailyData.dailyTotal.carbohydrate, todaysTargets.carbs, "Carbs")}
//                                     </ListGroup.Item>
//                                 </ListGroup>
//                             </Card.Body>
//                         </Card>
//                     )} 
//                     <Card className="mb-4">
//                         <Card.Header>
//                             <h4 className="mb-0">Your Progress</h4>
//                         </Card.Header>
//                         <Card.Body>
//                             <ListGroup variant="flush">
//                                 <ListGroup.Item className="d-flex justify-content-between align-items-center">
//                                     <span>Weekly Streak (Days met this week):</span>
//                                     <Badge pill bg="info">{weeklyStreak !== null ? weeklyStreak : "N/A"}</Badge>
//                                 </ListGroup.Item>
//                                 <ListGroup.Item className="d-flex justify-content-between align-items-center">
//                                     <span>Consistency Streak (Consecutive days met):</span>
//                                     <Badge pill bg="success">{consistencyStreak !== null ? consistencyStreak : "N/A"}</Badge>
//                                 </ListGroup.Item>
//                             </ListGroup>
//                         </Card.Body>
//                     </Card>

//                     {/* Confirmation Modal */}
//                     <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
//                         <Modal.Header closeButton>
//                             <Modal.Title>Confirm Removal</Modal.Title>
//                         </Modal.Header>
//                         <Modal.Body>
//                             <div className="d-flex align-items-center mb-3">
//                                 <div className="icon-circle bg-danger me-3">
//                                     <FiTrash2 size={24} color="white" />
//                                 </div>
//                                 <div>
//                                     <h6 className="mb-1">Remove this food item?</h6>
//                                     <p className="text-muted mb-0">
//                                         {itemToRemove?.mealName}: {itemToRemove?.foodId}
//                                     </p>
//                                 </div>
//                             </div>
//                             <p className="text-muted">
//                                 This action cannot be undone. The item will be permanently removed from today's log.
//                             </p>
//                         </Modal.Body>
//                         <Modal.Footer>
//                             <Button variant="outline-secondary" onClick={() => setShowConfirmModal(false)}>
//                                 Cancel
//                             </Button>
//                             <Button variant="danger" onClick={handleRemoveMeal} className="d-flex align-items-center">
//                                 <FiTrash2 className="me-1" /> Remove
//                             </Button>
//                         </Modal.Footer>
//                     </Modal>
//                 </>
//             )}
//         </Container>
//     );
// };

// export default DailyTotals;








import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Button,
    Table,
    Container,
    Row,
    Col,
    Alert,
    Spinner,
    Card,
    Modal,
    Badge,
    ProgressBar,
    ListGroup
} from "react-bootstrap";
import { getAuth } from "firebase/auth";
import { FiTrash2, FiInfo, FiCheckCircle, FiXCircle } from "react-icons/fi";
import "./DailyTotals.css";

const DailyTotals = () => {
    const [dailyData, setDailyData] = useState(null);
    const [weeklyStreak, setWeeklyStreak] = useState(null);
    const [consistencyStreak, setConsistencyStreak] = useState(null);
    const [dailyWeeklyStreakData, setDailyWeeklyStreakData] = useState(null); // New state for daily weekly data
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                fetchData();
                fetchStreakData();
                fetchUserProfile();
                fetchDailyWeeklyStreakData(); // Fetch the new daily weekly data
            } else {
                setDailyData(null);
                setWeeklyStreak(null);
                setConsistencyStreak(null);
                setDailyWeeklyStreakData(null);
                setUserProfile(null);
            }
        });

        if (auth.currentUser) {
            fetchData();
            fetchStreakData();
            fetchUserProfile();
            fetchDailyWeeklyStreakData(); // Initial fetch if user is logged in
        }

        return () => unsubscribe();
    }, [auth]);

    const getAuthToken = async () => {
        if (auth.currentUser) {
            try {
                const token = await auth.currentUser.getIdToken();
                return token;
            } catch (error) {
                console.error("Error getting ID token:", error);
                setError("Authentication error. Please log in again.");
                setLoading(false);
                return null;
            }
        } else {
            setError("User not logged in.");
            setLoading(false);
            return null;
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");
            const token = await getAuthToken();
            if (!token) return;

            const dailyRes = await axios.get(`http://localhost:5000/api/daily-totals`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setDailyData(dailyRes.data);
        } catch (err) {
            setError("Failed to load daily totals. Please try again later.");
            console.error("Error fetching daily totals:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStreakData = async () => {
        try {
            const token = await getAuthToken();
            if (!token) return;

            const [weeklyRes, consistencyRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/streaks/weekly-streak`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`http://localhost:5000/api/streaks/consistency-streak`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            setWeeklyStreak(weeklyRes.data?.reachedTargetDays);
            setConsistencyStreak(consistencyRes.data?.streakLength);
        } catch (err) {
            console.error("Error fetching streak data:", err);
            // Optionally set an error message for streaks if it's critical
        }
    };

    const fetchDailyWeeklyStreakData = async () => {
        try {
            const token = await getAuthToken();
            if (!token) return;

            const dailyWeeklyRes = await axios.get(`http://localhost:5000/api/streaks/weekly-daily`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDailyWeeklyStreakData(dailyWeeklyRes.data?.dailyStreaks);
        } catch (err) {
            console.error("Error fetching daily weekly streak data:", err);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const token = await getAuthToken();
            if (!token) return;

            const profileRes = await axios.get(`http://localhost:5000/api/users/me/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserProfile(profileRes.data);
        } catch (err) {
            console.error("Error fetching user profile:", err);
            setError("Failed to load user profile data.");
        }
    };

    const handleRemoveMeal = async () => {
        try {
            setError("");
            const token = await getAuthToken();
            if (!token) return;

            await axios.post(
                "http://localhost:5000/api/daily-totals/remove",
                {
                    mealName: itemToRemove.mealName,
                    foodItemId: itemToRemove.foodId,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            fetchData();
        } catch (err) {
            setError("Error removing meal. Please try again.");
            console.error("Error removing meal:", err);
        } finally {
            setShowConfirmModal(false);
            setItemToRemove(null);
        }
    };

    const confirmRemove = (mealName, foodId) => {
        setItemToRemove({ mealName, foodId });
        setShowConfirmModal(true);
    };

    const renderTargetStatus = (actual, target, label) => {
        const met = actual >= target;
        return (
            <div className="d-flex align-items-center justify-content-between">
                <span>{label}: {actual?.toFixed(0) || 0}{label === 'Protein' || label === 'Fat' || label === 'Carbs' ? 'g' : ''}</span>
                <Badge pill bg={met ? "success" : "danger"}>
                    {met ? <FiCheckCircle /> : <FiXCircle />} {met ? "Met" : "Not Met"}
                </Badge>
            </div>
        );
    };

    const getTodaysTargets = () => {
        return userProfile?.macroTargets || {
            calories: 1000, // Default if not in profile
            protein: 1000,   // Default if not in profile
            fat: 1000,     // Default if not in profile
            carbs: 1000,   // Default if not in profile
        };
    };

    const todaysTargets = getTodaysTargets();

    return (
        <Container className="daily-totals-container mt-5">
            <div className="page-header mb-4">
                <h1>Nutrition Dashboard</h1>
                <p className="text-muted">Track your daily nutrition and progress</p>
            </div>

            {loading ? (
                <div className="loading-screen text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading your nutrition data...</p>
                </div>
            ) : error ? (
                <Alert variant="danger" className="mt-4">
                    {error}
                    <Button variant="link" onClick={fetchData} className="p-0 ms-2">
                        Try again
                    </Button>
                </Alert>
            ) : (
                <>
                    <Card className="mb-4">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">
                                <FiInfo className="me-2" /> Today's Meal Log
                            </h4>
                            <Badge bg="light" text="dark" pill>
                                {dailyData?.meals?.reduce((acc, meal) => acc + meal.foodItems.length, 0) || 0} items
                            </Badge>
                        </Card.Header>
                        <Card.Body className="p-3">
                            {dailyData && dailyData.meals && dailyData.meals.length > 0 ? (
                                <div className="table-responsive">
                                    <Table hover className="meal-table">
                                        <thead>
                                            <tr>
                                                <th>Meal</th>
                                                <th>Food Item</th>
                                                <th>Calories</th>
                                                <th>Protein</th>
                                                <th>Fat</th>
                                                <th>Carbs</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dailyData.meals.map((meal) =>
                                                meal.foodItems.map((food) => (
                                                    <tr key={`${meal.mealName}-${food.foodId}`}>
                                                        <td>
                                                            <Badge bg="secondary" className="meal-badge">
                                                                {meal.mealName}
                                                            </Badge>
                                                        </td>
                                                        <td>{food.name}</td>
                                                        <td>{food.calories || 0}</td>
                                                        <td>{food.protein || 0}g</td>
                                                        <td>{food.fat || 0}g</td>
                                                        <td>{food.carbs || food.carbohydrate || 0}g</td>
                                                        <td>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                onClick={() => confirmRemove(meal.mealName, food.foodId)}
                                                                title="Remove item"
                                                            >
                                                                <FiTrash2 />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="empty-state text-center py-4">
                                    <img
                                        src="https://cdn-icons-png.flaticon.com/512/3079/3079158.png"
                                        alt="No meals"
                                        width="100"
                                        className="mb-3"
                                    />
                                    <h5>No meals logged today</h5>
                                    <p className="text-muted">Add your first meal to start tracking your nutrition</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {dailyData?.dailyTotal && userProfile?.macroTargets && (
                        <Card className="mb-4">
                            <Card.Header>
                                <h4 className="mb-0">Today's Targets</h4>
                            </Card.Header>
                            <Card.Body>
                                <ListGroup variant="flush">
                                    <ListGroup.Item>
                                        {renderTargetStatus(dailyData.dailyTotal.calories, todaysTargets.calories, "Calories")}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        {renderTargetStatus(dailyData.dailyTotal.protein, todaysTargets.protein, "Protein")}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        {renderTargetStatus(dailyData.dailyTotal.fat, todaysTargets.fat, "Fat")}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        {renderTargetStatus(dailyData.dailyTotal.carbs || dailyData.dailyTotal.carbohydrate, todaysTargets.carbs, "Carbs")}
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    )}
                    <Card className="mb-4">
                        <Card.Header>
                            <h4 className="mb-0">Your Progress</h4>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                    <span>Weekly Streak:</span>
                                    {dailyWeeklyStreakData ? (
                                        <div className="d-flex">
                                            {dailyWeeklyStreakData.map((day) => (
                                                <div
                                                    key={day.date}
                                                    className="weekly-day-indicator"
                                                    style={{
                                                        backgroundColor: day.metTarget === true ? 'lightgreen' : day.metTarget === false ? 'lightcoral' : 'lightgray',
                                                        borderRadius: '5px',
                                                        width: '25px',
                                                        height: '25px',
                                                        marginRight: '5px',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        fontSize: '0.8em',
                                                        color: day.metTarget !== null ? 'black' : 'gray',
                                                    }}
                                                    title={`${new Date(day.date).toLocaleDateString()} - ${day.metTarget === true ? 'Met' : day.metTarget === false ? 'Not Met' : 'No Data'}`}
                                                >
                                                    {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric' })}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Badge pill bg="info">Loading...</Badge>
                                    )}
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                    <span>Consistency Streak (Consecutive days met):</span>
                                    <Badge pill bg="success">{consistencyStreak !== null ? consistencyStreak : "N/A"}</Badge>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    {/* Confirmation Modal */}
                    <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirm Removal</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="d-flex align-items-center mb-3">
                                <div className="icon-circle bg-danger me-3">
                                    <FiTrash2 size={24} color="white" />
                                </div>
                                <div>
                                    <h6 className="mb-1">Remove this food item?</h6>
                                    <p className="text-muted mb-0">
                                        {itemToRemove?.mealName}: {itemToRemove?.foodId}
                                    </p>
                                </div>
                            </div>
                            <p className="text-muted">
                                This action cannot be undone. The item will be permanently removed from today's log.
                            </p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="outline-secondary" onClick={() => setShowConfirmModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleRemoveMeal} className="d-flex align-items-center">
                                <FiTrash2 className="me-1" /> Remove
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </Container>
    );
};

export default DailyTotals;