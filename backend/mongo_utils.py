from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get connection string from environment variable
MONGO_URI = os.getenv('MONGO_URI')
if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable not set. Please check your .env file.")

DATABASE_NAME = 'test' # Your desired database name
# Define both collection names that you want to query
COLLECTION_NAME_1 = 'cleaned_nutrition_data_anuvaad'
COLLECTION_NAME_2 = 'cleaned_nutrition_data2'

client = None
db = None # db will hold the database object

def connect_to_mongodb():
    """Establishes and returns a connection to MongoDB Atlas and the database object."""
    global client, db # We only need 'client' and 'db' to be global
    if client is None: # Check if client is None
        try:
            client = MongoClient(MONGO_URI)
            # The ismaster command is cheap and does not require auth.
            client.admin.command('ismaster')
            db = client[DATABASE_NAME] # Assign the database object
            print(f"Successfully connected to MongoDB Atlas and database '{DATABASE_NAME}'!")
        except ConnectionFailure as e:
            print(f"MongoDB connection error: {e}")
            client = None
            db = None
            raise Exception("Failed to connect to MongoDB. Check connection string and network access.")
        except OperationFailure as e:
            print(f"MongoDB authentication/operation error: {e}")
            client = None
            db = None
            raise Exception("Failed to authenticate with MongoDB. Check credentials or permissions.")
    return db # Return the database object

def add_nutrition_item_mongo(collection_name: str, data: dict) -> bool:
    """
    Adds a nutrition item to a specified MongoDB collection.
    If an item with the same name exists, it updates it (upsert).
    """
    try:
        current_db = connect_to_mongodb()
        if current_db is None: # Corrected check: compare with None
            print(f"Cannot add to '{collection_name}': Database connection not established.")
            return False
        
        collection = current_db[collection_name] # Get the specific collection
        
        # Using update_one with upsert=True to insert if not exists, or update if it does.
        # Assumes 'name' is the primary identifier for uniqueness.
        result = collection.update_one(
            {'name': data['name']},
            {'$set': data},
            upsert=True
        )
        if result.upserted_id:
            print(f"Inserted new item into '{collection_name}': {data['name']} with ID {result.upserted_id}")
        elif result.modified_count > 0:
            print(f"Updated existing item in '{collection_name}': {data['name']}")
        else:
            print(f"No changes for item in '{collection_name}': {data['name']}")
        return True
    except Exception as e:
        print(f"Error adding/updating nutrition item to MongoDB collection '{collection_name}': {e}")
        return False

def get_nutrition_by_name_mongo(name: str) -> dict | None:
    """
    Retrieves nutrition data from MongoDB by food name.
    It will attempt to find the item in 'cleaned_nutrition_data_anuvaad' first,
    then in 'cleaned_nutrition_data2' if not found in the first.
    Performs a case-insensitive, partial match.
    """
    current_db = connect_to_mongodb()
    if current_db is None: # Corrected check: compare with None
        print("Cannot retrieve: Database connection not established.")
        return None

    collections_to_query = [COLLECTION_NAME_1, COLLECTION_NAME_2] # List of collections to check

    for collection_name in collections_to_query:
        try:
            collection = current_db[collection_name] # Get the specific collection
            # Using regex for case-insensitive partial match
            query = {'name': {'$regex': name, '$options': 'i'}}
            item = collection.find_one(query)
            
            if item:
                print(f"Found '{item.get('name')}' in collection: {collection_name}")
                # Convert ObjectId to string for JSON serialization
                if '_id' in item:
                    item['_id'] = str(item['_id'])
                return item # Return the first item found
        except Exception as e:
            print(f"Error retrieving from collection '{collection_name}' for '{name}': {e}")
            # Continue to the next collection if there's an error with one
            
    print(f"Nutrition data for '{name}' not found in any specified collection.")
    return None # Return None if not found in any collection

if __name__ == '__main__':
    print("--- Attempting to connect and populate MongoDB ---")
    try:
        # Call connect_to_mongodb to establish the connection and set the global 'db'
        # The 'if db is None' check within connect_to_mongodb ensures it only connects once.
        connect_to_mongodb() 
        
        # We need to specify which collection to add sample data to
        # Ensure 'db' is not None before attempting to add data
        if db is not None: # Final check before trying to add data
            sample_data_1 = [
                {
                    'name': 'Apple',
                    'calories': 95, 'protein': 0.5, 'fat': 0.3, 'carbohydrates': 25,
                    'sugars': 19, 'fiber': 4.4, 'serving_size': 1, 'serving_unit': 'medium'
                },
                {
                    'name': 'Banana',
                    'calories': 105, 'protein': 1.3, 'fat': 0.3, 'carbohydrates': 27,
                    'sugars': 14, 'fiber': 3.1, 'serving_size': 1, 'serving_unit': 'medium'
                }
            ]
            
            sample_data_2 = [
                {
                    'name': 'Chicken Breast',
                    'calories': 165, 'protein': 31, 'fat': 3.6, 'carbohydrates': 0,
                    'sugars': 0, 'fiber': 0, 'serving_size': 100, 'serving_unit': 'g'
                },
                {
                    'name': 'White Rice',
                    'calories': 130, 'protein': 2.7, 'fat': 0.3, 'carbohydrates': 28,
                    'sugars': 0, 'fiber': 0.4, 'serving_size': 100, 'serving_unit': 'g cooked'
                },
                {
                    'name': 'Pizza',
                    'calories': 285, 'protein': 12, 'fat': 10, 'carbohydrates': 36,
                    'sugars': 3, 'fiber': 2, 'serving_size': 1, 'serving_unit': 'slice'
                },
                {
                    'name': 'Avocado',
                    'calories': 160, 'protein': 2, 'fat': 15, 'carbohydrates': 9,
                    'sugars': 0.7, 'fiber': 6.7, 'serving_size': 1, 'serving_unit': 'medium'
                }
            ]

            print(f"\nAdding/Updating sample data to '{COLLECTION_NAME_1}'...")
            for item in sample_data_1:
                add_nutrition_item_mongo(COLLECTION_NAME_1, item)
            
            print(f"\nAdding/Updating sample data to '{COLLECTION_NAME_2}'...")
            for item in sample_data_2:
                add_nutrition_item_mongo(COLLECTION_NAME_2, item)
            
            print("Sample data addition/update complete.")

            print("\n--- Testing retrieval from both collections ---")
            print(f"Retrieving 'Apple' (should be from {COLLECTION_NAME_1}): {get_nutrition_by_name_mongo('apple')}")
            print(f"Retrieving 'chicken' (should be from {COLLECTION_NAME_2}): {get_nutrition_by_name_mongo('chicken')}")
            print(f"Retrieving 'banana' (should be from {COLLECTION_NAME_1}): {get_nutrition_by_name_mongo('banana')}")
            print(f"Retrieving 'Avocado' (should be from {COLLECTION_NAME_2}): {get_nutrition_by_name_mongo('Avocado')}")
            print(f"Retrieving 'Pasta' (should be None): {get_nutrition_by_name_mongo('pasta')}")
        else:
            print("Skipping data population due to connection failure.")
    except Exception as e:
        print(f"Failed during MongoDB utility execution: {e}")