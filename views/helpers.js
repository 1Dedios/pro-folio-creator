// Handlebars helper functions

// Format date to a readable format
export const formatDate = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
};

// Helper to check equality
export const eq = (a, b) => {
    return a === b;
};