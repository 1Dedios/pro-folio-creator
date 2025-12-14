// Theme management functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize color pickers if they exist on the page
    initColorPickers();

    // Load themes for the selector
    loadThemes();

    // Initialize theme preview if on create/edit page
    initThemePreview();

    // If editing a portfolio, select the current theme
    if (window.location.pathname.includes('/edit')) {
        selectCurrentTheme();
    }
});

// Initialize color pickers using vanilla-colorful
function initColorPickers() {
    const backgroundColorPicker = document.getElementById('backgroundColorPicker');
    const sectionColorPicker = document.getElementById('sectionColorPicker');
    const textColorPicker = document.getElementById('textColorPicker');

    if (backgroundColorPicker) {
        // Create hex color picker for background color
        const bgPicker = document.createElement('hex-color-picker');
        bgPicker.color = document.getElementById('backgroundColor').value || '#F9FAFB';
        bgPicker.addEventListener('color-changed', (event) => {
            document.getElementById('backgroundColor').value = event.detail.value;
            updateThemePreview();
        });
        backgroundColorPicker.appendChild(bgPicker);
    }

    if (sectionColorPicker) {
        // Create hex color picker for section color
        const sectionPicker = document.createElement('hex-color-picker');
        sectionPicker.color = document.getElementById('sectionColor').value || '#FFFFFF';
        sectionPicker.addEventListener('color-changed', (event) => {
            document.getElementById('sectionColor').value = event.detail.value;
            updateThemePreview();
        });
        sectionColorPicker.appendChild(sectionPicker);
    }

    if (textColorPicker) {
        // Create hex color picker for text color
        const textPicker = document.createElement('hex-color-picker');
        textPicker.color = document.getElementById('textColor').value || '#1F2937';
        textPicker.addEventListener('color-changed', (event) => {
            document.getElementById('textColor').value = event.detail.value;
            updateThemePreview();
        });
        textColorPicker.appendChild(textPicker);
    }
}

// Load themes from the server
async function loadThemes() {
    try {
        const response = await fetch('/api/themes');
        if (!response.ok) {
            throw new Error('Failed to load themes');
        }

        const themes = await response.json();
        populateThemeSelector(themes);
    } catch (error) {
        console.error('Error loading themes:', error);
    }
}

// Populate the theme selector dropdown
function populateThemeSelector(themes) {
    const themeSelector = document.getElementById('themeSelector');
    if (!themeSelector) return;

    // Clear existing options except the first one
    while (themeSelector.options.length > 1) {
        themeSelector.remove(1);
    }

    // Group themes by example and user-created
    const exampleThemes = themes.filter(theme => theme.isExample);
    const userThemes = themes.filter(theme => !theme.isExample);

    // Add example themes
    if (exampleThemes.length > 0) {
        const exampleGroup = document.createElement('optgroup');
        exampleGroup.label = 'Example Themes';

        exampleThemes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme._id;
            option.text = theme.name;
            option.dataset.theme = JSON.stringify(theme);
            exampleGroup.appendChild(option);
        });

        themeSelector.appendChild(exampleGroup);
    }

    // Add user themes
    if (userThemes.length > 0) {
        const userGroup = document.createElement('optgroup');
        userGroup.label = 'Your Themes';

        userThemes.forEach(theme => {
            const option = document.createElement('option');
            option.value = theme._id;
            option.text = theme.name;
            option.dataset.theme = JSON.stringify(theme);
            userGroup.appendChild(option);
        });

        themeSelector.appendChild(userGroup);
    }

    // Add change event listener
    themeSelector.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.dataset.theme) {
            const theme = JSON.parse(selectedOption.dataset.theme);
            updateThemePreview(theme.themeData);
        }
    });
}

// Initialize theme preview
function initThemePreview() {
    const themePreview = document.getElementById('themePreview');
    if (!themePreview) return;

    // Set default preview colors
    updateThemePreview({
        backgroundColor: '#F9FAFB',
        sectionColor: '#FFFFFF',
        textColor: '#1F2937'
    });
}

// Update theme preview with selected colors
function updateThemePreview(themeData) {
    const previewBackground = document.querySelector('.preview-background');
    const previewSection = document.querySelector('.preview-section');
    const previewText = document.querySelector('.preview-text');

    if (!previewBackground || !previewSection || !previewText) return;

    // If themeData is provided, use it
    if (themeData) {
        previewBackground.style.backgroundColor = themeData.backgroundColor;
        previewSection.style.backgroundColor = themeData.sectionColor;
        previewText.style.color = themeData.textColor;
    } else {
        // Otherwise use the values from the color pickers
        const backgroundColor = document.getElementById('backgroundColor')?.value || '#F9FAFB';
        const sectionColor = document.getElementById('sectionColor')?.value || '#FFFFFF';
        const textColor = document.getElementById('textColor')?.value || '#1F2937';

        previewBackground.style.backgroundColor = backgroundColor;
        previewSection.style.backgroundColor = sectionColor;
        previewText.style.color = textColor;
    }
}

// Toggle the create theme form
function toggleCreateThemeForm() {
    const createThemeForm = document.getElementById('createThemeForm');
    if (createThemeForm) {
        createThemeForm.style.display = createThemeForm.style.display === 'none' ? 'block' : 'none';
    }
}

// Save a new theme
async function saveNewTheme() {
    const themeName = document.getElementById('themeName').value;
    const backgroundColor = document.getElementById('backgroundColor').value;
    const sectionColor = document.getElementById('sectionColor').value;
    const textColor = document.getElementById('textColor').value;

    if (!themeName) {
        alert('Please enter a theme name');
        return;
    }

    try {
        const response = await fetch('/api/themes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: themeName,
                themeData: {
                    backgroundColor,
                    sectionColor,
                    textColor
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create theme');
        }

        const newTheme = await response.json();

        // Reload themes and select the new one
        await loadThemes();

        // Select the new theme
        const themeSelector = document.getElementById('themeSelector');
        if (themeSelector) {
            themeSelector.value = newTheme._id;

            // Trigger change event to update preview
            const event = new Event('change');
            themeSelector.dispatchEvent(event);
        }

        // Hide the create theme form
        toggleCreateThemeForm();

    } catch (error) {
        console.error('Error creating theme:', error);
        alert('Error creating theme: ' + error.message);
    }
}

// Select the current theme when editing a portfolio
function selectCurrentTheme() {
    // Check if portfolio data is available in the page
    const portfolioJson = document.getElementById('portfolioJson');
    if (!portfolioJson) return;

    try {
        const portfolio = JSON.parse(portfolioJson.textContent);
        if (portfolio && portfolio.themeId) {
            const themeSelector = document.getElementById('themeSelector');
            if (themeSelector) {
                themeSelector.value = portfolio.themeId;

                // Find the selected option and update the preview
                const selectedOption = themeSelector.options[themeSelector.selectedIndex];
                if (selectedOption && selectedOption.dataset.theme) {
                    const theme = JSON.parse(selectedOption.dataset.theme);
                    updateThemePreview(theme.themeData);
                }
            }
        }
    } catch (error) {
        console.error('Error selecting current theme:', error);
    }
}

// Expose functions to global scope for use in inline event handlers
window.toggleCreateThemeForm = toggleCreateThemeForm;
window.saveNewTheme = saveNewTheme;
