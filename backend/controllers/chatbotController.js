const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const chatbotController = {
  handleChatMessage: async (req, res) => {
    const { message } = req.body;
    try {
      let prompt;
      if (message.toLowerCase().includes('ingredients')) {
        prompt = `You are a helpful chatbot for a food calorie tracking app. When a user asks about a food, you should provide information about its nutritional content (calories, fat, saturated fat, cholesterol, sodium, vitamins A, C, D, E, K, calcium, iron, magnesium, potassium, protein, carbohydrates, fiber, sugars, monounsaturated fatty acids, polyunsaturated fatty acids) if available, AND also list the basic ingredients typically used to prepare it, if known.

If the user asks for an ingredient name in a local Indian language, try to provide it if you know it. If not, respond with "Not available in [language name]".

Present the nutritional information in a raw key-value format as shown in the example, followed by the ingredients (if requested), and then a summary of its dietary suitability based on the available 'tags' and 'dairy' information.

Example interaction:

User: Hot tea (Garam Chai) ingredients
Chatbot:
name: "Hot tea (Garam Chai)"
calories: 16.14
fat: 0.53
saturated_fat: 321.5
cholesterol: 0
sodium: 3.12
vitamin_a: 0
vitamin_c: 0.24
vitamin_d: 0
vitamin_e: 0.03
vitamin_k: 0
calcium: 14.2
iron: 0.02
magnesium: 1.04
potassium: 13.95
protein: 0.39
carbohydrate: 2.58
fiber: 0
sugars: 2.58
monounsaturated_fatty_acids: 144.18
polyunsaturated_fatty_acids: 16.39
name_cleaned: "hot tea garam chai"
tags: "veg"
dairy: "dairy"
---
Basic Ingredients: Water, tea leaves, milk, sugar, ginger, cardamom.
Dietary Notes:
Vegetarian: Yes (based on tags: veg)
Vegan: No (contains dairy)
Contains Dairy: Yes

User: Apple ingredients
Chatbot:
name: "Apple"
calories: 95
fat: 0.3
saturated_fat: 0
cholesterol: 0
sodium: 1
vitamin_a: 98
vitamin_c: 8
vitamin_d: 0
vitamin_e: 0.2
vitamin_k: 2
calcium: 5
iron: 0.2
magnesium: 5
potassium: 107
protein: 0.3
carbohydrate: 25
fiber: 4
sugars: 19
monounsaturated_fatty_acids: 0.01
polyunsaturated_fatty_acids: 0.05
---
Basic Ingredients: Apple.
Dietary Notes:
Vegetarian: Yes (naturally)
Vegan: Yes (naturally)
Contains Dairy: No

User: Turmeric in Hindi
Chatbot: Not available in Hindi.

User: ${message}`;
      } else if (
        message.toLowerCase().includes('password') ||
        message.toLowerCase().includes('username') ||
        message.toLowerCase().includes('settings') ||
        message.toLowerCase().includes('email') ||
        message.toLowerCase().includes('forget')
      ) {
        if (message.toLowerCase().includes('change password') || message.toLowerCase().includes('change username')) {
          prompt = `Okay! To change your password or username, please navigate to the 'Settings' section within the app. You should find the options there.`;
        } else if (message.toLowerCase().includes('see stats') || message.toLowerCase().includes('progress over time') || message.toLowerCase().includes('historic stats')) {
          prompt = `To view your stats over time and track your progress, head over to the 'Your Progress' section in the hamburger menu at the top. You'll find detailed insights there!`;
        } else if (message.toLowerCase().includes('see my daily meals') || message.toLowerCase().includes('meal history')) {
          prompt = `You can see your daily meals and meal history by going to the 'Daily Macros' section, which you can find in the hamburger menu at the top of the app.`;
        } else if (message.toLowerCase().includes('forget password') || message.toLowerCase().includes('reset password')) {
          prompt = `No worries! If you've forgotten your password, you can reset it in the 'Settings' tab. Just look for the 'Forgot Password' option and follow the instructions, you'll need your registered email address.`;
        } else if (message.toLowerCase().includes('forget my registered email')) {
          prompt = `Hmm, that can happen! If you've forgotten your registered email, please send us a message via the 'Contact Us' form (you can find it in the hamburger menu) with any email address, username, or date of birth you remember. Our support team will help you out.`;
        } else {
          prompt = `Are you looking to change your password, username, or something else related to your account settings? Please be a bit more specific so I can guide you better!`;
        }
      } else if (message.toLowerCase().includes('add meal')) {
        prompt = `There are a few convenient ways to add your meals! You can:
1. Manually search for the food item.
2. Upload a picture of your meal or scan a barcode.
3. Simply describe your meal to me, and I'll do my best to log it for you!`;
      } else if (
        message.toLowerCase().includes('problem') ||
        message.toLowerCase().includes('issue') ||
        message.toLowerCase().includes('help') ||
        message.toLowerCase().includes('not working')
      ) {
        prompt = `Oh no! Sorry to hear you're facing a problem. For any technical issues or other problems, please reach out to us through the 'Contact Us' option in the hamburger menu. Our support team is ready to assist you!`;
      } else {
        prompt = `You are a helpful chatbot for a food calorie tracking app. When a user asks about a food, you should provide information about its nutritional content (calories, fat, saturated fat, cholesterol, sodium, vitamins A, C, D, E, K, calcium, iron, magnesium, potassium, protein, carbohydrates, fiber, sugars, monounsaturated fatty acids, polyunsaturated fatty acids) if available.

Additionally, you should analyze the provided nutritional information (specifically looking at 'tags', 'dairy') to determine if the food is likely to be vegan or vegetarian. You should also mention if it contains dairy, which is a common allergen/intolerance.

Present the information in a raw key-value format as shown in the example, and then provide a summary of its dietary suitability based on the available 'tags' and 'dairy' information.

Example interaction:

User: Hot tea (Garam Chai)
Chatbot:
name: "Hot tea (Garam Chai)"
calories: 16.14
fat: 0.53
saturated_fat: 321.5
cholesterol: 0
sodium: 3.12
vitamin_a: 0
vitamin_c: 0.24
vitamin_d: 0
vitamin_e: 0.03
vitamin_k: 0
calcium: 14.2
iron: 0.02
magnesium: 1.04
potassium: 13.95
protein: 0.39
carbohydrate: 2.58
fiber: 0
sugars: 2.58
monounsaturated_fatty_acids: 144.18
polyunsaturated_fatty_acids: 16.39
name_cleaned: "hot tea garam chai"
tags: "veg"
dairy: "dairy"
---
Dietary Notes:
Vegetarian: Yes (based on tags: veg)
Vegan: No (contains dairy)
Contains Dairy: Yes

User: Apple
Chatbot:
name: "Apple"
calories: 95
fat: 0.3
saturated_fat: 0
cholesterol: 0
sodium: 1
vitamin_a: 98
vitamin_c: 8
vitamin_d: 0
vitamin_e: 0.2
vitamin_k: 2
calcium: 5
iron: 0.2
magnesium: 5
potassium: 107
protein: 0.3
carbohydrate: 25
fiber: 4
sugars: 19
monounsaturated_fatty_acids: 0.01
polyunsaturated_fatty_acids: 0.05
---
Dietary Notes:
Vegetarian: Yes (naturally)
Vegan: Yes (naturally)
Contains Dairy: No

User: ${message}`;
      }

      const result = await model.generateContent(prompt);
      const response = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      res.json({ response });
    } catch (error) {
      console.error('Error generating chatbot response:', error);
      res.status(500).json({ error: 'Failed to generate chatbot response.' });
    }
  },

  getFoodNutrition: async (req, res) => {
    const { foodName } = req.params;

    try {
      // Assume getNutritionalInfo also fetches basic ingredients and potentially tags/dairy
      const nutritionData = await getNutritionalInfo(foodName);
      if (nutritionData) {
        const formattedNutrition = {
          name: nutritionData.name,
          calories: nutritionData.calories,
          protein: nutritionData.protein,
          fat: nutritionData.fat,
          saturated_fat: nutritionData.saturated_fat,
          cholesterol: nutritionData.cholesterol,
          sodium: nutritionData.sodium,
          vitamin_a: nutritionData.vitamin_a,
          vitamin_c: nutritionData.vitamin_c,
          vitamin_d: nutritionData.vitamin_d,
          vitamin_e: nutritionData.vitamin_e,
          vitamin_k: nutritionData.vitamin_k,
          calcium: nutritionData.calcium,
          iron: nutritionData.iron,
          magnesium: nutritionData.magnesium,
          potassium: nutritionData.potassium,
          carbohydrate: nutritionData.carbohydrate || nutritionData.carbs, // Handle potential key differences
          fiber: nutritionData.fiber,
          sugars: nutritionData.sugars,
          monounsaturated_fatty_acids: nutritionData.monounsaturated_fatty_acids,
          polyunsaturated_fatty_acids: nutritionData.polyunsaturated_fatty_acids,
          name_cleaned: nutritionData.name_cleaned,
          tags: nutritionData.tags,
          dairy: nutritionData.dairy,
          ingredients: nutritionData.ingredients // Assuming ingredients are also fetched
        };
        res.json(formattedNutrition);
      } else {
        res.status(404).json({ message: 'Nutritional information not found for this food.' });
      }
    } catch (error) {
      console.error('Error fetching nutritional information:', error);
      res.status(500).json({ error: 'Failed to fetch nutritional information.' });
    }
  },
};

module.exports = chatbotController;