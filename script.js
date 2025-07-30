// DOM Elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const themeToggle = document.getElementById('theme-toggle');
const loginTab = document.getElementById('login-tab');
const logoutTab = document.getElementById('logout-tab');
const adminTab = document.getElementById('admin-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const bookForm = document.getElementById('book-form');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const categoryFilter = document.getElementById('category');
const approvedBooksList = document.getElementById('approved-books');
const bookRequestsContainer = document.getElementById('book-requests');
const refreshRequestsBtn = document.getElementById('refresh-requests');
const loginLink = document.getElementById('login-link');
const signupLink = document.getElementById('signup-link');

// State
let currentUser = null;
let books = [];
let pendingBooks = [];
let currentPage = 1;
const booksPerPage = 6;

// Sample Data - In a real app, this would come from a database
const sampleBooks = [
  {
    id: 1,
    title: "Database Mangement System",
    author: "Thomas H. Cormen",
    price: 1200,
    category: "engineering",
    description: "Excellent condition, barely used. 3rd edition.",
    contact: "john@university.edu",
    approved: true
  },
  {
    id: 2,
    title: "Data Structure",
    author: "James Stewart",
    price: 800,
    category: "math",
    description: "Good condition with some highlights. 8th edition.",
    contact: "sarah@university.edu",
    approved: true
  },
  {
    id: 3,
    title: "Principles of Economics",
    author: "N. Gregory Mankiw",
    price: 950,
    category: "business",
    description: "Like new, no markings. 7th edition.",
    contact: "mike@university.edu",
    approved: true
  },
  {
    id: 4,
    title: "Organic Chemistry",
    author: "Paula Yurkanis Bruice",
    price: 1100,
    category: "science",
    description: "Some wear but all pages intact. 6th edition.",
    contact: "lisa@university.edu",
    approved: true
  },
  {
    id: 5,
    title: "Maths",
    author: "Stephen Greenblatt",
    price: 700,
    category: "humanities",
    description: "Good condition, minor highlighting. 9th edition.",
    contact: "david@university.edu",
    approved: true
  },
  {
    id: 6,
    title: "Design Basics",
    author: "David A. Lauer",
    price: 650,
    category: "arts",
    description: "Fair condition, cover has some wear. 8th edition.",
    contact: "emma@university.edu",
    approved: true
  }
];

const samplePendingBooks = [
  {
    id: 7,
    title: "Digital Fundamental",
    author: "David C. Lay",
    price: 900,
    category: "math",
    description: "Very good condition, no markings. 5th edition.",
    contact: "alex@university.edu",
    approved: false
  },
  {
    id: 8,
    title: "Fundamentals of Physics",
    author: "David Halliday",
    price: 850,
    category: "science",
    description: "Some highlighting but in good condition. 10th edition.",
    contact: "taylor@university.edu",
    approved: false
  }
];

// Initialize the app
function init() {
  books = sampleBooks;
  pendingBooks = samplePendingBooks;
  
  // Load theme preference from localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }
  
  // Load user session if exists
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateAuthUI();
  }
  
  renderBooks();
  setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      switchTab(target);
    });
  });
  
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);
  
  // Login form
  loginForm.addEventListener('submit', handleLogin);
  
  // Signup form
  signupForm.addEventListener('submit', handleSignup);
  
  // Book form
  bookForm.addEventListener('submit', handleBookSubmit);
  
  // Search and filter
  searchButton.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  categoryFilter.addEventListener('change', handleSearch);
  
  // Admin panel
  refreshRequestsBtn.addEventListener('click', refreshBookRequests);
  
  // Navigation between login/signup
  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('login');
  });
  
  signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('signup');
  });
  
  // Logout
  logoutTab.addEventListener('click', handleLogout);
}

// Tab switching function
function switchTab(target) {
  // Hide all tab contents
  tabContents.forEach(content => {
    content.classList.remove('active');
  });
  
  // Deactivate all tabs
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Activate selected tab
  const selectedTab = document.querySelector(`[data-target="${target}"]`);
  const selectedContent = document.getElementById(target);
  
  if (selectedTab && selectedContent) {
    selectedTab.classList.add('active');
    selectedContent.classList.add('active');
    
    // Special cases
    if (target === 'admin') {
      refreshBookRequests();
    }
  }
}

// Theme functions
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector('i');
  icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Authentication functions
function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  // Simple validation - in a real app, this would check against a database
  if (username && password) {
    currentUser = {
      username,
      isAdmin: username.toLowerCase() === 'admin' // Simple admin check
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    
    // Redirect based on user role
    if (currentUser.isAdmin) {
      switchTab('admin');
    } else {
      switchTab('home');
    }
    
    // Clear form
    loginForm.reset();
  } else {
    alert('Please enter both username and password');
  }
}

