// import React, { useState, useRef, useEffect } from 'react';
// import styles from './ChatbotWindow.module.css';
// import { FaPlus, FaPaperPlane, FaTimes, FaCheck } from 'react-icons/fa';
// import { getAuth } from 'firebase/auth';
// import { v4 as uuidv4 } from 'uuid';

// function ChatbotWindow({ onClose }) {
//   const [messages, setMessages] = useState([
//     { sender: 'bot', text: "Hi there! I'm your Keto Nutrition Assistant. Ask me about any food's nutritional information." }
//   ]);
//   const [inputValue, setInputValue] = useState('');
//   const chatDisplayRef = useRef(null);
//   const [isSending, setIsSending] = useState(false);
//   const [foodInfo, setFoodInfo] = useState(null);
//   const [error, setError] = useState(null);
//   const [mealName, setMealName] = useState('');
//   const [quantity, setQuantity] = useState(100);
//   const [unit, setUnit] = useState('grams');
//   const [isAddingToTotals, setIsAddingToTotals] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);

//   const BACKEND_URL = 'http://localhost:5000';

//   useEffect(() => {
//     scrollToBottom();
//     const auth = getAuth();
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       setCurrentUser(user);
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, foodInfo, successMessage]);

//   const scrollToBottom = () => {
//     if (chatDisplayRef.current) {
//       chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
//     }
//   };

//   const formatNutrition = (data) => {
//     if (!data || typeof data !== 'string') {
//       return null;
//     }

//     // Split the response into nutrition and dietary notes sections
//     const sections = data.split('---');
//     const nutritionSection = sections[0].trim();
//     const dietaryNotesSection = sections[1]?.trim();

//     // Parse nutrition information
//     const nutritionLines = nutritionSection.split('\n').filter(line => line.includes(':'));
//     const nutrition = {};
//     nutritionLines.forEach(line => {
//       const [key, value] = line.split(':').map(item => item.trim());
//       if (key && value) {
//         nutrition[key.replace(/"/g, '')] = value.replace(/"/g, '');
//       }
//     });

//     // Parse dietary notes
//     const dietaryNotes = {};
//     if (dietaryNotesSection) {
//       const notesLines = dietaryNotesSection.split('\n').filter(line => line.trim());
//       notesLines.forEach(line => {
//         if (line.includes(':')) {
//           const [key, value] = line.split(':').map(item => item.trim());
//           dietaryNotes[key] = value;
//         } else {
//           // For lines without colons (like "Vegetarian: Yes")
//           dietaryNotes[line] = '';
//         }
//       });
//     }

//     return { nutrition, dietaryNotes };
//   };

//   const handleSendMessage = async () => {
//     if (inputValue.trim() && !isSending) {
//       const userMessage = { sender: 'user', text: inputValue };
//       setMessages((prevMessages) => [...prevMessages, userMessage]);
//       setInputValue('');
//       setIsSending(true);
//       setFoodInfo(null);
//       setError(null);
//       setSuccessMessage(null);
//       setMealName('');
//       setQuantity(100);
//       setUnit('grams');

//       try {
//         const response = await fetch(`${BACKEND_URL}/api/chatbot/chat`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ message: inputValue }),
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         const botMessage = { sender: 'bot', text: data.response };
//         setMessages((prevMessages) => [...prevMessages, botMessage]);

//         const nutritionData = formatNutrition(data.response);
//         if (nutritionData && nutritionData.nutrition && Object.keys(nutritionData.nutrition).length > 0) {
//           setFoodInfo(nutritionData);
//         }
//       } catch (error) {
//         console.error("Error sending message to chatbot:", error);
//         setError("Sorry, I couldn't connect to the chatbot service. Please try again later.");
//         const errorMessage = { 
//           sender: 'bot', 
//           text: "Sorry, I couldn't process your request. Please try again later." 
//         };
//         setMessages((prevMessages) => [...prevMessages, errorMessage]);
//       } finally {
//         setIsSending(false);
//       }
//     }
//   };

//   const handleAddToTotals = async () => {
//     if (!foodInfo || !foodInfo.nutrition) {
//       setError("No food information to add.");
//       return;
//     }
//     if (!currentUser) {
//       setError("Please log in to add to your totals.");
//       return;
//     }

//     setIsAddingToTotals(true);
//     setError(null);

//     try {
//       const token = await currentUser.getIdToken();
//       const { 
//         name, 
//         calories: rawCalories, 
//         protein: rawProtein, 
//         fat: rawFat, 
//         carbohydrate: rawCarbs, 
//         carbs: rawCarbsAlt 
//       } = foodInfo.nutrition;

