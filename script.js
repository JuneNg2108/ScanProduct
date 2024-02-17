let productData = []; // Initialize an empty array to hold product data

// Function to load product data from JSON
async function loadProductData() {
    try {
        const response = await fetch('product_data.json'); // Specify the correct path to your JSON file
        productData = await response.json();
    } catch (error) {
        console.error('Failed to load product data:', error);
    }
}

// Refactor the Quagga.init logic into a reusable function for starting the scanner
function startScanner() {
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
    });
}

function getProductInfo(barcode) {
    // Search for product information by barcode in the loaded JSON data
    const product = productData.find(product => product.Code.toString() === barcode);
    if (product) {
        return {
            title: product.Name,
            description: product.Description || 'No description available.',
            wholesalePrice: `${product.WholeSale} VND`,
            retailPrice: `${product.Retail} VND`,
            image: 'path/to/default_product_image.jpg' // Update this path as necessary
        };
    }
    return null;
}

function showPopup(productInfo) {
    const popup = document.getElementById('product-info');
    const titleElement = document.getElementById('product-title');
    const imageElement = document.getElementById('product-image');
    const descriptionElement = document.getElementById('product-description');
    const priceElement = document.getElementById('product-price');

    titleElement.textContent = productInfo.title;
    imageElement.src = productInfo.image; // Ensure you have a default or specific product image path
    descriptionElement.textContent = productInfo.description;
    priceElement.innerHTML = `Wholesale Price: ${productInfo.wholesalePrice}<br>Retail Price: ${productInfo.retailPrice}`;

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
                showPopup(getProductInfo(product.Code.toString())); // Show popup for clicked product
            });
            searchResults.appendChild(div);
        });
        searchResults.style.display = filteredProducts.length > 0 ? 'block' : 'none';
    });
}

// Adjust scanner container height for smaller screens
window.addEventListener('resize', function() {
    const scannerContainer = document.getElementById('scanner-container');
    const windowHeight = window.innerHeight;
    scannerContainer.style.height = `${windowHeight * 0.5}px`; // Adjust as needed
});

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
