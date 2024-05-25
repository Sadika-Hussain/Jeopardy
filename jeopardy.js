let tHeaderRow = $('#jeopardy thead tr');
let tBody = $('#jeopardy tbody');
let startBtn = $('button');

// Constants for number of categories and questions per category to display 
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

// Array to hold categories data
let categories = [];

// Function to fetch category IDs from the Jeopardy API
async function getCategoryIds() {
    try {
        // Make an API request to get category IDs
        const response = await axios.get('https://rithm-jeopardy.herokuapp.com/api/categories?count=100');
        // Extract the IDs from the response data
        const categoryIds = response.data.map(category => category.id);
        return categoryIds;
    } catch (error) {
        // Log an error message if the API request fails
        console.error("Error fetching category IDs:", error);
        return [];
    }
}

// Function to fetch a specific category by its ID
async function getCategory(catId) {
    try {
        const response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`);
        const data = response.data;
        // Extract clues from response data and format them for display
        const cluesArray = data.clues.map(clue => ({ question: clue.question, answer: clue.answer, showing: null }));
        // Return object with data about a category:
        return { title: data.title, clues: cluesArray };
    } catch (error) {
        console.error(`Error fetching category data for ID ${catId}:`, error);
        return null;
    }
}

// Fisher-Yates shuffle algorithm to randomize array elements
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Function to fill the Jeopardy table with categories and clues
async function fillTable() {
    // Show loading view
    showLoadingView();

    // Get and shuffle category IDs, then select the first NUM_CATEGORIES
    let allCategoryIds = await getCategoryIds();
    allCategoryIds = shuffle(allCategoryIds).slice(0, NUM_CATEGORIES);

    // Fetch each category and add to categories array
    for (let catId of allCategoryIds) {
        const category = await getCategory(catId);
        if (category) categories.push(category);
    }

    if (categories.length !== 0) {
        // Fill table headers with category titles
        categories.forEach(category => {
            tHeaderRow.append($('<th>').text(category.title));
        });

        // Create rows and cells for clues
        for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
            const row = $('<tr>');
            categories.forEach((category, j) => {
                shuffle(category.clues);
                row.append($('<td>')
                    .attr('id', `${i}-${j}`)
                    .html('$')
                    .on('click', handleClick)
                );
            });
            tBody.append(row);
        }

        // Hide loader when board is showing 
        hideLoadingView();
    }

}

// Function to handle clue-cell click events
function handleClick(evt) {
    // Extract row and column indices from the clicked cell's id
    // The id is expected to be in the format "row-col", e.g., "0-3"
    const [row, col] = evt.target.id.split('-').map(Number);

    // Retrieve the corresponding clue from the categories array using the column index for category
    // and the row index for the specific clue within that category
    const clue = categories[col].clues[row];

    // Show question or answer based on .showing property on clue
    if (clue.showing === null) {
        $(evt.target).html(clue.question);
        clue.showing = 'question';
    } else if (clue.showing === 'question') {
        $(evt.target).html(clue.answer);
        $(evt.target).addClass('answer');
        clue.showing = 'answer';
    }
}

// Function to show the loading view
function showLoadingView() {
    $('.loader').show();

    // Hide the board while loader is enabled
    $('#jeopardy').hide();

    // Update start button and disable click
    startBtn.text('Loading...');
    startBtn.addClass('disabled');
}

// Function to hide the loading view
function hideLoadingView() {
    $('.loader').hide();
    
    // Show the board while loader is disabled
    $('#jeopardy').show();

    // Update start button and enable click
    startBtn.text('Restart!');
    startBtn.removeClass('disabled');
}

// Function to set up and start/restart the game
async function setupAndStart() {
    // Clear categories array and wipe the current Jeopardy board
    categories = [];
    tHeaderRow.empty();
    tBody.empty();

    // Fill Jeopardy board with new data
    await fillTable();
}

//  Set up the click event handler for the start button when the document is ready
$(document).ready(() => {
    startBtn.on('click', setupAndStart);
});





