//       // Clean and parse nutrition values
//       const cleanValue = (val) => parseFloat(val?.toString().replace(/[^\d.-]/g, '')) || 0;
      
//       let calculatedCalories = cleanValue(rawCalories);
//       let calculatedProtein = cleanValue(rawProtein);
//       let calculatedFat = cleanValue(rawFat);
//       let calculatedCarbs = cleanValue(rawCarbs || rawCarbsAlt);

//       // Adjust based on quantity and unit
//       if (unit === 'grams' || unit === 'ml') {
//         const multiplier = quantity / 100;
//         calculatedCalories = calculatedCalories * multiplier;
//         calculatedProtein = calculatedProtein * multiplier;
//         calculatedFat = calculatedFat * multiplier;
//         calculatedCarbs = calculatedCarbs * multiplier;
//       } else if (unit === 'count') {
//         calculatedCalories = calculatedCalories * quantity;
//         calculatedProtein = calculatedProtein * quantity;
//         calculatedFat = calculatedFat * quantity;
//         calculatedCarbs = calculatedCarbs * quantity;
//       }

//       const foodItem = {
//         foodId: uuidv4(),
//         name: name || inputValue,
//         calories: calculatedCalories,
//         protein: calculatedProtein,
//         fat: calculatedFat,
//         carbs: calculatedCarbs,
//         source: 'chatbot',
//         quantity: quantity,
//         unit: unit,
//       };

//       const response = await fetch(`${BACKEND_URL}/api/daily-totals/add`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           userId: currentUser.uid,
//           mealName: mealName.trim() || 'Snack',
//           foodItem: foodItem,
//           date: new Date().toISOString().split('T')[0],
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to add to totals.');
//       }

