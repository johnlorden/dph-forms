require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000; 

app.use(bodyParser.json());             

app.post('/submit', async (req, res) => {
    try {
        const formData = req.body;

        // Construct dynamic column_values string 
        let columnValues = '';
        for (const [fieldName, fieldValue] of Object.entries(formData)) {
            // Replace 'text' with the appropriate column types in your board
            columnValues += `\\"${fieldName}\\": \\"${fieldValue}\\", `;  
        }
        columnValues = columnValues.slice(0, -2); // Remove trailing comma and space

        // Prepare API request
        const myApiToken = process.env.MONDAY_API_TOKEN; 
        const boardId = process.env.BOARD_ID; 
        const mutationQuery = `mutation {
            create_item (board_id: ${boardId}, item_name: "${formData.name}", column_values: "{${columnValues}}") {
                id
            }
        }`;

        // Send API request
        const response = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': myApiToken 
            },
            body: JSON.stringify({ query: mutationQuery })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        // Redirect on success
        const referrerUrl = new URL(req.header('Referer')); 
        const referrerDomain = referrerUrl.hostname;
        res.redirect(`${referrerDomain}/Submitted`); 

    } catch (error) {
        console.error('Error:', error);
        // Redirect on error
        const referrerUrl = new URL(req.header('Referer'));
        const referrerDomain = referrerUrl.hostname;
        res.redirect(`${referrerDomain}/failed`); 
    }
});

app.listen(port, () => {
    console.log(`DPH API listening on port ${port}`);
});
