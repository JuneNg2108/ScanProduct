let productData = []; // Initialize an empty array to hold product data
// Add a loading indicator
const loadingIndicator = document.getElementById('loading-indicator');

// Modify loadProductData function to show loading indicator
async function loadProductData() {
    try {
        loadingIndicator.style.display = 'block'; // Show loading indicator
        const response = await fetch('ban_le.json');
        productData = await response.json();
        loadingIndicator.style.display = 'none'; // Hide loading indicator after data is loaded
    } catch (error) {
        loadingIndicator.style.display = 'none'; // Hide loading indicator in case of error
        console.error('Failed to load product data:', error);
    }
}

function startScanner() {
    loadingIndicator.style.display = 'block'; // Show loading indicator
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-container')
        },
        decoder: {
            readers: ["ean_reader"]
        }
    }, function(err) {
        if (err) {
            console.error('Failed to initialize Quagga:', err);
            loadingIndicator.style.display = 'none'; // Hide loading indicator in case of error
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function(data) {
        Quagga.stop();
        const barcode = data.codeResult.code;
        const productInfo = getProductInfo(barcode);
        if (productInfo) {
            showPopup(productInfo);
        } else {
            alert("No product found!");
        }
        loadingIndicator.style.display = 'none'; // Hide loading indicator after scanning
    });
}

function getProductInfo(barcode) {
    // Search for product information by barcode in the loaded JSON data
    const product = productData.find(product => product.Code.toString() === barcode);
    if (product) {
        // Format the prices with a dot between digits
        const retailPrice = `${product.Retail.toLocaleString('en-US').replace(/,/g, '.')} VND`;
        return {
            id: product.Code, // Add product ID to identify items uniquely
            title: product.Name,
            retailPrice,
        };
    }
    return null;
}

function showPopup(productInfo) {
    const popup = document.getElementById('product-info');
    const titleElement = document.getElementById('product-title');
    const priceElement = document.getElementById('product-price');

    titleElement.textContent = productInfo.title;
    priceElement.innerHTML = `Retail Price: ${productInfo.retailPrice}`;

    popup.style.display = 'block';
}

function closePopup() {
    const popup = document.getElementById('product-info');
    popup.style.display = 'none';
    // Automatically restart the barcode scanner after closing the popup
    startScanner();
}



// Setup the search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('input', function() {
        const value = searchInput.value.toLowerCase();
        const filteredProducts = productData.filter(product =>
            product.Name.toLowerCase().includes(value) || product.Code.toString().includes(value)
        );
    
        searchResults.innerHTML = ''; // Clear previous results
        filteredProducts.forEach(product => {
            const div = document.createElement('div');
            div.textContent = `${product.Name} (${product.Code})`;
            div.addEventListener('click', () => {
                searchInput.value = ''; // Clear search input
                searchResults.style.display = 'none'; // Hide results
                const productInfo = getProductInfo(product.Code.toString());
                if (productInfo) {
                    showPopup(productInfo);
                } else {
                    alert("No product found!");
                }
            });
            searchResults.appendChild(div);
        });
        searchResults.style.display = filteredProducts.length > 0 ? 'block' : 'none';
        loadingIndicator.style.display = 'none'; // Hide loading indicator after search
    });
}

// Execute loadProductData on page load, start the scanner and setup search functionality
document.addEventListener('DOMContentLoaded', async () => {
    await loadProductData();
    setupSearch(); // Setup search functionality after loading product data
});

// Adjust or remove the button's event listener based on your design decision
const scanBtn = document.getElementById('scanBtn');
scanBtn.addEventListener('click', function() {
    startScanner(); // Optionally restart the scanner manually
});

