// controllers/searchController.js
const mongoose = require('mongoose');
const axios = require('axios');

// USDA API configuration
const USDA_API_KEY = process.env.USDA_API_KEY || '324g4DezR9rEmonIVetABIbppkzddawO3lphCT5n';
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

// Collection configurations
const COLLECTIONS = {
    ANUVAAD: {
        name: 'cleaned_nutrition_data_anuvaad',
        priority: 1.5,
        nameFields: ['name', 'local_name'],
        nutrientMapping: {
            calories: 'calories',
            protein: 'protein',
            fat: 'fat',
            carbs: 'carbohydrate',
            fiber: 'fiber',
            sugars: 'sugars',
            sodium: 'sodium',
            cholesterol: 'cholesterol',
            vitamin_a: 'vitamin_a',
            vitamin_c: 'vitamin_c',
            calcium: 'calcium',
            iron: 'iron'
        }
    },
    INDIA528: {
        name: 'processed_nutrition_data_columns',
        priority: 1.2,
        nameFields: ['food_name_name','local_lang1','local_lang2','local_lang3','local_lang4','local_lang5','local_lang6','local_lang7','local_lang8','local_lang9','local_lang10','local_lang11','local_lang12','local_lang13','local_lang14','local_lang15','local_lang16','local_lang17','local_lang18','local_lang19'],
        nutrientMapping: {
            calories: 'energy_enerc',
            protein: 'protein_protcnt',
            fat: 'total_fat_fatce',
            carbs: 'carbohydrate_choavldf',
            fiber: 'dietary_fiber_fibtg',
            sugars: 'free_sugars_fsugar',
            sodium: 'sodium_na_na',
            cholesterol: 'cholesterol_cholc',
            vitamin_a: 'vitamin_a_vita',
            vitamin_c: 'ascorbic_acids_c_vitc',
            calcium: 'calcium_ca_ca',
            iron: 'iron_fe_fe'
        }
    },
    DATA2: {
        name: 'cleaned_nutrition_data2',
        priority: 1.0,
        nameFields: ['name'],
        nutrientMapping: {
            calories: 'calories',
            protein: 'protein',
            fat: 'total_fat',
            carbs: 'carbohydrate',
            fiber: 'fiber',
            sugars: 'sugars',
            sodium: 'sodium',
            cholesterol: 'cholesterol',
            vitamin_a: 'vitamin_a',
            vitamin_c: 'vitamin_c',
            calcium: 'calcium',
            iron: 'irom' // Note: Typo in original data
        },
        valueCleaners: {
            sodium: val => parseFloat(val.toString().replace(' mg', '').trim()),
            total_fat: val => parseFloat(val.toString().replace('g', '').trim()),
            // Add other cleaners as needed
        }
    }
};

// Helper functions
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const parseNumber = (val) => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(/[^\d.-]/g, '')) || 0;
};

const searchUSDA = async (query) => {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        console.error('Invalid query parameter: must be a non-empty string.');
        return [];
    }

    try {
        // Correctly encode the dataType array
        const response = await axios.get(USDA_API_URL, {
            params: {
                api_key: USDA_API_KEY,
                query: query.trim(), // Raw query string
                pageSize: 5,
                // Use repeated parameters for arrays
                dataType: ["Survey (FNDDS)"],
            },
            paramsSerializer: (params) => {
                // Serialize array params in the format `key=value1&key=value2`
                return Object.entries(params)
                    .map(([key, value]) => {
                        if (Array.isArray(value)) {
                            return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
                        }
                        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
                    })
                    .join('&');
            }
        });

        if (!response.data.foods || !Array.isArray(response.data.foods)) {
            console.error('Unexpected USDA API response:', response.data);
            return [];
        }

        return response.data.foods.map(food => ({
            source: 'USDA',
            name: food.description,
            nutrients: food.foodNutrients.reduce((acc, nutrient) => {
                const mapping = {
                    'Energy': 'calories',
                    'Protein': 'protein',
                    'Total lipid (fat)': 'fat',
                    'Carbohydrate, by difference': 'carbs',
                    'Fiber, total dietary': 'fiber',
                    'Sugars, total including NLEA': 'sugars',
                    'Sodium, Na': 'sodium',
                    'Cholesterol': 'cholesterol',
                    'Vitamin A, IU': 'vitamin_a',
                    'Vitamin C, total ascorbic acid': 'vitamin_c',
                    'Calcium, Ca': 'calcium',
                    'Iron, Fe': 'iron'
                };

                if (mapping[nutrient.nutrientName]) {
                    acc[mapping[nutrient.nutrientName]] = nutrient.value;
                }
                return acc;
            }, {})
        }));
    } catch (error) {
        console.error('USDA API error:', error.response?.data || error.message);
        return [];
    }
};


