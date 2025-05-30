import React, { useState, useEffect } from 'react';
import {
    FiCalendar, FiTrendingUp, FiClock, FiChevronLeft, FiChevronRight,
    FiCheck, FiX, FiHelpCircle, FiDownload, FiChevronsLeft, FiChevronsRight
} from 'react-icons/fi';
import {
    Container, Row, Col, Card, Spinner, ProgressBar, Badge,
    Button, Modal, Tabs, Tab, Form
} from 'react-bootstrap';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import './DashData.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DashData = () => {
    const auth = getAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dailyData, setDailyData] = useState(null);
    const [weeklyAverage, setWeeklyAverage] = useState(null);
    const [monthlyAverage, setMonthlyAverage] = useState(null);
    const [targets, setTargets] = useState({
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0
    });
    const [weeklyStreakData, setWeeklyStreakData] = useState([]);
    const [monthlyStreakData, setMonthlyStreakData] = useState([]);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [activeTab, setActiveTab] = useState(null);
    const [chartType, setChartType] = useState('bar');
    const [chartData, setChartData] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState('');
    const [showYearSelect, setShowYearSelect] = useState(false);
    const [showMonthSelect, setShowMonthSelect] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const getAuthToken = async () => {
        if (user) {
            try {
                return await user.getIdToken();
            } catch (error) {
                console.error("Error getting ID token:", error);
                return null;
            }
        }
        return null;
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                try {
                    const token = await user.getIdToken();
                    const [dailyRes, weeklyRes, monthlyRes, streakRes] = await Promise.all([
                        fetch('http://localhost:5000/api/daily-totals', {
                            headers: { Authorization: `Bearer ${token}` }
                        }),
                        fetch('http://localhost:5000/api/weekly-average', {
                            headers: { Authorization: `Bearer ${token}` }
                        }),
                        fetch('http://localhost:5000/api/monthly-average', {
                            headers: { Authorization: `Bearer ${token}` }
                        }),
                        fetch('http://localhost:5000/api/streaks/weekly-daily', {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                    ]);

                    const daily = await dailyRes.json();
                    const weekly = await weeklyRes.json();
                    const monthly = await monthlyRes.json();
                    const weeklyStreak = await streakRes.json();

                    setDailyData(daily);
                    setWeeklyAverage(weekly);
                    setMonthlyAverage(monthly);
                    setWeeklyStreakData(weeklyStreak.dailyStreaks || []);

                    if (daily.targets) setTargets(daily.targets);

                    const currentStreakRes = await fetch(
                        'http://localhost:5000/api/streaks/consistency-streak',
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const { streakLength } = await currentStreakRes.json();
                    setCurrentStreak(streakLength || 0);

                } catch (error) {
                    console.error("Error loading data:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) fetchMonthlyStreakData();
    }, [selectedMonth, selectedYear, user]);

    const fetchMonthlyStreakData = async () => {
        try {
            const token = await user.getIdToken();
            const response = await fetch(
                `http://localhost:5000/api/streaks/month/${selectedYear}/${selectedMonth}/daily`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const { dailyStreaks } = await response.json();
            setMonthlyStreakData(dailyStreaks || []);
        } catch (error) {
            console.error("Error fetching monthly streak:", error);
        }
    };

    const fetchChartData = async (timeframe) => {
        setActiveTab(timeframe);
        setDetailsLoading(true);
        setDetailsError("");
        try {
            const token = await getAuthToken();
            if (!token) return;

            let endpoint = "";
            switch (timeframe) {
                case "daily": endpoint = "daily-totals/daily-chart"; break;
                case "weekly": endpoint = "daily-totals/weekly-details-chart"; break;
                case "monthly": endpoint = "daily-totals/monthly-chart-by-week"; break;
                default: endpoint = "daily-totals/daily-chart";
            }

            const response = await axios.get(`http://localhost:5000/api/${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let formattedData;
            if (timeframe === 'daily') {
                formattedData = {
                    ...response.data,
                    carbs: response.data.carbs || response.data.carbohydrate || 0,
                };
            } else if (timeframe === 'weekly') {
                formattedData = response.data.map((item) => ({
                    ...item,
                    carbs: item.carbs || item.carbohydrate || 0,
                }));
            } else if (timeframe === 'monthly') {
                formattedData = response.data.map((item) => {
                    const date = new Date(item.date);
                    return {
                        day: date.getDate(),
                        calories: item.calories,
                        protein: item.protein,
                        fat: item.fat,
                        carbs: item.carbs || item.carbohydrate || 0,
                    };
                });
            } else {
                formattedData = {
                    ...response.data,
                    carbs: response.data.carbs || response.data.carbohydrate || 0,
                };
            }

            setChartData(formattedData);
        } catch (error) {
            setDetailsError(`Failed to load ${timeframe} chart data. Please try again.`);
            console.error(`Error fetching ${timeframe} chart data:`, error);
        } finally {
            setDetailsLoading(false);
        }
    };

    const renderChart = () => {
        if (!chartData) {
            return detailsLoading ? <Spinner animation="border" /> : <p>{detailsError || 'There is no data available for this timeframe yet. Try another tab or log a meal!.'}</p>;
        }

        if (chartType === 'bar') {
            const dataKeyXAxis = activeTab === 'weekly' ? 'date' : activeTab === 'monthly' ? 'day' : 'time';
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Array.isArray(chartData) ? chartData : [chartData]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={dataKeyXAxis} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="calories" fill="#d9534f" />
                        <Bar dataKey="protein" fill="#5bc0de" />
                        <Bar dataKey="fat" fill="#f0ad4e" />
                        <Bar dataKey="carbs" fill="#5cb85c" />
                    </BarChart>
                </ResponsiveContainer>
            );
        } else if (chartType === 'line') {
            const dataKeyXAxis = activeTab === 'weekly' ? 'date' : activeTab === 'monthly' ? 'day' : 'time';
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={Array.isArray(chartData) ? chartData : [chartData]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={dataKeyXAxis} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="calories" stroke="#d9534f" strokeWidth={2} />
                        <Line type="monotone" dataKey="protein" stroke="#5bc0de" strokeWidth={2} />
                        <Line type="monotone" dataKey="fat" stroke="#f0ad4e" strokeWidth={2} />
                        <Line type="monotone" dataKey="carbs" stroke="#5cb85c" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            );
        } else if (chartType === 'pie' && chartData && !Array.isArray(chartData)) {
            const pieData = [
                { name: 'Calories', value: chartData.calories },
                { name: 'Protein', value: chartData.protein },
                { name: 'Fat', value: chartData.fat },
                { name: 'Carbs', value: chartData.carbs },
            ];
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            );
        } else if (chartType === 'pie' && activeTab === 'weekly' && Array.isArray(chartData) && chartData.length > 0) {
            const weeklyTotals = chartData.reduce((acc, curr) => ({
                calories: (acc.calories || 0) + (curr.calories || 0),
                protein: (acc.protein || 0) + (curr.protein || 0),
                fat: (acc.fat || 0) + (curr.fat || 0),
                carbs: (acc.carbs || 0) + (curr.carbs || 0),
            }), {});
            const pieData = [
                { name: 'Calories', value: weeklyTotals.calories },
                { name: 'Protein', value: weeklyTotals.protein },
                { name: 'Fat', value: weeklyTotals.fat },
                { name: 'Carbs', value: weeklyTotals.carbs },
            ];
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            );
        } else if (chartType === 'pie' && activeTab === 'monthly' && Array.isArray(chartData) && chartData.length > 0) {
            const monthlyTotals = chartData.reduce((acc, curr) => ({
                calories: (acc.calories || 0) + (curr.calories || 0),
                protein: (acc.protein || 0) + (curr.protein || 0),
                fat: (acc.fat || 0) + (curr.fat || 0),
                carbs: (acc.carbs || 0) + (curr.carbs || 0),
            }), {});
            const pieData = [
                { name: 'Calories', value: monthlyTotals.calories },
                { name: 'Protein', value: monthlyTotals.protein },
                { name: 'Fat', value: monthlyTotals.fat },
                { name: 'Carbs', value: monthlyTotals.carbs },
            ];
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            );
        } else {
            return <p>Pie chart is only available when data is present.</p>;
        }
    };

    const renderNutritionCard = (title, data, icon, timeframe) => {
        if (!data) return null;
        const displayData = timeframe === 'daily' && data.dailyTotal ? data.dailyTotal : data;
        const carbs = displayData.carbs || displayData.carbohydrate || 0;
    
        return (
            <Card className="nutrition-card" onClick={() => fetchChartData(timeframe)}>
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5>{icon} {title}</h5>
                            <small className="text-muted">
                                {timeframe === 'daily' ? 'Today' :
                                    timeframe === 'weekly' ? 'This week' : 'This month'}
                            </small>
                        </div>
                        <Badge bg="light" text="dark">
                            {timeframe === 'daily' ? <FiCalendar /> :
                                timeframe === 'weekly' ? <FiTrendingUp /> : <FiClock />}
                        </Badge>
                    </div>
    
                    <div className="nutrition-stats">
                        {['calories', 'protein', 'fat', 'carbs'].map((nutrient) => {
                            const currentValue = displayData[nutrient] || 0;
                            const targetValue = targets[nutrient] || 1;
                            const percentage = Math.min((currentValue / targetValue) * 100, 100);
                            const nutrientClass = nutrient === 'calories' ? 'calories' :
                                                nutrient === 'protein' ? 'protein' :
                                                nutrient === 'fat' ? 'fat' : 'carbs';
    
                            return (
                                <div key={nutrient} className="stat-item">
                                    <div className="stat-label-container">
                                        <span className="stat-label">
                                            {nutrient === 'calories' ? 'Calories' :
                                                nutrient === 'protein' ? 'Protein' :
                                                nutrient === 'fat' ? 'Fat' : 'Carbs'}
                                        </span>
                                        <span className={`stat-value ${nutrientClass}`}>
                                            {currentValue.toFixed(nutrient === 'calories' ? 0 : 1)}
                                            {nutrient !== 'calories' ? 'g' : ''}
                                            <span className="percentage">
                                                ({Math.round(percentage)}%)
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card.Body>
            </Card>
        );
    };

    const renderWeeklyStreak = () => {
        if (weeklyStreakData.length === 0) {
            return (
                <div className="text-center py-4">
                    <FiHelpCircle size={24} />
                    <p>No weekly streak data available</p>
                </div>
            );
        }
    
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        const successDays = weeklyStreakData.filter(day => day.metTarget).length;
        const successRate = Math.round((successDays / weeklyStreakData.length) * 100);
    
        return (
            <div className="weekly-streak">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5><FiTrendingUp /> Weekly Performance</h5>
                    <Badge bg={successRate >= 80 ? 'success' : successRate >= 50 ? 'warning' : 'danger'}>
                        {successRate}% Success
                    </Badge>
                </div>
    
                <div className="week-days">
                    {weeklyStreakData.map((day, index) => {
                        const date = new Date(day.date);
                        date.setHours(0, 0, 0, 0);
                        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
                        const isToday = date.getTime() === today.getTime();
                        const isFuture = date > today;
                        const hasData = day.metTarget !== undefined && !isFuture;
    
                        return (
                            <div key={index} className={`day-cell ${isToday ? 'today' : ''}`}>
                                <div className="day-name">{dayName}</div>
                                <div className={`day-status ${
                                    isFuture ? 'future' :
                                        !hasData ? 'no-data' :
                                            day.metTarget ? 'success' : 'fail'
                                }`}>
                                    {isFuture ? '' :
                                        !hasData ? '?' :
                                            day.metTarget ? <FiCheck /> : <FiX />}
                                </div>
                                <div className="day-date">{date.getDate()}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderMonthlyStreak = () => {
        const monthName = months[selectedMonth - 1];
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay();
        const today = new Date();
    
        // Calculate success rate
        const successDays = monthlyStreakData.filter(day => day.metTarget).length;
        const successRate = monthlyStreakData.length > 0 
            ? Math.round((successDays / monthlyStreakData.length) * 100) 
            : 0;
    
        // Generate calendar cells
        const calendarCells = [];
        
        // Empty cells for days before the 1st of month
        for (let i = 0; i < firstDayOfWeek; i++) {
            calendarCells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
        }
    
        // Cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const streakDay = monthlyStreakData.find(d => d.date === dateStr);
            const isToday = today.getFullYear() === selectedYear && 
                          today.getMonth() + 1 === selectedMonth && 
                          today.getDate() === day;
            const isFuture = new Date(dateStr) > today;
            const hasData = streakDay !== undefined;
    
            calendarCells.push(
                <div 
                    key={`day-${day}`}
                    className={`calendar-cell 
                        ${isToday ? 'today' : ''}
                        ${hasData ? (streakDay.metTarget ? 'success' : 'fail') : ''}
                        ${isFuture ? 'future' : ''}
                    `}
                    title={hasData ? 
                        `Calories: ${streakDay.calories || 0}/${targets.calories}` : 
                        isFuture ? 'Future date' : 'No data'}
                >
                    <div className="day-number">{day}</div>
                    {hasData && (
                        <div className="day-indicator">
                            {streakDay.metTarget ? <FiCheck /> : <FiX />}
                        </div>
                    )}
                </div>
            );
        }
    
        return (
            <Card className="monthly-streak-card">
                <Card.Body>
                    <div className="month-navigator-container">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setSelectedYear(prev => prev - 1)}
                                size="sm"
                            >
                                <FiChevronsLeft />
                            </Button>
                            
                            <Button 
                                variant="outline-primary" 
                                onClick={() => {
                                    const newMonth = selectedMonth - 1;
                                    if (newMonth < 1) {
                                        setSelectedMonth(12);
                                        setSelectedYear(prev => prev - 1);
                                    } else {
                                        setSelectedMonth(newMonth);
                                    }
                                }}
                                size="sm"
                            >
                                <FiChevronLeft />
                            </Button>
                            
                            <div 
                                className="month-year-display"
                                onClick={() => setShowMonthSelect(!showMonthSelect)}
                            >
                                <h5 className="mb-0">
                                    {monthName} {selectedYear}
                                </h5>
                            </div>
                            
                            <Button 
                                variant="outline-primary" 
                                onClick={() => {
                                    const newMonth = selectedMonth + 1;
                                    if (newMonth > 12) {
                                        setSelectedMonth(1);
                                        setSelectedYear(prev => prev + 1);
                                    } else {
                                        setSelectedMonth(newMonth);
                                    }
                                }}
                                size="sm"
                            >
                                <FiChevronRight />
                            </Button>
                            
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setSelectedYear(prev => prev + 1)}
                                size="sm"
                            >
                                <FiChevronsRight />
                            </Button>
                        </div>
    
                        {(showMonthSelect || showYearSelect) && (
                            <div className="month-year-selector mb-3">
                                {showMonthSelect && (
                                    <div className="month-selector">
                                        <Row className="g-2">
                                            {months.map((month, index) => (
                                                <Col xs={4} key={month}>
                                                    <Button
                                                        variant={selectedMonth === index + 1 ? 'primary' : 'outline-secondary'}
                                                        onClick={() => {
                                                            setSelectedMonth(index + 1);
                                                            setShowMonthSelect(false);
                                                        }}
                                                        size="sm"
                                                        className="w-100"
                                                    >
                                                        {month.substring(0, 3)}
                                                    </Button>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                )}
                                
                                {showYearSelect && (
                                    <div className="year-selector">
                                        <Form.Control
                                            type="number"
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
                                            min="2000"
                                            max="2100"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
    
                    <div className="calendar-legend mb-3">
                        <div className="legend-item">
                            <span className="legend-dot success"></span>
                            <span>Target Met</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot fail"></span>
                            <span>Missed</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot future"></span>
                            <span>Future</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-dot today"></span>
                            <span>Today</span>
                        </div>
                    </div>
    
                    <div className="calendar-grid">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                            <div key={`header-${i}`} className="calendar-header">{day}</div>
                        ))}
                        {calendarCells}
                    </div>
                </Card.Body>
            </Card>
        );
    };

    return (
        <Container className="dashboard-container">
            {loading ? (
                <div className="loading-screen">
                    <Spinner animation="border" />
                    <p>Loading your dashboard...</p>
                </div>
            ) : !user ? (
                <div className="auth-error">
                    <h4>Please sign in to view this content</h4>
                    <Button variant="primary" onClick={() => window.location.reload()}>
                        Refresh
                    </Button>
                </div>
            ) : (
                <>
                    {/* Current Streak Banner */}
                    <Card className="current-streak-banner mb-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5>Current Streak</h5>
                                    <p className="mb-0">Days meeting your targets</p>
                                </div>
                                <div className="streak-count">
                                    <span className="count">{currentStreak}</span>
                                    <span className="days">days</span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Nutrition Cards */}
                    <Row className="g-4 mb-4">
                        <Col md={4}>
                            {renderNutritionCard("Today's Totals", dailyData, <FiCalendar />, "daily")}
                        </Col>
                        <Col md={4}>
                            {renderNutritionCard("Weekly Average", weeklyAverage, <FiTrendingUp />, "weekly")}
                        </Col>
                        <Col md={4}>
                            {renderNutritionCard("Monthly Average", monthlyAverage, <FiClock />, "monthly")}
                        </Col>
                    </Row>

                    {/* Streak Data */}
                    <Row className="g-4 mb-4">
                        <Col md={6}>
                            <Card className="streak-card">
                                <Card.Body>
                                    {renderWeeklyStreak()}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            {renderMonthlyStreak()}
                        </Col>
                    </Row>

                    {/* Nutrition Charts Modal */}
                    <Modal
                        show={!!activeTab}
                        onHide={() => {
                            setActiveTab(null);
                            setChartData(null);
                        }}
                        size="lg"
                        centered
                        fullscreen="md-down"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                {activeTab === "daily"
                                    ? "Daily"
                                    : activeTab === "weekly"
                                        ? "Weekly"
                                        : "Monthly"} Nutrition Breakdown
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => fetchChartData(k)}
                                className="mb-3"
                            >
                                <Tab eventKey="daily" title="Daily">
                                    {renderChart()}
                                </Tab>
                                <Tab eventKey="weekly" title="Weekly">
                                    {renderChart()}
                                </Tab>
                                <Tab eventKey="monthly" title="Monthly">
                                    {renderChart()}
                                </Tab>
                            </Tabs>

                            <div className="chart-controls">
                                <Button
                                    variant={chartType === "bar" ? "primary" : "outline-primary"}
                                    onClick={() => setChartType("bar")}
                                    size="sm"
                                    className="me-2"
                                >
                                    <FiTrendingUp className="me-1" /> Bar
                                </Button>
                                <Button
                                    variant={chartType === "line" ? "primary" : "outline-primary"}
                                    onClick={() => setChartType("line")}
                                    size="sm"
                                    className="me-2"
                                >
                                    <FiTrendingUp className="me-1" /> Line
                                </Button>
                                <Button
                                    variant={chartType === "pie" ? "primary" : "outline-primary"}
                                    onClick={() => setChartType("pie")}
                                    size="sm"
                                    disabled={!chartData || (activeTab === 'monthly' && Array.isArray(chartData) && chartData.length === 0)}
                                >
                                    <FiTrendingUp className="me-1" /> Pie
                                </Button>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setActiveTab(null);
                                    setChartData(null);
                                }}
                            >
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>
            )}
        </Container>
    );
};

export default DashData;