function handleSignup(e) {
  e.preventDefault();
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  // Simple validation
  if (!username || !email || !password || !confirmPassword) {
    alert('Please fill in all fields');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  // In a real app, this would create a new user in the database
  alert(`Account created for ${username}! Please login.`);
  switchTab('login');
  signupForm.reset();
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  updateAuthUI();
  switchTab('home');
}

function updateAuthUI() {
  if (currentUser) {
    loginTab.style.display = 'none';
    logoutTab.style.display = 'block';
    adminTab.style.display = currentUser.isAdmin ? 'block' : 'none';
  } else {
    loginTab.style.display = 'block';
    logoutTab.style.display = 'none';
    adminTab.style.display = 'none';
  }
}

// Book functions
function handleBookSubmit(e) {
  e.preventDefault();
  
  if (!currentUser) {
    alert('Please login to sell a book');
    switchTab('login');
    return;
  }
  
  const newBook = {
    id: Date.now(), // Simple ID generation
    title: document.getElementById('book-title').value,
    author: document.getElementById('author').value,
    price: parseFloat(document.getElementById('price').value),
    category: document.getElementById('book-category').value,
    description: document.getElementById('description').value,
    contact: document.getElementById('contact').value,
    approved: currentUser.isAdmin // Auto-approve if admin
  };
  
  if (newBook.approved) {
    books.push(newBook);
    renderBooks();
  } else {
    pendingBooks.push(newBook);
    alert('Your book has been submitted for approval. Thank you!');
  }
  
  // Clear form
  bookForm.reset();
  
  // Redirect
  switchTab('home');
}

function renderBooks(filteredBooks = books) {
  const startIdx = (currentPage - 1) * booksPerPage;
  const endIdx = startIdx + booksPerPage;
  const paginatedBooks = filteredBooks.slice(startIdx, endIdx);
  
  approvedBooksList.innerHTML = '';
  
  if (paginatedBooks.length === 0) {
    approvedBooksList.innerHTML = '<p>No books found. Try adjusting your search.</p>';
    document.getElementById('pagination').innerHTML = '';
    return;
  }
  
  paginatedBooks.forEach(book => {
    const bookCard = document.createElement('li');
    bookCard.className = 'book-card';
    bookCard.innerHTML = `
      <div class="book-image">
       
      </div>
      <div class="book-details">
        <h3>${book.title}</h3>
        <div class="book-meta">
          <span class="book-author">${book.author}</span>
          <span class="book-category">${formatCategory(book.category)}</span>
        </div>
        <div class="book-price">₹${book.price.toFixed(2)}</div>
        <p class="book-description">${book.description}</p>
        <div class="book-contact">Contact: ${book.contact}</div>
      </div>
    `;
    approvedBooksList.appendChild(bookCard);
  });
  
  renderPagination(filteredBooks.length);
}

function formatCategory(category) {
  const categories = {
    'math': 'Mathematics',
    'science': 'Science',
    'engineering': 'Engineering',
    'business': 'Business',
    'humanities': 'Humanities',
    'arts': 'Arts'
  };
  return categories[category] || category;
}

function renderPagination(totalBooks) {
  const totalPages = Math.ceil(totalBooks / booksPerPage);
  const paginationContainer = document.getElementById('pagination');
  
  paginationContainer.innerHTML = '';
  
  if (totalPages <= 1) return;
  
  // Previous button
  if (currentPage > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.innerHTML = '&laquo;';
    prevBtn.addEventListener('click', () => {
      currentPage--;
      handleSearch();
    });
    paginationContainer.appendChild(prevBtn);
  }
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      handleSearch();
    });
    paginationContainer.appendChild(pageBtn);
  }
  
  // Next button
  if (currentPage < totalPages) {
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.innerHTML = '&raquo;';
    nextBtn.addEventListener('click', () => {
      currentPage++;
      handleSearch();
    });
    paginationContainer.appendChild(nextBtn);
  }
}

function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;
  
  let filteredBooks = books;
  
  // Filter by search term
  if (searchTerm) {
    filteredBooks = filteredBooks.filter(book => 
      book.title.toLowerCase().includes(searchTerm) || 
      book.author.toLowerCase().includes(searchTerm) ||
      book.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter by category
  if (selectedCategory !== 'all') {
    filteredBooks = filteredBooks.filter(book => book.category === selectedCategory);
  }
  
  // Reset to first page when search/filter changes
  currentPage = 1;
  renderBooks(filteredBooks);
}

// Admin functions
function refreshBookRequests() {
  if (!currentUser || !currentUser.isAdmin) {
    bookRequestsContainer.innerHTML = '<p>Access denied. Please login as admin.</p>';
    return;
  }
  
  bookRequestsContainer.innerHTML = '';
  
  if (pendingBooks.length === 0) {
    bookRequestsContainer.innerHTML = '<p>No pending book requests.</p>';
    return;
  }
  
  pendingBooks.forEach(book => {
    const requestCard = document.createElement('div');
    requestCard.className = 'request-card';
    requestCard.innerHTML = `
      <h3>${book.title}</h3>
      <p><strong>Author:</strong> ${book.author}</p>
      <p><strong>Price:</strong> ₹${book.price.toFixed(2)}</p>
      <p><strong>Category:</strong> ${formatCategory(book.category)}</p>
      <p><strong>Description:</strong> ${book.description}</p>
      <p><strong>Contact:</strong> ${book.contact}</p>
      <div class="request-actions">
        <button class="approve-btn" data-id="${book.id}">Approve</button>
        <button class="reject-btn" data-id="${book.id}">Reject</button>
      </div>
    `;
    bookRequestsContainer.appendChild(requestCard);
  });
  
  // Add event listeners to action buttons
  document.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', () => handleBookApproval(btn.dataset.id, true));
  });
  
  document.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', () => handleBookApproval(btn.dataset.id, false));
  });
}

function handleBookApproval(bookId, approve) {
  bookId = parseInt(bookId);
  const bookIndex = pendingBooks.findIndex(book => book.id === bookId);
  
  if (bookIndex !== -1) {
    const book = pendingBooks[bookIndex];
    
    if (approve) {
      book.approved = true;
      books.push(book);
      renderBooks();
    }
    
    pendingBooks.splice(bookIndex, 1);
    refreshBookRequests();
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);