const formatResult = (result, collectionConfig) => {
    const formatted = {
        _id: result._id,
        source: collectionConfig.name,
        name: collectionConfig.nameFields.map(f => result[f]).find(Boolean) || 'Unknown'
    };

    // Map and clean nutrients
    Object.entries(collectionConfig.nutrientMapping).forEach(([standardName, sourceName]) => {
        let value = result[sourceName];
        
        // Apply custom cleaner if exists
        if (collectionConfig.valueCleaners && collectionConfig.valueCleaners[sourceName]) {
            value = collectionConfig.valueCleaners[sourceName](value);
        }
        
        formatted[standardName] = parseNumber(value);
    });

    return formatted;
};

const searchFood = async (req, res) => {
    try {
        const { query, limit = 10, includeUSDA = true } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        const parsedLimit = parseInt(limit);
        if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 20) {
            return res.status(400).json({ error: 'Limit must be a number between 1 and 20' });
        }

        const escapedQuery = escapeRegex(query);
        let allResults = [];
        const searchPromises = [];

        // Search all collections in parallel
        for (const [key, config] of Object.entries(COLLECTIONS)) {
            const collection = mongoose.connection.collection(config.name);
            
            // Build $or conditions for all name fields
            const nameConditions = config.nameFields.map(field => ({
                [field]: { $regex: escapedQuery, $options: 'i' }
            }));

            searchPromises.push(
                collection.find({ $or: nameConditions })
                    .limit(Math.ceil(parsedLimit * 1.5))
                    .toArray()
                    .then(results => {
                        return results.map(result => ({
                            ...formatResult(result, config),
                            priority: config.priority * (
                                config.nameFields.some(field => 
                                    new RegExp(`^${escapedQuery}`, 'i').test(result[field])
                                ) ? 1.2 : 1
                            )
                        }));
                    })
                    .catch(err => {
                        console.error(`Error searching ${config.name}:`, err);
                        return [];
                    })
            );
        }

        // Add USDA search if enabled
        if (includeUSDA) {
            searchPromises.push(
                searchUSDA(query).then(usdaResults =>
                    usdaResults.map(result => ({
                        ...result,
                        priority: 0.8 // Lower priority than local databases
                    }))
                )
            );
        }

        // Wait for all searches to complete
        const results = await Promise.all(searchPromises);
        allResults = results.flat();

        // Sort by priority and name
        allResults.sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            return a.name.localeCompare(b.name);
        });

        // Remove duplicates (same name from different sources)
        const uniqueResults = [];
        const seenNames = new Set();

        for (const result of allResults) {
            const normalizedName = result.name.toLowerCase().trim();
            if (!seenNames.has(normalizedName)) {
                seenNames.add(normalizedName);
                uniqueResults.push(result);
                if (uniqueResults.length >= parsedLimit) break;
            }
        }

        res.json(uniqueResults.slice(0, parsedLimit));
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: err.message
        });
    }
};

const getSuggestions = async (req, res) => {
    try {
        const { query, limit = 5 } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        const parsedLimit = parseInt(limit);
        if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 20) {
            return res.status(400).json({ error: 'Limit must be a number between 1 and 20' });
        }

        const escapedQuery = escapeRegex(query);
        const suggestions = new Set();
        
        // Search strategy: startsWith > wordBoundary > contains
        const searchPatterns = [
            { regex: `^${escapedQuery}`, priority: 3 },
            { regex: `\\b${escapedQuery}`, priority: 2 },
            { regex: escapedQuery, priority: 1 }
        ];

        for (const [key, config] of Object.entries(COLLECTIONS)) {
            if (suggestions.size >= parsedLimit * 2) break;
            
            const collection = mongoose.connection.collection(config.name);
            
            for (const pattern of searchPatterns) {
                if (suggestions.size >= parsedLimit * 2) break;
                
                const cursor = collection.find({
                    $or: config.nameFields.map(field => ({
                        [field]: { $regex: pattern.regex, $options: 'i' }
                    }))
                }).limit(parsedLimit);
                
                const results = await cursor.toArray();
                
                for (const result of results) {
                    for (const field of config.nameFields) {
                        if (result[field]) {
                            suggestions.add({
                                text: result[field],
                                priority: pattern.priority * config.priority
                            });
                        }
                    }
                }
            }
        }

        // Convert to array and sort
        const sortedSuggestions = Array.from(suggestions)
            .sort((a, b) => {
                if (b.priority !== a.priority) return b.priority - a.priority;
                return a.text.localeCompare(b.text);
            })
            .slice(0, parsedLimit)
            .map(item => item.text);

        res.json(sortedSuggestions);
    } catch (err) {
        console.error('Suggestions error:', err);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: err.message
        });
    }
};

module.exports = { searchFood, getSuggestions };