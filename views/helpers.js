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

// Helper to sort an array by a property
export const sortBy = (array, property) => {
    if (!array || !array.length) return [];

    // Create a new array to avoid modifying the original
    const sortedArray = [...array];

    // Sort the array by the specified property
    sortedArray.sort((a, b) => {
        if (a[property] === undefined) return 1;
        if (b[property] === undefined) return -1;
        return a[property] - b[property];
    });

    return sortedArray;
};

export function ifEquals(a, b, opts) {
  if (String(a) === String(b)) {
    return opts.fn(this);
  }
  return opts.inverse(this);
}