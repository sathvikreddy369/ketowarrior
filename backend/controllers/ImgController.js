const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Switched to gemini-1.5-flash

const ImgController = {
    handleImageSearch: async (req, res) => {
        const { prompt } = req.body;
        const image = req.file; // Assuming you're using multer for file upload

        if (!image) {
            return res.status(400).json({ error: 'Image file is required.' });
        }

        // Debugging logs
        console.log("Gemini API Key:", process.env.GEMINI_API_KEY);
        console.log("Uploaded Image Mimetype:", image.mimetype);
        console.log("Request Body:", req.body);

        try {
            // Convert the image to a base64 string
            const base64Image = image.buffer.toString('base64');
            const imageData = {
                mimeType: image.mimetype,
                data: base64Image,
            };

            // Construct the prompt with the image data.  Added user prompt.
            const finalPrompt = `
        Analyze the image and:
        1.  Identify the food items present.
        2.  Estimate the volume/quantity of the *combined* food items. Provide a relative measure (e.g., "1 whole pizza", "1 slice").
        3.  Based on the food items and their estimated volumes, provide an estimate of the following macronutrients for the *combined* food items:
            -   Calories
            -   Protein
            -   Fat
            -   Carbohydrates
            -   Sugars

        Provide the response in JSON format, providing a single object for the combined food item.  If you cannot identify the food item, or cannot estimate its volume, return an error.

        Example Output:
        {
          "name": "Margherita Pizza",
          "volume": "1 medium (12-inch) pizza",
          "calories": 800,
          "protein": 25,
          "fat": 30,
          "carbohydrates": 90,
          "sugars": 10
        }
        ${prompt ? `User prompt: ${prompt}` : ''}
      `;

            console.log("Final Prompt:", finalPrompt);

            // Make the request to the Gemini API
            const response = await model.generateContent({
                contents: [
                    {
                        parts: [
                            {
                                inlineData: imageData,
                            },
                            {
                                text: finalPrompt,
                            },
                        ],
                    },
                ],
            });

            console.log("Gemini API Response:", JSON.stringify(response, null, 2));

            const result = response.response?.candidates?.[0]?.content?.parts?.[0]?.text;

            // Attempt to parse the result as JSON.  If it's not valid JSON, return an error.
            try {
                // Improved JSON extraction: Find the JSON within the response
                const jsonStartIndex = result.indexOf('{');
                const jsonEndIndex = result.lastIndexOf('}');
                let cleanedResult = result;
                if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
                    cleanedResult = result.substring(jsonStartIndex, jsonEndIndex + 1);
                }
                const parsedResult = JSON.parse(cleanedResult);

                // Determine the primary unit.  Defaults to "grams" if not found.
                let unit = "grams";
                if (parsedResult.volume && parsedResult.volume.includes("millilitres")) {
                    unit = "millilitres";
                } else if (parsedResult.volume && parsedResult.volume.includes("count")) {
                    unit = "count";
                } else if (parsedResult.volume && parsedResult.volume.includes("grams")) {
                    unit = "grams";
                }
                else {
                    unit = "grams"; // Default
                }

                const formattedResult = { ...parsedResult, unit: unit }; // Add the unit

                res.json(formattedResult);
            } catch (parseError) {
                console.error("Error parsing Gemini response:", parseError);
                console.log("Raw Gemini Response:", result);
                res.status(500).json({
                    error: 'Failed to parse the Gemini response. The response was not valid JSON.',
                    rawResponse: result,
                });
            }
        } catch (apiError) {
            console.error('Error analyzing image:', apiError);
            res.status(500).json({
                error: 'Failed to analyze the image.',
                details: apiError.message,
                stack: apiError.stack,
            });
        }
    },
};

module.exports = ImgController;
