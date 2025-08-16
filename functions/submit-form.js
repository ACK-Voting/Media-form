const { MongoClient } = require('mongodb');
require('dotenv').config();

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method Not Allowed' })
        };
    }

    try {
        // Parse the form data
        const data = JSON.parse(event.body);
        
        // Validate required fields
        if (!data.fullName || !data.email || !data.phone) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields' })
            };
        }

        // Connect to MongoDB
        const uri = process.env.MONGODB_URI;
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        
        await client.connect();
        
        // Insert the form data into MongoDB
        const database = client.db(process.env.MONGODB_DB);
        const collection = database.collection('registrations');
        
        // Add timestamp
        data.submittedAt = new Date();
        
        const result = await collection.insertOne(data);
        
        // Close the connection
        await client.close();

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Form submitted successfully',
                id: result.insertedId 
            })
        };
        
    } catch (error) {
        console.error('Error processing form submission:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error processing form submission',
                error: error.message 
            })
        };
    }
};
