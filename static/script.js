let filterStates = {};
let activeBrandFilters = {};
// Function to toggle filter states
const tfvButton = document.getElementById('tick-filter-visibility');
const tickFilters = document.querySelector('.tick-filter-window');

// Add an event listener to the button
tfvButton.addEventListener('click', () => {
    if (tickFilters.style.display === 'none') {
        tickFilters.style.display = 'flex';
        tfvButton.textContent = '<<';
    } else {
        tickFilters.style.display = 'none';
        tfvButton.textContent = '>>';
    }
});
function toggleFilter(element) {
    const attribute = element.getAttribute("data-attribute");
    if (attribute.startsWith("brand:")){
        if (!activeBrandFilters[attribute] || activeBrandFilters[attribute] === "empty") {
            activeBrandFilters[attribute] = "include";
            element.classList.remove("red");
            element.classList.add("green");
        } else if (activeBrandFilters[attribute] === "include") {
            activeBrandFilters[attribute] = "exclude";
            element.classList.remove("green");
            element.classList.add("red");
        } else {
            activeBrandFilters[attribute] = "empty";
            element.classList.remove("red");
            element.classList.remove("green");
        }
    }else {
        if (!filterStates[attribute] || filterStates[attribute] === "empty") {
            filterStates[attribute] = "include";
            element.classList.remove("red");
            element.classList.add("green");
        } else if (filterStates[attribute] === "include") {
            filterStates[attribute] = "exclude";
            element.classList.remove("green");
            element.classList.add("red");
        } else {
            filterStates[attribute] = "empty";
            element.classList.remove("red");
            element.classList.remove("green");
        }
    }
    // Toggle state (green, red, or empty)

    // Update the displayed cards based on filter states
    updateCards();
}

// Function to parse and format the UTC string
function formatDate(utcDate) {
    var date = new Date(utcDate);
    if (!isNaN(date)) {
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }
    return "Invalid date"; // Return an error message if the date is invalid
}
function parseDate(utcDate) {
    var date = new Date(utcDate);
    if (!isNaN(date)) {
        return date;
    }
    return "ERR_COULD_NOT_PARSE"; // Return an error message if the date is invalid
}

// Get all cards in the container
var cards = document.querySelectorAll('.card');
const uniqueBrands = Array.from(new Set(
    Array.from(cards).map(card => card.getAttribute('data-brand'))
));

const filterContainer = document.querySelector('.brand-filters');

uniqueBrands.forEach(brand => {
    if (brand) { // Ensure it's not null or empty
        const filterItem = document.createElement('div');
        filterItem.classList.add('tick-filter-item');
        filterItem.textContent = brand;
        filterItem.setAttribute("data-attribute", "brand:"+brand);
        filterItem.onclick = function () {
            toggleFilter(filterItem);
        };
        filterContainer.appendChild(filterItem);
    }
});

// Apply formatted freshness date
cards.forEach(function(card) {
    var freshnessUTC = card.getAttribute('data-freshness');
    var formattedFreshness = formatDate(freshnessUTC);
    card.querySelector('.freshness-display').textContent = formattedFreshness;

    // Check if the status is "Order Closed" and apply the "status-closed" class
    var statusElement = card.querySelector('.status-text');
    if (statusElement.textContent === "PRE-ORDER") {
        statusElement.classList.add('pre-order');
    }
    if (statusElement.textContent === "IN STOCK") {
        statusElement.classList.add('in-stock');
    }
    if (statusElement.textContent === "ORDER CLOSED") {
        statusElement.classList.add('status-closed');
    }
});

// Event listener for sorting/filtering
document.getElementById('filterType').addEventListener('change', updateCards);
document.getElementById('sortOrder').addEventListener('change', updateCards);
document.getElementById('searchInput').addEventListener('change', updateCards);
document.getElementById('filter').addEventListener('change', updateCards);