//       setSuccessMessage(`${foodItem.name} (${quantity}${unit === 'count' ? '' : unit}) successfully added to ${mealName || 'Snack'}!`);
//       setFoodInfo(null);
//       setMealName('');
//       setQuantity(100);
//       setUnit('grams');
//     } catch (error) {
//       console.error("Error adding to totals:", error);
//       setError(error.message);
//     } finally {
//       setIsAddingToTotals(false);
//     }
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === 'Enter' && !event.shiftKey) {
//       event.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const nutrientCategories = {
//     macros: ['protein', 'fat', 'carbohydrate', 'carbs', 'fiber', 'sugars'],
//     vitamins: ['vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k'],
//     minerals: ['calcium', 'iron', 'magnesium', 'potassium', 'sodium'],
//     fats: ['saturated_fat', 'monounsaturated_fatty_acids', 'polyunsaturated_fatty_acids', 'cholesterol']
//   };

//   const categorizeNutrients = (nutrition) => {
//     const categorized = {};
//     Object.entries(nutrientCategories).forEach(([category, keys]) => {
//       categorized[category] = {};
//       keys.forEach(key => {
//         if (nutrition[key] !== undefined) {
//           categorized[category][key] = nutrition[key];
//         }
//       });
//     });
//     return categorized;
//   };

//   return (
//     <div className={styles.chatbotWindow}>
//       <div className={styles.chatbotHeader}>
//         <div className={styles.headerContent}>
//           <div className={styles.botIcon}>🍏</div>
//           <h3>Keto Nutrition Assistant</h3>
//         </div>
//         <button className={styles.closeButton} onClick={onClose} aria-label="Close Chatbot">
//           <FaTimes />
//         </button>
//       </div>
      
//       <div className={styles.chatDisplay} ref={chatDisplayRef}>
//         {messages.map((msg, index) => (
//           <div key={index} className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}>
//             <div className={styles.messageContent}>
//               {msg.text.split('\n').map((line, i) => (
//                 <p key={i}>{line}</p>
//               ))}
//             </div>
//           </div>
//         ))}
        
//         {error && (
//           <div className={styles.errorMessage}>
//             <div className={styles.messageContent}>{error}</div>
//           </div>
//         )}
        
//         {successMessage && (
//           <div className={styles.successMessage}>
//             <div className={styles.messageContent}>
//               <FaCheck className={styles.successIcon} /> {successMessage}
//             </div>
//           </div>
//         )}

//         {foodInfo && foodInfo.nutrition && (
//           <div className={styles.foodInfoContainer}>
//             <h3 className={styles.foodInfoTitle}>
//               {foodInfo.nutrition.name || inputValue}
//             </h3>
            
//             <div className={styles.nutritionGrid}>
//               {Object.entries(categorizeNutrients(foodInfo.nutrition)).map(([category, nutrients]) => (
//                 <div key={category} className={styles.nutrientCategory}>
//                   <h4 className={styles.categoryTitle}>
//                     {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
//                   </h4>
//                   {Object.entries(nutrients).map(([key, value]) => (
//                     <div key={key} className={styles.nutrientItem}>
//                       <span className={styles.nutrientLabel}>
//                         {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
//                       </span>
//                       <span className={styles.nutrientValue}>{value}</span>
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>

//             {foodInfo.dietaryNotes && Object.keys(foodInfo.dietaryNotes).length > 0 && (
//               <div className={styles.dietaryNotes}>
//                 <h4 className={styles.notesTitle}>Dietary Notes</h4>
//                 <ul className={styles.notesList}>
//                   {Object.entries(foodInfo.dietaryNotes).map(([key, value]) => (
//                     <li key={key} className={styles.noteItem}>
//                       <strong>{key.replace(/\b\w/g, l => l.toUpperCase())}:</strong> {value || 'N/A'}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <div className={styles.addToTotalsForm}>
//               <h4 className={styles.addToTotalsTitle}>Add to Daily Totals</h4>
//               <div className={styles.formGroup}>
//                 <label htmlFor="mealName" className={styles.formLabel}>Meal:</label>
//                 <input
//                     type="text"
//                     id="mealName"
//                     value={mealName}
//                     onChange={(e) => setMealName(e.target.value)}
//                     className={styles.formInput}
//                     placeholder="Enter meal name"
//                 />
//             </div>
              
              
//               <div className={styles.quantityGroup}>
//                 <div className={styles.formGroup}>
//                   <label htmlFor="quantity" className={styles.formLabel}>Quantity:</label>
//                   <input
//                     type="number"
//                     id="quantity"
//                     value={quantity}
//                     onChange={(e) => setQuantity(Math.max(1, parseFloat(e.target.value) || 1))}
//                     min="1"
//                     step="1"
//                     className={styles.formInput}
//                   />
//                 </div>
                
//                 <div className={styles.formGroup}>
//                   <label htmlFor="unit" className={styles.formLabel}>Unit:</label>
//                   <select
//                     id="unit"
//                     value={unit}
//                     onChange={(e) => setUnit(e.target.value)}
//                     className={styles.formInput}
//                   >
//                     <option value="grams">Grams (g)</option>
//                     <option value="ml">Milliliters (ml)</option>
//                     <option value="count">Count</option>
//                   </select>
//                 </div>
//               </div>
              
//               <button
//                 className={styles.addButton}
//                 onClick={handleAddToTotals}
//                 disabled={isAddingToTotals || !currentUser || !mealName}
//               >
//                 {isAddingToTotals ? 'Adding...' : (
//                   <>
//                     <FaPlus /> Add to {mealName || 'Meal'}
//                   </>
//                 )}
//               </button>
              
//               {!currentUser && (
//                 <p className={styles.loginPrompt}>
//                   Please log in to add foods to your daily totals.
//                 </p>
//               )}
//             </div>
//           </div>
//         )}
        
//         {isSending && (
//           <div className={`${styles.message} ${styles.botMessage}`}>
//             <div className={styles.messageContent}>
//               <div className={styles.typingIndicator}>
//                 <span></span>
//                 <span></span>
//                 <span></span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
      
//       <div className={styles.chatInputArea}>
//         <textarea
//           placeholder="Ask about any food's nutrition..."
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           onKeyDown={handleKeyDown}
//           aria-label="Chatbot Input"
//           disabled={isSending}
//           rows={1}
//           className={styles.chatInput}
//         />
//         <button 
//           onClick={handleSendMessage} 
//           disabled={isSending || !inputValue.trim()}
//           className={styles.sendButton}
//           aria-label="Send Message"
//         >
//           <FaPaperPlane />
//         </button>
//       </div>
//     </div>
//   );
// }

// export default ChatbotWindow;


import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatbotWindow.module.css';
import { FaPlus, FaPaperPlane, FaTimes, FaCheck } from 'react-icons/fa';
import { getAuth } from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

function ChatbotWindow({ onClose }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hi there! I'm your Keto Nutrition Assistant. Ask me about any food's nutritional information." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatDisplayRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const [foodInfo, setFoodInfo] = useState(null); // Will hold the formatted nutrition data
  const [rawBotResponse, setRawBotResponse] = useState(''); // To check if the bot provided food info
  const [error, setError] = useState(null);
  const [mealName, setMealName] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState('grams');
  const [isAddingToTotals, setIsAddingToTotals] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const BACKEND_URL = 'http://localhost:5000';

  useEffect(() => {
    scrollToBottom();
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, foodInfo, successMessage]);

  const scrollToBottom = () => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  };

  const formatNutrition = (data) => {
    if (!data || typeof data !== 'string') {
      return null;
    }

    const sections = data.split('---');
    const nutritionSection = sections[0].trim();
    const dietaryNotesSection = sections[1]?.trim();

    const nutritionLines = nutritionSection.split('\n').filter(line => line.includes(':'));
    const nutrition = {};
    nutritionLines.forEach(line => {
      const [key, value] = line.split(':').map(item => item.trim());
      if (key && value) {
        nutrition[key.replace(/"/g, '')] = value.replace(/"/g, '');
      }
    });

    const dietaryNotes = {};
    if (dietaryNotesSection) {
      const notesLines = dietaryNotesSection.split('\n').filter(line => line.trim());
      notesLines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':').map(item => item.trim());
          dietaryNotes[key] = value;
        } else {
          dietaryNotes[line] = '';
        }
      });
    }

    return { nutrition, dietaryNotes };
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isSending) {
      const userMessage = { sender: 'user', text: inputValue };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInputValue('');
      setIsSending(true);
      setFoodInfo(null); // Reset food info on new message
      setRawBotResponse(''); // Reset raw response
      setError(null);
      setSuccessMessage(null);
      setMealName('');
      setQuantity(100);
      setUnit('grams');

      try {
        const response = await fetch(`${BACKEND_URL}/api/chatbot/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputValue }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const botMessage = { sender: 'bot', text: data.response };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
        setRawBotResponse(data.response); // Store the raw bot response

        const nutritionData = formatNutrition(data.response);
        if (nutritionData && nutritionData.nutrition && Object.keys(nutritionData.nutrition).length > 0) {
          setFoodInfo(nutritionData);
        }
      } catch (error) {
        console.error("Error sending message to chatbot:", error);
        setError("Sorry, I couldn't connect to the chatbot service. Please try again later.");
        const errorMessage = {
          sender: 'bot',
          text: "Sorry, I couldn't process your request. Please try again later."
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleAddToTotals = async () => {
    if (!foodInfo || !foodInfo.nutrition) {
      setError("No food information to add.");
      return;
    }
    if (!currentUser) {
      setError("Please log in to add to your totals.");
      return;
    }

    setIsAddingToTotals(true);
    setError(null);

    try {
      const token = await currentUser.getIdToken();
      const {
        name,
        calories: rawCalories,
        protein: rawProtein,
        fat: rawFat,
        carbohydrate: rawCarbs,
        carbs: rawCarbsAlt
      } = foodInfo.nutrition;

      const cleanValue = (val) => parseFloat(val?.toString().replace(/[^\d.-]/g, '')) || 0;

      let calculatedCalories = cleanValue(rawCalories);
      let calculatedProtein = cleanValue(rawProtein);
      let calculatedFat = cleanValue(rawFat);
      let calculatedCarbs = cleanValue(rawCarbs || rawCarbsAlt);

      if (unit === 'grams' || unit === 'ml') {
        const multiplier = quantity / 100;
        calculatedCalories = calculatedCalories * multiplier;
        calculatedProtein = calculatedProtein * multiplier;
        calculatedFat = calculatedFat * multiplier;
        calculatedCarbs = calculatedCarbs * multiplier;
      } else if (unit === 'count') {
        calculatedCalories = calculatedCalories * quantity;
        calculatedProtein = calculatedProtein * quantity;
        calculatedFat = calculatedFat * quantity;
        calculatedCarbs = calculatedCarbs * quantity;
      }

      const foodItem = {
        foodId: uuidv4(),
        name: name || inputValue,
        calories: calculatedCalories,
        protein: calculatedProtein,
        fat: calculatedFat,
        carbs: calculatedCarbs,
        source: 'chatbot',
        quantity: quantity,
        unit: unit,
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

      setSuccessMessage(`${foodItem.name} (${quantity}${unit === 'count' ? '' : unit}) successfully added to ${mealName || 'Snack'}!`);
      setFoodInfo(null);
      setMealName('');
      setQuantity(100);
      setUnit('grams');
    } catch (error) {
      console.error("Error adding to totals:", error);
      setError(error.message);
    } finally {
      setIsAddingToTotals(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const nutrientCategories = {
    macros: ['protein', 'fat', 'carbohydrate', 'carbs', 'fiber', 'sugars'],
    vitamins: ['vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k'],
    minerals: ['calcium', 'iron', 'magnesium', 'potassium', 'sodium'],
    fats: ['saturated_fat', 'monounsaturated_fatty_acids', 'polyunsaturated_fatty_acids', 'cholesterol']
  };

  const categorizeNutrients = (nutrition) => {
    const categorized = {};
    Object.entries(nutrientCategories).forEach(([category, keys]) => {
      categorized[category] = {};
      keys.forEach(key => {
        if (nutrition[key] !== undefined) {
          categorized[category][key] = nutrition[key];
        }
      });
    });
    return categorized;
  };

  return (
    <div className={styles.chatbotWindow}>
      <div className={styles.chatbotHeader}>
        <div className={styles.headerContent}>
          <div className={styles.botIcon}>🍏</div>
          <h3>Keto Nutrition Assistant</h3>
        </div>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close Chatbot">
          <FaTimes />
        </button>
      </div>

      <div className={styles.chatDisplay} ref={chatDisplayRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.botMessage}`}>
            <div className={styles.messageContent}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ))}

        {error && (
          <div className={styles.errorMessage}>
            <div className={styles.messageContent}>{error}</div>
          </div>
        )}

        {successMessage && (
          <div className={styles.successMessage}>
            <div className={styles.messageContent}>
              <FaCheck className={styles.successIcon} /> {successMessage}
            </div>
          </div>
        )}

        {foodInfo && foodInfo.nutrition && (
          <div className={styles.foodInfoContainer}>
            <h3 className={styles.foodInfoTitle}>
              {foodInfo.nutrition.name || inputValue}
            </h3>

            <div className={styles.nutritionGrid}>
              {Object.entries(categorizeNutrients(foodInfo.nutrition)).map(([category, nutrients]) => (
                <div key={category} className={styles.nutrientCategory}>
                  <h4 className={styles.categoryTitle}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                  </h4>
                  {Object.entries(nutrients).map(([key, value]) => (
                    <div key={key} className={styles.nutrientItem}>
                      <span className={styles.nutrientLabel}>
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                      </span>
                      <span className={styles.nutrientValue}>{value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {foodInfo.dietaryNotes && Object.keys(foodInfo.dietaryNotes).length > 0 && (
              <div className={styles.dietaryNotes}>
                <h4 className={styles.notesTitle}>Dietary Notes</h4>
                <ul className={styles.notesList}>
                  {Object.entries(foodInfo.dietaryNotes).map(([key, value]) => (
                    <li key={key} className={styles.noteItem}>
                      <strong>{key.replace(/\b\w/g, l => l.toUpperCase())}:</strong> {value || 'N/A'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.addToTotalsForm}>
              <h4 className={styles.addToTotalsTitle}>Add to Daily Totals</h4>
              <div className={styles.formGroup}>
                <label htmlFor="mealName" className={styles.formLabel}>Meal:</label>
                <input
                  type="text"
                  id="mealName"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter meal name"
                />
              </div>


              <div className={styles.quantityGroup}>
                <div className={styles.formGroup}>
                  <label htmlFor="quantity" className={styles.formLabel}>Quantity:</label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseFloat(e.target.value) || 1))}
                    min="1"
                    step="1"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="unit" className={styles.formLabel}>Unit:</label>
                  <select
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className={styles.formInput}
                  >
                    <option value="grams">Grams (g)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="count">Count</option>
                  </select>
                </div>
              </div>

              <button
                className={styles.addButton}
                onClick={handleAddToTotals}
                disabled={isAddingToTotals || !currentUser || !mealName}
              >
                {isAddingToTotals ? 'Adding...' : (
                  <>
                    <FaPlus /> Add to {mealName || 'Meal'}
                  </>
                )}
              </button>

              {!currentUser && (
                <p className={styles.loginPrompt}>
                  Please log in to add foods to your daily totals.
                </p>
              )}
            </div>
          </div>
        )}

        {isSending && (
          <div className={`${styles.message} ${styles.botMessage}`}>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.chatInputArea}>
        <textarea
          placeholder="Ask about any food's nutrition..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Chatbot Input"
          disabled={isSending}
          rows={1}
          className={styles.chatInput}
        />
        <button
          onClick={handleSendMessage}
          disabled={isSending || !inputValue.trim()}
          className={styles.sendButton}
          aria-label="Send Message"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}

export default ChatbotWindow;