require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = 5000;
const host = '0.0.0.0';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.API_KEYS_GROQ;

// Stockage des conversations par UID
const conversations = {};

app.get('/mistral', async (req, res) => {
    const { question, uid } = req.query;
    if (!question || !uid) {
        return res.status(400).json({ error: 'Veuillez fournir une question et un UID' });
    }

    // Initialisation de la conversation si elle n'existe pas encore
    if (!conversations[uid]) {
        conversations[uid] = [];
    }

    // Ajout de la question de l'utilisateur
    conversations[uid].push({ role: 'user', content: question });

    try {
        const response = await axios.post(
            API_URL,
            {
                model: 'llama-3.3-70b-versatile',
                messages: conversations[uid],
                temperature: 1,
                max_tokens: 1024,
                top_p: 1
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                }
            }
        );

        const botResponse = response.data.choices[0]?.message?.content || 'Réponse non disponible';
        
        // Ajout de la réponse du bot dans la conversation
        conversations[uid].push({ role: 'assistant', content: botResponse });

        res.json({ response: botResponse });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la génération de la réponse' });
    }
});

app.listen(port, host, () => {
    console.log(`Serveur démarré sur http://${host}:${port}`);
});