function updateCards() {
    var filterType = document.getElementById('filterType').value;
    var sortOrder = document.getElementById('sortOrder').value;
    var searchTerm = document.getElementById('searchInput').value.toLowerCase();

    let totalResults = 0
    let priceZeroResults = 0
    let sumPrices = 0

    var sortedCards = Array.from(cards);
    sortedCards.forEach(function(card) {
        var cardText = card.textContent.toLowerCase();  // You can customize this to search specific elements
        var showCard = true;

        // Search term filter
        if (!cardText.includes(searchTerm)) {
            showCard = false;
        }

        if (cardText.includes("saya")) {
            card.style.background = 'linear-gradient(14deg, rgba(5,5,4,1) 0%, rgba(121,94,9,1) 32%, rgba(255,230,121,1) 100%)';
        }

        // "In Stock" filter
        if (filterStates["IN STOCK"] === "include" && card.querySelector('.status-text').textContent !== "IN STOCK") {
            showCard = false;
        } else if (filterStates["IN STOCK"] === "exclude" && card.querySelector('.status-text').textContent === "IN STOCK") {
            showCard = false;
        }
        if (filterStates["PRE-ORDER"] === "include" && card.querySelector('.status-text').textContent !== "PRE-ORDER") {
            showCard = false;
        } else if (filterStates["PRE-ORDER"] === "exclude" && card.querySelector('.status-text').textContent === "PRE-ORDER") {
            showCard = false;
        }
        if (filterStates["ORDER CLOSED"] === "include" && card.querySelector('.status-text').textContent !== "ORDER CLOSED") {
            showCard = false;
        } else if (filterStates["ORDER CLOSED"] === "exclude" && card.querySelector('.status-text').textContent === "ORDER CLOSED") {
            showCard = false;
        }

        if (filterStates["NEWEST ARRIVALS"] === "include" && !(card.getAttribute('data-freshness') === card.getAttribute('data-first-ingest'))) {
            showCard = false;
        } else if (filterStates["NEWEST ARRIVALS"] === "exclude" && (card.getAttribute('data-freshness') === card.getAttribute('data-first-ingest'))) {
            showCard = false;
        }

        Object.keys(activeBrandFilters).forEach(brand => {
            if (activeBrandFilters[brand] === "include" && !("brand:"+ card.querySelector('.brand-text').textContent  === brand)) {
                showCard = false;
            } else if (activeBrandFilters[brand] === "exclude" && ("brand:"+ card.querySelector('.brand-text').textContent  === brand)) {
                showCard = false;
            }
        });


        // Apply the visibility based on filters
        if (showCard) {
            card.style.display = "block";

            totalResults += 1
            if ( parseFloat(card.getAttribute('data-price')) === 0) {
                priceZeroResults += 1
            }
            sumPrices =  parseFloat(card.getAttribute('data-price')) + parseFloat(sumPrices)
        } else {
            card.style.display = "none";
        }
        document.querySelector('.results').style.display = "block"

        var validResults = totalResults-priceZeroResults
        if (validResults === 0) { validResults = 1}
        document.getElementById("results-amt").innerText = "Results: " + totalResults + " Avg. Price: " + (sumPrices/validResults).toFixed() +" JPY"
    });

    // Sorting logic
    sortedCards.sort(function(a, b) {
        var valA = a.getAttribute('data-' + filterType).toLowerCase();
        var valB = b.getAttribute('data-' + filterType).toLowerCase();

        if (filterType === 'none') {
            return 0; // No sorting by default
        }

        if (filterType === 'freshness') {
            valA = parseDate(valA);
            valB = parseDate(valB);
        }
        if (filterType === 'price') {
            valA = parseFloat(valA.replace(/[^\d.-]/g, ''));
            valB = parseFloat(valB.replace(/[^\d.-]/g, ''));
        }
        if (filterType === 'id') {
            valA = parseFloat(valA.replace(/[^\d.-]/g, ''));
            valB = parseFloat(valB.replace(/[^\d.-]/g, ''));
        }

        if (sortOrder === 'asc') {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });

    // Re-append the sorted cards to the container

    let container = document.getElementById('cardContainer');

    sortedCards.forEach(function(card) {
        container.appendChild(card);
    });
}
function showTooltip(event, price) {
    const tooltip = document.getElementById('tooltip');
    const priceValue = parseFloat(price.replace(/[^\d.-]/g, '')); // Remove non-numeric characters
    const convertedPrice = (priceValue * 0.006).toFixed(2); // Calculate and format to two decimals
    tooltip.innerText = `${price} JPY is approx. ${convertedPrice} EUR`; // Update tooltip text

    tooltip.style.display = 'block'; // Show tooltip
    tooltip.style.left = `${event.pageX + 10}px`; // Position next to cursor
    tooltip.style.top = `${event.pageY + 10}px`;
}
// Hide tooltip
function hideTooltip() {
    document.getElementById('tooltip').style.display = 'none';
}
function resetFilters(){
    filterStates = {};
    activeBrandFilters = {};
    document.querySelectorAll('.tick-filter-item').forEach(element => {
        element.classList.remove('red');
        element.classList.remove('green');
    });
    updateCards()
}

const images = [
    'https://www.amiami.com/images/parts/loading_01.png',
    'https://www.amiami.com/images/parts/loading_02.png',
    'https://www.amiami.com/images/parts/loading_03.png'
];