import express from 'express';
import { themes } from '../data/index.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get all themes (example themes and user's themes)
router.get('/themes', async (req, res) => {
    try {
        // Check if user is logged in
        const userId = req.session.user ? req.session.user.userId : null;
        
        // Get all example themes
        const exampleThemes = await themes.getExampleThemes();
        
        // Get user's themes if logged in
        let userThemes = [];
        if (userId) {
            userThemes = await themes.getAllThemes(new ObjectId(userId));
        }
        
        // Combine and return all themes
        const allThemes = [...exampleThemes, ...userThemes];
        res.json(allThemes);
    } catch (e) {
        console.error('Error getting themes:', e);
        res.status(500).json({ error: 'Failed to get themes' });
    }
});

// Create a new theme
router.post('/themes', async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.status(401).json({ error: 'You must be logged in to create a theme' });
        }
        
        const userId = req.session.user.userId;
        const { name, themeData } = req.body;
        
        // Validate input
        if (!name || !themeData) {
            return res.status(400).json({ error: 'Name and theme data are required' });
        }
        
        if (!themeData.backgroundColor || !themeData.sectionColor || !themeData.textColor) {
            return res.status(400).json({ error: 'Theme data must include backgroundColor, sectionColor, and textColor' });
        }
        
        // Create the theme
        const newTheme = await themes.createTheme(
            new ObjectId(userId),
            name,
            themeData,
            false // Not an example theme
        );
        
        res.status(201).json(newTheme);
    } catch (e) {
        console.error('Error creating theme:', e);
        res.status(500).json({ error: 'Failed to create theme' });
    }
});

export default router;