from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from mongo_utils import get_nutrition_by_name_mongo, connect_to_mongodb
import random # Keep for dummy if you want to test without a full ML model loaded
# import tensorflow as tf # Uncomment if using TensorFlow/Keras
# from PIL import Image # For image processing (Pillow library)
# import numpy as np # For numerical operations with images

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Define the path where uploaded images will be temporarily stored
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- Load your ML Model (Once when the app starts) ---
# IMPORTANT: Replace this section with your actual model loading logic
# This assumes your model outputs a food category/class name directly.

# Example for a TensorFlow/Keras model:
# model = None
# try:
#     # Adjust 'path/to/your_model.h5' or 'path/to/your_saved_model_directory'
#     # For .h5 file:
#     # model = tf.keras.models.load_model('path/to/your_model.h5')
#     # For SavedModel directory:
#     # model = tf.keras.models.load_model('path/to/your_saved_model_directory')
#     print("ML Model loaded successfully!")
# except Exception as e:
#     print(f"Error loading ML Model: {e}. Running with dummy model.")
#     model = None # Ensure model is None if loading fails

# Example for a PyTorch model (simplified):
# import torch
# from your_model_architecture import YourModelClass # You need to import your model definition
# model = None
# try:
#     # model = YourModelClass(...) # Initialize your model architecture
#     # model.load_state_dict(torch.load('path/to/your_model_weights.pth'))
#     # model.eval() # Set to evaluation mode
#     print("PyTorch Model loaded successfully!")
# except Exception as e:
#     print(f"Error loading PyTorch Model: {e}. Running with dummy model.")
#     model = None

# Define your class names/labels in the same order as your model predicts
# Example:
# FOOD_CLASSES = ['apple', 'banana', 'chicken breast', 'pizza', 'white rice', 'avocado', ...]

# --- Ensure MongoDB connection is attempted when the app starts ---
try:
    connect_to_mongodb()
except Exception as e:
    print(f"Application failed to start due to MongoDB connection issue: {e}")
    # In a production app, you might want to exit here:
    # import sys
    # sys.exit(1)

# --- ML Model Inference Function ---
# REPLACE THIS WITH YOUR ACTUAL ML MODEL'S INFERENCE LOGIC
def analyze_image_for_name(image_path: str) -> str | None:
    """
    Processes the image using the loaded ML model and returns the recognized food name.
    """
    print(f"ML Model: Processing image from {image_path}")

    # --- Your actual ML model inference code goes here ---
    # This is where you would load the image, preprocess it, and run your model.

    # Example for TensorFlow/Keras:
    # if model:
    #     try:
    #         img = Image.open(image_path).convert('RGB')
    #         img = img.resize((YOUR_MODEL_INPUT_WIDTH, YOUR_MODEL_INPUT_HEIGHT)) # Resize to your model's expected input
    #         img_array = tf.keras.preprocessing.image.img_to_array(img)
    #         img_array = np.expand_dims(img_array, axis=0) # Create a batch dimension
    #         # Apply any normalization your model needs (e.g., / 255.0)
    #         # img_array = img_array / 255.0

    #         predictions = model.predict(img_array)
    #         predicted_class_index = np.argmax(predictions[0])
    #         predicted_food_name = FOOD_CLASSES[predicted_class_index]
    #         print(f"ML Model Prediction: {predicted_food_name}")
    #         return predicted_food_name
    #     except Exception as e:
    #         print(f"Error during ML model prediction: {e}")
    #         return None # Model couldn't process or predict
    # else:
    #     print("ML Model not loaded, falling back to dummy analysis.")

    # --- Dummy Model (Fallback if actual model isn't loaded or for testing) ---
    # Keep this for development or if your model isn't ready
    filename = os.path.basename(image_path).lower()
    if 'pizza' in filename:
        return 'Pizza'
    elif 'apple' in filename:
        return 'Apple'
    elif 'chicken' in filename:
        return 'Chicken Breast'
    elif 'banana' in filename:
        return 'Banana'
    elif 'avocado' in filename:
        return 'Avocado'
    else:
        # Simulate your model making a prediction from the sample data in mongo_utils
        # Use the names that exist in your MongoDB 'test' database for better consistency
        # Based on your mongo_utils.py output:
        recognized_foods_in_db = [
            'Pineapple milkshake (Ananas milkshake)',
            'Banana milkshake (Kele milkshake)',
            'Chicken sandwich',
            'White Rice', # If this was added to cleaned_nutrition_data2
            'Pizza',      # If this was added to cleaned_nutrition_data2
            'Oil, avocado',
            'Pasta hot pot'
        ]
        if random.random() < 0.8: # 80% chance of recognizing something
            return random.choice(recognized_foods_in_db)
        else:
            return None # Model couldn't recognize it or low confidence


