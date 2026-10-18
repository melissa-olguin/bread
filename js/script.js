
// A. products list
const products = [

    { id: 1, name: "Whole Wheat Loaf",          category: "Breads",     unitPrice: 8 },
    { id: 2, name: "Classic Sourdough",         category: "Breads",     unitPrice: 8 },
    { id: 3, name: "Rosemary Loaf",             category: "Breads",     unitPrice: 10 },
    { id: 4, name: "Garlic Loaf",               category: "Breads",     unitPrice: 10 },

    { id: 5, name: "Butter Croissant",          category: "Pastries",   unitPrice: 4 },
    { id: 8, name: "Chocolate Croissant",       category: "Pastries",   unitPrice: 4 },
    { id: 6, name: "Cinnamon Roll",             category: "Pastries",   unitPrice: 4 },
    { id: 7, name: "Morning Buns",              category: "Pastries",   unitPrice: 4 },
    { id: 9, name: "6pk Assorted Pastries",     category: "Pastries",   unitPrice: 19 },

    { id: 10, name: "Double Chocolate Cookie",   category: "Cookies",    unitPrice: 3 },
    { id: 11, name: "Chocolate Chip Cookie",     category: "Cookies",    unitPrice: 3 },
    { id: 12, name: "Macadamia Nut Cookie",      category: "Cookies",    unitPrice: 3 },
    { id: 13, name: "Sugar Cookie",              category: "Cookies",    unitPrice: 3 },
    { id: 14, name: "6pk Assorted Cookies",      category: "Cookies",    unitPrice: 17 },

    { id: 15, name: "Assorted Cake Slice",       category: "Cakes",      unitPrice: 4 },
    { id: 16, name: "Small Custom Cake",         category: "Cakes",      unitPrice: 30 },
    { id: 17, name: "Big Custom Cake",           category: "Cakes",      unitPrice: 45 }
];

let wishlist = [];
let activeFilter = "All";

// initialize all functions on page load 

function init() {
    loadWishlist();
    loadFilter();
    renderProducts();
    renderWishlist();
    initForm();
    setMinDate();
}

// A. Filter buttons logic
// Filter products by category and store the filter in local storage

function loadFilter() {
    const stored = localStorage.getItem("nsb-filter");
    if (stored) activeFilter = stored;
}

function handleFilterClick(event) {
    activeFilter = event.target.dataset.category;
    localStorage.setItem("nsb-filter", activeFilter);
    renderProducts();
}

// A. Render Products Cards
// Render Products Cards in filtered grid and update the filter note with the number of items in the selected category

function renderProducts() {
    const grid = document.getElementById("product-grid");
    const note = document.getElementById("filter-note");
    const filterButtons = document.querySelectorAll(".filter-button");

    if (!grid) return;

    // Filter Data
    const filtered = activeFilter === "All" 
        ? products 
        : products.filter(p => p.category === activeFilter);

    // Update Note
    if (note) {
        note.textContent = `Showing ${filtered.length} item${filtered.length === 1 ? "" : "s"} in "${activeFilter}" `;
    }

    // Render Grid
    grid.innerHTML = "";
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="font-size: 1em;">No items in this category.</p>';
    } else {
        filtered.forEach(product => {
            const card = document.createElement("div");
            
            
            
            card.className = "card";
            card.innerHTML = `
                <h2>${product.name}</h2>
                <p>${product.category}</p>
                <p>$${product.unitPrice}</p>
                <button style="text-size: 1rem; text-wrap: nowrap;" onclick="addToWishlist(${product.id})" >
                    + Add
                </button>
            `;
            grid.appendChild(card);
        });
    }
    

    // filter button color changes on click 
    filterButtons.forEach(button => {
        if (button.dataset.category === activeFilter) {
            button.style.background = "#684637";
            button.style.color = "#ffcc00";
        } else {
            button.style.background = "#ebcca4";
            button.style.color = "#684637";
        }
        // attach listener if not already attached
        if (!button.hasAttribute('data-listener')) {
             button.addEventListener("click", handleFilterClick);
             button.setAttribute('data-listener', 'true');
        }
    });
}

// B. Add to Wishlist order Logic ------- 

function addToWishlist(productId) {
    const product = products.find(p => p.id === productId);
    const existing = wishlist.find(w => w.id === productId);

    if (existing) {
        existing.qty++;
    } else {
        wishlist.push({ id: product.id, name: product.name, qty: 1 });
    }

    saveWishlist();
    renderWishlist();
}

function removeFromWishlist(productId) {
    wishlist = wishlist.filter(w => w.id !== productId);
    saveWishlist();
    renderWishlist();
}

function changeQty(productId, delta) {
    const item = wishlist.find(w => w.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
        removeFromWishlist(productId);
        return;
    }

    saveWishlist();
    renderWishlist();
}

function clearWishlist() {
    wishlist = [];
    saveWishlist();
    renderWishlist();
}

// C. Render Wishilist and calculator  -----------
// Update the wishlist display and calculator total 

