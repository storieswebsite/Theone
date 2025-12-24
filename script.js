// Main Book JavaScript
class DigitalBook {
    constructor() {
        this.currentPage = 1;
        this.totalPages = pages.length;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        // Load saved settings
        this.loadSettings();
        
        // Render all pages
        this.renderPages();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show current page
        this.goToPage(this.currentPage);
        
        // Initialize theme
        this.initTheme();
    }
    
    renderPages() {
        const container = document.getElementById('pages-container');
        container.innerHTML = '';
        
        pages.forEach((page, index) => {
            const pageElement = document.createElement('div');
            pageElement.className = 'page';
            pageElement.id = `page-${index + 1}`;
            pageElement.innerHTML = `
                <h1 class="page-title">${page.title}</h1>
                <div class="page-content ${!page.content ? 'empty' : ''}">
                    ${page.content}
                </div>
                <div class="page-number">Page ${index + 1}</div>
            `;
            container.appendChild(pageElement);
        });
        
        // Update total pages display
        document.getElementById('totalPages').textContent = this.totalPages;
        
        // Update slider
        const slider = document.getElementById('pageSlider');
        slider.max = this.totalPages;
        slider.value = this.currentPage;
    }
    
    setupEventListeners() {
        // Navigation buttons
        document.querySelector('.prev-btn').addEventListener('click', () => this.prevPage());
        document.querySelector('.next-btn').addEventListener('click', () => this.nextPage());
        
        // Quick controls
        document.getElementById('firstPage').addEventListener('click', () => this.goToPage(1));
        document.getElementById('lastPage').addEventListener('click', () => this.goToPage(this.totalPages));
        document.getElementById('prevPage').addEventListener('click', () => this.prevPage());
        document.getElementById('nextPage').addEventListener('click', () => this.nextPage());
        
        // Slider
        const slider = document.getElementById('pageSlider');
        slider.addEventListener('input', (e) => {
            document.getElementById('currentPage').textContent = e.target.value;
        });
        
        slider.addEventListener('change', (e) => {
            this.goToPage(parseInt(e.target.value));
        });
        
        document.getElementById('jumpBtn').addEventListener('click', () => {
            this.goToPage(parseInt(slider.value));
        });
        
        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.closest('.theme-btn').dataset.theme;
                this.switchTheme(theme);
            });
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isAnimating) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    this.prevPage();
                    break;
                case 'ArrowRight':
                case 'PageDown':
                case ' ':
                    e.preventDefault();
                    this.nextPage();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToPage(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToPage(this.totalPages);
                    break;
            }
        });
        
        // Swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
    }
    
    handleSwipe() {
        if (this.isAnimating) return;
        
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next page
                this.nextPage();
            } else {
                // Swipe right - previous page
                this.prevPage();
            }
        }
    }
    
    prevPage() {
        if (this.currentPage > 1 && !this.isAnimating) {
            this.goToPage(this.currentPage - 1);
        }
    }
    
    nextPage() {
        if (this.currentPage < this.totalPages && !this.isAnimating) {
            this.goToPage(this.currentPage + 1);
        }
    }
    
    goToPage(pageNumber) {
        if (this.isAnimating || pageNumber < 1 || pageNumber > this.totalPages) {
            return;
        }
        
        this.isAnimating = true;
        
        // Hide current page with animation
        const currentPageEl = document.getElementById(`page-${this.currentPage}`);
        if (currentPageEl) {
            currentPageEl.classList.remove('active');
            currentPageEl.style.animation = 'pageEnter 0.6s ease reverse forwards';
            
            setTimeout(() => {
                currentPageEl.style.animation = '';
            }, 600);
        }
        
        // Update current page
        this.currentPage = pageNumber;
        
        // Show new page with delay
        setTimeout(() => {
            const newPageEl = document.getElementById(`page-${this.currentPage}`);
            if (newPageEl) {
                newPageEl.classList.add('active');
            }
            
            // Update UI
            this.updateUI();
            
            // Save to localStorage
            this.saveSettings();
            
            this.isAnimating = false;
        }, 300);
    }
    
    updateUI() {
        // Update page indicator
        document.getElementById('currentPage').textContent = this.currentPage;
        
        // Update slider
        document.getElementById('pageSlider').value = this.currentPage;
        
        // Update button states
        const prevBtns = document.querySelectorAll('.prev-btn, #prevPage, #firstPage');
        const nextBtns = document.querySelectorAll('.next-btn, #nextPage, #lastPage');
        
        prevBtns.forEach(btn => {
            btn.disabled = this.currentPage === 1;
        });
        
        nextBtns.forEach(btn => {
            btn.disabled = this.currentPage === this.totalPages;
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Add visual feedback for page turn
        document.querySelector('.book-container').style.transform = 'translateZ(10px)';
        setTimeout(() => {
            document.querySelector('.book-container').style.transform = 'translateZ(0)';
        }, 300);
    }
    
    initTheme() {
        const savedTheme = localStorage.getItem('bookTheme') || 'light';
        this.switchTheme(savedTheme);
        
        // Set active theme button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === savedTheme);
        });
    }
    
    switchTheme(theme) {
        // Remove all theme classes
        document.body.classList.remove('theme-light', 'theme-dark');
        
        // Add new theme class
        document.body.classList.add(`theme-${theme}`);
        
        // Update active theme button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        // Save theme preference
        localStorage.setItem('bookTheme', theme);
        
        // Add theme transition effect
        document.body.style.animation = 'fadeIn 0.5s ease';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }
    
    saveSettings() {
        localStorage.setItem('bookCurrentPage', this.currentPage);
    }
    
    loadSettings() {
        const savedPage = localStorage.getItem('bookCurrentPage');
        if (savedPage) {
            const pageNum = parseInt(savedPage);
            if (pageNum >= 1 && pageNum <= this.totalPages) {
                this.currentPage = pageNum;
            }
        }
    }
}

// Initialize the book when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DigitalBook();
    
    // Add some interactive effects
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
            e.target.style.transform = 'scale(0.95)';
        });
        
        btn.addEventListener('mouseup', (e) => {
            e.target.style.transform = '';
        });
        
        btn.addEventListener('mouseleave', (e) => {
            e.target.style.transform = '';
        });
    });
    
    // Add bookmark click effect
    document.querySelector('.bookmark').addEventListener('click', function() {
        this.style.animation = 'bookmarkSpin 1s, bookmarkPulse 2s infinite';
        setTimeout(() => {
            this.style.animation = 'bookmarkPulse 2s infinite';
        }, 1000);
    });
});