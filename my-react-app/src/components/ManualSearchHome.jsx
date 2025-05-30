import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaChevronDown, FaChevronUp, FaPlus, FaInfoCircle,FaRobot } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import Modal from 'react-modal';
import { getAuth } from "firebase/auth";
import './ManualSearchHome.css';
import styles from './HomePage.module.css';
import ChatbotWindow from './ChatbotWindow';
Modal.setAppElement('#root');
const API_BASE_URL = 'http://localhost:5000/api';

const ManualSearchHome = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedItem, setExpandedItem] = useState(null);
    const [showMoreSuggestions, setShowMoreSuggestions] = useState(false);
    const [allSuggestionsLoaded, setAllSuggestionsLoaded] = useState(false);
    const [suggestionLimit, setSuggestionLimit] = useState(5);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [mealName, setMealName] = useState('');
    const [selectedFood, setSelectedFood] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('grams');
    const [isMobile, setIsMobile] = useState(false);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const searchInputRef = useRef(null);
    const debounceTimer = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
        });

        // Check if mobile device
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768 || 
                      ('ontouchstart' in window || 
                       navigator.maxTouchPoints > 0 || 
                       navigator.msMaxTouchPoints > 0));
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            unsubscribe();
            window.removeEventListener('resize', checkIfMobile);
            clearTimeout(debounceTimer.current);
        };
    }, []);

    const fetchSuggestions = async (queryTerm, limit = 5) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${API_BASE_URL}/suggestions?query=${encodeURIComponent(queryTerm)}&limit=${limit}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || `Failed to fetch suggestions (status ${response.status})`
                );
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (err) {
            console.error('Error fetching suggestions:', err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    };
    const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
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

    const handleSearchChange = async (e) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        clearTimeout(debounceTimer.current);

        if (newSearchTerm.trim() === '') {
            setSuggestions([]);
            setSearchResults([]);
            return;
        }

        debounceTimer.current = setTimeout(async () => {
            try {
                setLoading(true);
                const data = await fetchSuggestions(newSearchTerm, suggestionLimit);
                setSuggestions(data);
                setAllSuggestionsLoaded(data.length < suggestionLimit);
            } catch (error) {
                console.error('Search error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }, isMobile ? 500 : 300); // Longer delay for mobile
    };

    const handleLoadMoreSuggestions = async () => {
        try {
            setLoading(true);
            const newLimit = suggestionLimit + 5;
            const data = await fetchSuggestions(searchTerm, newLimit);
            setSuggestions(data);
            setSuggestionLimit(newLimit);
            setAllSuggestionsLoaded(data.length < newLimit);
            setShowMoreSuggestions(true);
        } catch (error) {
            console.error('Error loading more suggestions:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadLessSuggestions = () => {
        setSuggestionLimit(5);
        setShowMoreSuggestions(false);
        fetchSuggestions(searchTerm, 5).then(data => {
            setSuggestions(data);
            setAllSuggestionsLoaded(data.length < 5);
        });
    };

    const searchFood = async (queryTerm) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `${API_BASE_URL}/search?query=${encodeURIComponent(queryTerm)}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || `Search failed (status ${response.status})`
                );
            }

            const data = await response.json();

            return data.map(item => ({
                ...item,
                carbs: item.carbs || item.carbohydrate || 0,
                calories: parseFloat(item.calories) || 0,
                protein: parseFloat(item.protein) || 0,
                fat: parseFloat(item.fat) || 0,
                foodId: item._id,
            }));
        } catch (error) {
            console.error('Error searching food items:', error);
            setError(error.message);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = async (suggestion) => {
        try {
            setLoading(true);
            setSearchTerm(suggestion);
            setSuggestions([]);
            const results = await searchFood(suggestion);
            setSearchResults(results);
            if (searchInputRef.current) searchInputRef.current.blur();
        } catch (error) {
            console.error('Error handling suggestion click:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (searchTerm.trim() === '') {
            setError('Please enter a search term');
            return;
        }
        try {
            setLoading(true);
            const results = await searchFood(searchTerm);
            setSearchResults(results);
        } catch (error) {
            console.error('Search submit error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (index) => {
        setExpandedItem(expandedItem === index ? null : index);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setSuggestions([]);
        setExpandedItem(null);
        setError(null);
        if (searchInputRef.current) searchInputRef.current.focus();
    };

    const NutrientDisplay = ({ item }) => {
        const formatNutrientValue = (value, nutrient) => {
            if (value === undefined || value === null) return '0';
            if (nutrient === 'calories') return Math.round(value);
            if (['vitamin_a', 'vitamin_c'].includes(nutrient)) return value;
            return `${Math.round(value * 10) / 10}g`;
        };

        const secondaryNutrients = ['fiber', 'sugars', 'sodium', 'cholesterol', 'vitamin_a', 'vitamin_c', 'calcium', 'iron'];

        return (
            <div className="nf-detailed-nutrition">
                <h4>Detailed Nutrition Facts</h4>
                <div className="nf-nutrients-grid">
                    {secondaryNutrients.map((nutrient) => (
                        <div key={nutrient} className="nf-nutrient-item">
                            <span className="nf-nutrient-label">
                                {nutrient.split('_').map(word =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}:
                            </span>
                            <span className="nf-nutrient-value">
                                {formatNutrientValue(item[nutrient], nutrient)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const openModal = (item) => {
        setSelectedFood(item);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setMealName('');
        setShowConfirmation(false);
        setError(null);
        setQuantity(1);
        setUnit('grams');
    };

    const handleAddToTotals = async () => {
        if (!selectedFood) return setError("Please select a food item");
        if (!mealName.trim()) return setError("Please enter a valid meal name");
        if (!currentUser) return setError("Please log in to add to totals");

        setLoading(true);
        setError(null);

        try {
            const token = await currentUser.getIdToken();
            let calculatedCalories = selectedFood.calories;
            let calculatedProtein = selectedFood.protein;
            let calculatedFat = selectedFood.fat;
            let calculatedCarbs = selectedFood.carbs;

            if (unit === 'grams' || unit === 'ml') {
                calculatedCalories = (selectedFood.calories / 100) * quantity;
                calculatedProtein = (selectedFood.protein / 100) * quantity;
                calculatedFat = (selectedFood.fat / 100) * quantity;
                calculatedCarbs = (selectedFood.carbs / 100) * quantity;
            } else if (unit === 'count') {
                calculatedCalories = selectedFood.calories * quantity;
                calculatedProtein = selectedFood.protein * quantity;
                calculatedFat = selectedFood.fat * quantity;
                calculatedCarbs = selectedFood.carbs * quantity;
            }

            const foodItem = {
                foodId: selectedFood.foodId,
                name: selectedFood.name || 'Unknown Food',
                calories: calculatedCalories || 0,
                protein: calculatedProtein || 0,
                fat: calculatedFat || 0,
                carbs: calculatedCarbs || 0,
                source: selectedFood.source || 'manual',
                quantity: quantity,
                unit: unit,
            };

            const response = await fetch(`${API_BASE_URL}/daily-totals/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: currentUser.uid,
                    mealName: mealName.trim(),
                    foodItem: foodItem,
                    date: new Date().toISOString().split('T')[0],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add to totals');
            }

            setShowConfirmation(true);
            setTimeout(() => {
                closeModal();
                setSearchTerm('');
                setSearchResults([]);
            }, 1500);
        } catch (error) {
            console.error("Error adding meal:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Touch-friendly handlers
    const handleTouchStart = (e) => {
        e.currentTarget.classList.add('touch-active');
    };

    const handleTouchEnd = (e) => {
        e.currentTarget.classList.remove('touch-active');
    };

    return (
        <div className="nf-food-search-container">
            <div className="nf-search-header">
                <h1 className="nf-search-title">Nutrition Finder</h1>
                <p className="nf-search-subtitle">Discover detailed nutritional information</p>
                <p className="nf-search-subtitle">use our advanced chatbot down there for more detailed information</p>
            </div>

            <form className="nf-search-form" onSubmit={handleSearchSubmit}>
                <div className="nf-search-input-container">
                    <FaSearch className="nf-search-icon" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        className="nf-search-input"
                        placeholder="Search for any food (e.g., apple, chicken breast)"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        aria-label="Search for foods"
                        inputMode="search"
                        autoCapitalize="off"
                        autoCorrect="off"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="nf-search-clear-button"
                            onClick={handleClearSearch}
                            aria-label="Clear search"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <IoClose />
                        </button>
                    )}
                </div>
            </form>

            {loading && suggestions.length === 0 && (
                <div className="nf-loading-spinner">
                    <div className="nf-spinner"></div>
                    <p>Searching...</p>
                </div>
            )}

            {error && (
                <div className="nf-error-message">
                    <p>{error}</p>
                </div>
            )}

            {suggestions.length > 0 && (
                <div className="nf-suggestions-container">
                    <ul className="nf-suggestions-list">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className="nf-suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => e.key === 'Enter' && handleSuggestionClick(suggestion)}
                            >
                                <FaSearch className="nf-suggestion-icon" />
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="nf-suggestions-footer">
                        {!allSuggestionsLoaded && suggestions.length >= suggestionLimit && (
                            <button
                                className="nf-view-more-button"
                                onClick={handleLoadMoreSuggestions}
                                disabled={loading}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                {loading ? 'Loading...' : 'View More Suggestions'} <FaChevronDown />
                            </button>
                        )}
                        {showMoreSuggestions && (
                            <button
                                className="nf-view-less-button"
                                onClick={handleLoadLessSuggestions}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                View Less <FaChevronUp />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {searchResults.length > 0 && (
                <div className="nf-results-container">
                    <h2 className="nf-results-title">Nutrition Information</h2>
                    <div className="nf-results-list">
                        {searchResults.map((item, index) => (
                            <div key={index} className="nf-food-result">
                                <div className="nf-food-header">
                                    <h3 className="nf-food-name">
                                        {item.local_name ? item.local_name : item.name}
                                        {item.local_name && item.name !== item.local_name && (
                                            <span className="nf-food-local-name"> ({item.name})</span>
                                        )}
                                    </h3>
                                    <button
                                        className="nf-info-button"
                                        onClick={() => toggleExpand(index)}
                                        aria-label={expandedItem === index ? 'Hide details' : 'Show details'}
                                        onTouchStart={handleTouchStart}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        <FaInfoCircle />
                                    </button>
                                </div>

                                <div className="nf-macros-grid">
                                    <div className="nf-macro-card nf-macro-calories">
                                        <div className="nf-macro-value">
                                            {Math.round(item.calories) || 0}
                                        </div>
                                        <div className="nf-macro-label">Calories</div>
                                    </div>
                                    <div className="nf-macro-card nf-macro-protein">
                                        <div className="nf-macro-value">
                                            {Math.round(item.protein * 10) / 10 || 0}g
                                        </div>
                                        <div className="nf-macro-label">Protein</div>
                                    </div>
                                    <div className="nf-macro-card nf-macro-fat">
                                        <div className="nf-macro-value">
                                            {Math.round(item.fat * 10) / 10 || 0}g
                                        </div>
                                        <div className="nf-macro-label">Fat</div>
                                    </div>
                                    <div className="nf-macro-card nf-macro-carbs">
                                        <div className="nf-macro-value">
                                            {Math.round(item.carbs * 10) / 10 || 0}g
                                        </div>
                                        <div className="nf-macro-label">Carbs</div>
                                    </div>
                                </div>

                                {expandedItem === index && <NutrientDisplay item={item} />}

                                <div className="nf-food-actions">
                                    <button
                                        className="nf-details-button"
                                        onClick={() => toggleExpand(index)}
                                        onTouchStart={handleTouchStart}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        {expandedItem === index ? (
                                            <>
                                                Show Less <FaChevronUp />
                                            </>
                                        ) : (
                                            <>
                                                Show More <FaChevronDown />
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="nf-add-button"
                                        onClick={() => openModal(item)}
                                        disabled={!currentUser}
                                        onTouchStart={handleTouchStart}
                                        onTouchEnd={handleTouchEnd}
                                    >
                                        <FaPlus /> Add to Totals
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {searchResults.length === 0 && searchTerm.trim() !== '' && !loading && (
                <div className="nf-no-results">
                    <p>No results found for "{searchTerm}". Try another search term.</p>
                </div>
            )}

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Add to Daily Totals"
                className="nf-nutrition-modal"
                overlayClassName="nf-modal-overlay"
                closeTimeoutMS={200}
                ref={modalRef}
                style={{
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: isMobile ? 'flex-end' : 'center',
                        justifyContent: 'center',
                    },
                    content: {
                        position: isMobile ? 'fixed' : 'relative',
                        bottom: isMobile ? '0' : 'auto',
                        borderRadius: isMobile ? '16px 16px 0 0' : '12px',
                        width: isMobile ? '100%' : '90%',
                        maxWidth: '450px',
                        padding: isMobile ? '1.5rem' : '2rem',
                        maxHeight: isMobile ? '90vh' : '80vh',
                        overflowY: 'auto',
                    }
                }}
            >
                <button 
                    className="nf-modal-close-button" 
                    onClick={closeModal}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <IoClose />
                </button>

                {showConfirmation ? (
                    <div className="nf-confirmation-view">
                        <div className="nf-confirmation-icon">✓</div>
                        <h3>Successfully Added!</h3>
                        <p>Your meal has been added to your daily totals.</p>
                        <button
                            className="nf-confirm-button"
                            onClick={closeModal}
                            aria-label="Continue"
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            Continue
                        </button>
                    </div>
                ) : (
                    <div className="nf-add-meal-view">
                        <h2>Add Meal Details</h2>
                        
                        <div className="nf-form-group">
                            <label htmlFor="mealName">Meal Name</label>
                            <input
                                id="mealName"
                                type="text"
                                placeholder="e.g., Breakfast, Lunch, Snack"
                                value={mealName}
                                onChange={(e) => setMealName(e.target.value)}
                                autoFocus={!isMobile}
                                aria-required="true"
                                inputMode="text"
                            />
                        </div>

                        <div className="nf-quantity-unit-container">
                            <div className="nf-form-group nf-quantity-group">
                                <label htmlFor="quantity">Quantity</label>
                                <input
                                    id="quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, e.target.value))}
                                    min="1"
                                    required
                                    inputMode="numeric"
                                />
                            </div>

                            <div className="nf-form-group nf-unit-group">
                                <label htmlFor="unit">Unit</label>
                                <select
                                    id="unit"
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    required
                                >
                                    <option value="grams">Grams</option>
                                    <option value="ml">Milliliters</option>
                                    <option value="count">Count</option>
                                </select>
                            </div>
                        </div>

                        {selectedFood && (
                            <div className="nf-selected-food-info">
                                <h4>Selected Food</h4>
                                <p className="nf-selected-food-name">
                                    {selectedFood.local_name ? selectedFood.local_name : selectedFood.name}
                                </p>
                                <div className="nf-selected-macros">
                                    <span>{Math.round(selectedFood.calories) || 0} cal</span>
                                    <span>{Math.round(selectedFood.protein * 10) / 10 || 0}g protein</span>
                                    <span>{Math.round(selectedFood.carbs * 10) / 10 || 0}g carbs</span>
                                    <span>{Math.round(selectedFood.fat * 10) / 10 || 0}g fat</span>
                                </div>
                            </div>
                        )}

                        {error && <div className="nf-modal-error">{error}</div>}

                        <div className="nf-modal-actions">
                            <button
                                className="nf-cancel-button"
                                onClick={closeModal}
                                disabled={loading}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                Cancel
                            </button>
                            <button
                                className="nf-submit-button"
                                onClick={handleAddToTotals}
                                disabled={loading || !mealName.trim()}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            >
                                {loading ? (
                                    <>
                                        <div className="nf-spinner-small"></div>
                                        Adding...
                                    </>
                                ) : (
                                    'Add to Totals'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            {/* Chatbot Integration */}
      <div className={styles.chatbotContainer}>
        <div 
          className={styles.chatbotToggle}
          onClick={toggleChatbot}
          aria-label="Open Chatbot"
        >
          <div className={styles.chatbotBubble}>
            <FaRobot className={styles.chatbotIcon} />
            {!isMobile && <span className={styles.chatbotGreeting}>Hey! I'm Keto AI</span>}
          </div>
          <span className={styles.chatbotTooltip}>Ask about food nutrition, ingredients, or intolerances</span>
        </div>
        
        {isChatbotOpen && (
          <ChatbotWindow onClose={toggleChatbot} />
        )}
      </div>
        </div>
    );
};

export default ManualSearchHome;