function renderWishlist() {
    const container = document.getElementById("wishlist-items");
    const calcLines = document.getElementById("calc-lines");
    const totalEl = document.getElementById("total-price");

    if (!container) return;

    // Empty add items
    if (wishlist.length === 0) {
        container.innerHTML = "<p>Add items above!</p>";
        if (calcLines) calcLines.innerHTML = "";
        if (totalEl) totalEl.textContent = "$0.00";
        updateOrderMessage();
        return;
    }

    let total = 0;
    let html = "";
    let calcHtml = "";

    // Loop for adding items to the wishlist
    wishlist.forEach(item => {
        const product = products.find(p => p.id === item.id);
        const lineTotal = product.unitPrice * item.qty;
        total += lineTotal;

        html += `
            <div class="wish-item">
                <span class="wish-item-name">${item.name}</span>
                <div class="wish-controls">
                    <button onclick="changeQty(${item.id}, -1)" class="count-button" title="Decrease">−</button>
                    <span class="wish-qty">${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)" class="count-button" title="Increase">+</button>
                    <button onclick="removeFromWishlist(${item.id})" class="remove-button" title="Remove">✕</button>
                </div>
            </div>`;

        calcHtml += `
            <div class="calc-lines">
                <span>${item.qty} × ${item.name}</span>
                <span>$${product.unitPrice} each</span>
                <span>$${lineTotal.toFixed(2)}</span>
            </div>`;
    });
  
    // --- Update DOM ---
    container.innerHTML = html;
    if (calcLines) calcLines.innerHTML = calcHtml;
    if (totalEl) totalEl.textContent = "$" + total.toFixed(2);

    updateOrderMessage();
}



//  Browser storage ---------
//save and load wishlist to local storage


function saveWishlist() {
    localStorage.setItem("nsb-wishlist", JSON.stringify(wishlist));
}

function loadWishlist() {
    const stored = localStorage.getItem("nsb-wishlist");
    if (stored) {
        try {
            wishlist = JSON.parse(stored);
        } catch (e) {
            wishlist = [];
        }
    }
}

//D. form validation functions ------------
// Initialize form validation

function initForm() {
     // Find the form by ID
    const form = document.getElementById("contact-form");
    if (!form) return;

    // Clear errors on reset
    const resetButton = document.getElementById("reset-button");
    if (resetButton) {
        // Small delay ensures the reset happens before we clear errors
        resetButton.addEventListener("click", function() {
            setTimeout(() => {
                clearFormErrors();
            }, 10);
        });
    }

    // Handle Form Submission
    form.addEventListener("submit", function(e) {
        e.preventDefault(); // Stop the form from sending immediately
        
        // Run validation
        if (validateForm()) {
            // If everything is valid, allow the form to submit to Netlify
            // If valid, you can submit the form here:
            //form.submit(); 
            e.target.submit(); 
            //alert("Form is valid! (Submission paused for demo)");
        } else {
            // Scroll to first error
            const firstError = document.querySelector(".invalid");
            if (firstError) {
                firstError.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    });
}


// Helper to clear all error styles and text
function clearFormErrors() {
    document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");
    document.querySelectorAll("input, textarea, select").forEach(el => el.classList.remove("invalid"));
}

//D. Helper to show a specific error
function showError(field, errorElement, message) {
    if (field) field.classList.add("invalid"); // Adds red border
    if (errorElement) errorElement.textContent = message; // Adds red text
}

//D.  Form validation
function validateForm() {
    let isValid = true;
    clearFormErrors(); // Clear previous errors
    
    // 1. Validate Name
    const name = document.getElementById("name");
    const nameError = document.getElementById("name-error");
    if (name.value.trim().length < 2) {
        showError(name, nameError, "Name must be at least 2 characters");
        isValid = false;
    }
    
    // 2. Validate Email
    const email = document.getElementById("email");
    const emailError = document.getElementById("email-error");
    // [^\s@]+: Matches one or more characters that are not whitespace and not an @ symbol
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value.trim())) {
        showError(email, emailError, "Please enter a valid email address");
        isValid = false;
    }
    
        // 3. Validate Pickup Date (Required + Min 2 Days)

    const pickupDate = document.getElementById("pickup-date");
    const dateError = document.getElementById("pickup-date-error");
    
    if (!pickupDate.value) {
        showError(pickupDate, dateError, "Pickup date is required");
        isValid = false;
    } else {
        // Create a date object for "Today" at midnight
        const today = new Date();
        
        // Add 2 days to today
        today.setDate(today.getDate() + 2);
        
        // Set the time to 00:00:00 so we compare dates only, not times
        today.setHours(0, 0, 0, 0);
     
     // Parse the selected date as LOCAL midnight (not UTC!)
        const [year, month, day] = pickupDate.value.split('-').map(Number);
    // Create a new Date object using the local year, month, and day, javaScript months are 0-indexed, so we subtract 1 from the month
        const selectedDate = new Date(year, month - 1, day);
        
        if (selectedDate < minDate) {
            showError(pickupDate, dateError, "Pickup must be at least 2 days from now");
            isValid = false;
        }
    }
    
    // 4. Validate Request Type
    const requestType = document.getElementById("request-type");
    const typeError = document.getElementById("request-type-error");
    if (requestType.value === "") {
        showError(requestType, typeError, "Please select a request type");
        isValid = false;
    }
    
    // 5. Validate Message
    const message = document.getElementById("message");
    const messageError = document.getElementById("message-error");
    if (message.value.trim().length < 10) {
        showError(message, messageError, "Message must be at least 10 characters");
        isValid = false;
    }
    
    return isValid;
}

function setMinDate() {
    const dateInput = document.getElementById("pickup-date");
    if (dateInput) {
        // Calculate 2 days from now
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 2);
        
        // Format as YYYY-MM-DD for the HTML 'min' attribute
        const year = minDate.getFullYear();
        const month = String(minDate.getMonth() + 1).padStart(2, '0');
        const day = String(minDate.getDate()).padStart(2, '0');
        
        // Set the minimum selectable date
        dateInput.min = `${year}-${month}-${day}`;
    }
}

function showError(field, errorElement, message) {
    if (field) field.classList.add("invalid");
    if (errorElement) errorElement.textContent = message;
}

document.addEventListener("DOMContentLoaded", init);