# --- API Route for Image Analysis ---
@app.route('/api/images/analyze-image', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    image_file = request.files['image']

    if image_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filepath = None
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], image_file.filename)
        image_file.save(filepath)

        # Step 1: Use your ML model to get the food name
        food_name_from_model = analyze_image_for_name(filepath)

        if not food_name_from_model:
            return jsonify({'error': 'Could not identify a food item in the image. Please try another image.'}), 404

        # Step 2: Query your nutrition database (MongoDB Atlas) using the identified name
        nutrition_data = get_nutrition_by_name_mongo(food_name_from_model)

        if not nutrition_data:
            return jsonify({
                'error': f'Nutrition data for "{food_name_from_model}" not found in our database.',
                'recognized_name': food_name_from_model
            }), 404
        
        # Step 3: Format the data for the frontend
        # Ensure numerical fields are floats or 'N/A' to avoid issues on frontend
        # The frontend will parse these with parseFloat
        formatted_nutrition = {
            'name': nutrition_data.get('name', 'N/A'),
            'calories': float(nutrition_data.get('calories', 0)) if nutrition_data.get('calories') not in [None, 'N/A'] else 'N/A',
            'protein': float(nutrition_data.get('protein', 0)) if nutrition_data.get('protein') not in [None, 'N/A'] else 'N/A',
            'fat': float(nutrition_data.get('fat', 0)) if nutrition_data.get('fat') not in [None, 'N/A'] else 'N/A',
            'carbohydrates': float(nutrition_data.get('carbohydrate', nutrition_data.get('carbohydrates', 0))) if nutrition_data.get('carbohydrate') not in [None, 'N/A'] or nutrition_data.get('carbohydrates') not in [None, 'N/A'] else 'N/A', # Handle both 'carbohydrate' and 'carbohydrates'
            'sugars': float(nutrition_data.get('sugars', 0)) if nutrition_data.get('sugars') not in [None, 'N/A'] else 'N/A',
            'fiber': float(nutrition_data.get('fiber', 0)) if nutrition_data.get('fiber') not in [None, 'N/A'] else 'N/A',
            'serving_size': float(nutrition_data.get('serving_size', 1)) if nutrition_data.get('serving_size') not in [None, 'N/A'] else 'N/A',
            'serving_unit': nutrition_data.get('serving_unit', 'serving'),
            # Add other relevant fields from your MongoDB documents
            'cholesterol': float(nutrition_data.get('cholesterol', 0)) if nutrition_data.get('cholesterol') not in [None, 'N/A'] else 'N/A',
            'sodium': float(nutrition_data.get('sodium', 0)) if nutrition_data.get('sodium') not in [None, 'N/A'] else 'N/A',
            'vitamin_a': float(nutrition_data.get('vitamin_a', 0)) if nutrition_data.get('vitamin_a') not in [None, 'N/A'] else 'N/A',
            'vitamin_c': float(nutrition_data.get('vitamin_c', 0)) if nutrition_data.get('vitamin_c') not in [None, 'N/A'] else 'N/A',
            'vitamin_d': float(nutrition_data.get('vitamin_d', 0)) if nutrition_data.get('vitamin_d') not in [None, 'N/A'] else 'N/A',
            'vitamin_e': float(nutrition_data.get('vitamin_e', 0)) if nutrition_data.get('vitamin_e') not in [None, 'N/A'] else 'N/A',
            'vitamin_k': float(nutrition_data.get('vitamin_k', 0)) if nutrition_data.get('vitamin_k') not in [None, 'N/A'] else 'N/A',
            'calcium': float(nutrition_data.get('calcium', 0)) if nutrition_data.get('calcium') not in [None, 'N/A'] else 'N/A',
            'iron': float(nutrition_data.get('iron', 0)) if nutrition_data.get('iron') not in [None, 'N/A'] else 'N/A',
            'magnesium': float(nutrition_data.get('magnesium', 0)) if nutrition_data.get('magnesium') not in [None, 'N/A'] else 'N/A',
            'potassium': float(nutrition_data.get('potassium', 0)) if nutrition_data.get('potassium') not in [None, 'N/A'] else 'N/A',
            # You might have 'total_fat' and 'fat', ensure consistency
            'saturated_fat': float(nutrition_data.get('saturated_fat', 0)) if nutrition_data.get('saturated_fat') not in [None, 'N/A'] else 'N/A',
            'monounsaturated_fatty_acids': float(nutrition_data.get('monounsaturated_fatty_acids', 0)) if nutrition_data.get('monounsaturated_fatty_acids') not in [None, 'N/A'] else 'N/A',
            'polyunsaturated_fatty_acids': float(nutrition_data.get('polyunsaturated_fatty_acids', 0)) if nutrition_data.get('polyunsaturated_fatty_acids') not in [None, 'N/A'] else 'N/A',
            'name_cleaned': nutrition_data.get('name_cleaned', 'N/A'),
            'tags': nutrition_data.get('tags', 'N/A'),
            'dairy': nutrition_data.get('dairy', 'N/A'),
        }
        # Filter out keys with 'N/A' if they were originally 'N/A' or empty strings in the DB
        # This makes the response cleaner for the frontend.
        final_nutrition_info = {k: v for k, v in formatted_nutrition.items() if v != 'N/A'}


        # The frontend expects a quantity and unit from the backend.
        # If your ML model *cannot* predict quantity/volume, you'll need to decide:
        # 1. Use a default (e.g., 1 serving)
        # 2. Add an input field on the frontend for the user to specify quantity.
        # For now, we'll keep the existing default if not provided by DB.
        final_nutrition_info['quantity'] = final_nutrition_info.get('serving_size', 1)
        final_nutrition_info['unit'] = final_nutrition_info.get('serving_unit', 'serving')
        
        # Ensure 'fat' is used, and 'total_fat' is handled if it exists
        if 'total_fat' in nutrition_data and nutrition_data.get('fat') == 'N/A':
            final_nutrition_info['fat'] = float(nutrition_data.get('total_fat', 0)) if nutrition_data.get('total_fat') not in [None, 'N/A'] else 'N/A'

        return jsonify(final_nutrition_info), 200

    except Exception as e:
        print(f"Error during image analysis or database lookup: {e}")
        return jsonify({'error': f'An internal server error occurred: {str(e)}'}), 500
    finally:
        if filepath and os.path.exists(filepath):
            try:
                os.remove(filepath)
                print(f"Cleaned up temporary file: {filepath}")
            except OSError as e:
                print(f"Error removing file {filepath}: {e}")

# --- API Route for Adding to Daily Totals ---
# This route assumes you have a separate collection for user-specific daily intake.
# You'd typically verify Firebase Auth tokens here.
@app.route('/api/daily-totals/add', methods=['POST'])
def add_to_daily_totals():
    data = request.get_json()
    print("Received data for daily totals:", data)
    
    # In a real application, you would:
    # 1. Verify user authentication (e.g., using Firebase Admin SDK and 'Authorization' header)
    #    For simplicity, skipping actual token verification here.
    # 2. Store the `foodItem` data in a separate MongoDB collection (e.g., 'daily_intake')
    #    associated with the `userId`, `mealName`, and `date`.
    
    food_item = data.get('foodItem', {})
    user_id = data.get('userId')
    meal_name = data.get('mealName')
    date = data.get('date')

    if not user_id or not food_item.get('name'):
        return jsonify({'error': 'Missing user ID or food item name'}), 400

    # Example of how you might save this in MongoDB to a different collection
    # (You would define a new collection in mongo_utils or directly here)
    # Assuming `daily_totals_collection` is a pymongo collection object
    try:
        from mongo_utils import db as main_db # Access the main db connection
        from datetime import datetime
        if main_db is not None: # Use 'is not None' for database objects
            daily_totals_collection = main_db['daily_intake'] # Example collection for daily totals
            
            # Ensure numerical fields are floats before saving
            processed_food_item = {k: v for k, v in food_item.items()}
            for key in ['calories', 'protein', 'fat', 'carbs', 'quantity', 'sugars', 'fiber', 'cholesterol', 'sodium', 'vitamin_a', 'vitamin_b12', 'vitamin_b6', 'vitamin_c', 'vitamin_d', 'vitamin_e', 'vitamin_k', 'calcium', 'iron', 'magnesium', 'potassium', 'saturated_fat', 'monounsaturated_fatty_acids', 'polyunsaturated_fatty_acids']:
                value = processed_food_item.get(key)
                if value is not None and value != 'N/A':
                    try:
                        processed_food_item[key] = float(value)
                    except (ValueError, TypeError):
                        processed_food_item[key] = 0.0 # Default to 0.0 if conversion fails
                else:
                    processed_food_item[key] = 0.0 # Default to 0.0 if missing or 'N/A'


            record = {
                'userId': user_id,
                'mealName': meal_name,
                'date': date, # Store as string for simple date queries, or convert to datetime object if more complex date filtering is needed
                'foodItem': processed_food_item,
                'timestamp': datetime.utcnow()
            }
            daily_totals_collection.insert_one(record)
            print(f"Daily total added for user {user_id}: {processed_food_item.get('name')}")
        else:
            print("MongoDB database not connected, cannot add daily total.")
            return jsonify({'error': 'Backend database not ready.'}), 500

        return jsonify({'message': f"Food item '{food_item.get('name', 'N/A')}' added to daily totals successfully!"}), 200
    except Exception as e:
        print(f"Error adding to daily totals: {e}")
        return jsonify({'error': 'Failed to add item to daily totals'}), 500


# --- Run the Flask App ---
if __name__ == '__main__':
    # port = int(os.getenv('PORT', 5001))
    app.run(debug=True, port=5001)