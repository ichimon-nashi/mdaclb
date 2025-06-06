import { useState, useRef, useEffect } from "react";
import { clbData } from "./clbData.js";
import noImage from "./assets/noimage.png";

function App() {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    // Check device size
    const checkDeviceSize = () => {
      setIsMobile(window.innerWidth <= 734);
      setIsTablet(window.innerWidth > 734 && window.innerWidth <= 1068);
    };
    
    checkDeviceSize();
    window.addEventListener('resize', checkDeviceSize);
    
    return () => window.removeEventListener('resize', checkDeviceSize);
  }, []);

  // Update translate position when page changes
  useEffect(() => {
    const newTranslate = -currentPage * 100;
    setCurrentTranslate(newTranslate);
    setPrevTranslate(newTranslate);
    setDragOffset(0);
  }, [currentPage]);

  useEffect(() => {
    // Check device size
    const checkDeviceSize = () => {
      setIsMobile(window.innerWidth <= 734);
      setIsTablet(window.innerWidth > 734 && window.innerWidth <= 1068);
    };
    
    checkDeviceSize();
    window.addEventListener('resize', checkDeviceSize);
    
    return () => window.removeEventListener('resize', checkDeviceSize);
  }, []);

  // Filter CLB items based on query
  const filteredClbData = clbData.filter(
    (item) =>
      item.chineseText.toLowerCase().includes(query.toLowerCase()) ||
      item.englishText.toLowerCase().includes(query.toLowerCase())
  );

  const handleInputChange = (e) => {
    setQuery(e.target.value.toLowerCase());
    setCurrentPage(0);
  };

  const handleReset = () => {
    setQuery("");
    setCurrentPage(0);
  };

  // Modal handlers
  const openModal = (item) => {
    setSelectedCard(item);
    setIsModalOpen(true);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedCard(null);
    setIsModalOpen(false);
    // Restore background scrolling
    document.body.style.overflow = 'unset';
  };

  // Handle card click
  const handleCardClick = (item, e) => {
    // Only open modal if we're not dragging much
    const dragThreshold = 10; // pixels
    if (Math.abs(dragOffset) < dragThreshold) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Opening modal for:', item); // Debug log
      openModal(item);
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isModalOpen]);

  // Mouse drag handlers for desktop
  const onMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(e.clientX);
    setPrevTranslate(currentTranslate);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grabbing';
    }
  };

  const onMouseMove = (e) => {
    if (!isDragging || dragStart === null) return;
    e.preventDefault();
    
    const currentPosition = e.clientX;
    const diff = currentPosition - dragStart;
    const dragPercent = (diff / window.innerWidth) * 100;
    
    setDragOffset(dragPercent);
    setCurrentTranslate(prevTranslate + dragPercent);
  };

  const onMouseUp = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    setIsDragging(false);
    setDragStart(null);
    
    if (carouselRef.current) {
      carouselRef.current.style.cursor = 'grab';
    }
    
    // Determine if we should change page based on drag distance
    const threshold = 15; // Percentage of viewport width
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0 && currentPage > 0) {
        // Dragged right, go to previous page
        goToPage(currentPage - 1);
      } else if (dragOffset < 0 && currentPage < totalPages - 1) {
        // Dragged left, go to next page
        goToPage(currentPage + 1);
      } else {
        // Snap back to current page
        setCurrentTranslate(prevTranslate);
        setDragOffset(0);
      }
    } else {
      // Snap back to current page
      setCurrentTranslate(prevTranslate);
      setDragOffset(0);
    }
  };

  // Touch handlers for mobile swiping
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    setDragStart(e.targetTouches[0].clientX);
    setPrevTranslate(currentTranslate);
  };

  const onTouchMove = (e) => {
    const currentPosition = e.targetTouches[0].clientX;
    setTouchEnd(currentPosition);
    
    if (!isDragging || dragStart === null) return;
    
    const diff = currentPosition - dragStart;
    const dragPercent = (diff / window.innerWidth) * 100;
    
    setDragOffset(dragPercent);
    setCurrentTranslate(prevTranslate + dragPercent);
  };

  const onTouchEnd = () => {
    if (!isDragging) {
      // Fallback to original swipe logic
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
      
      if (isLeftSwipe && currentPage < totalPages - 1) {
        goNext();
      }
      
      if (isRightSwipe && currentPage > 0) {
        goPrev();
      }
      return;
    }

    setIsDragging(false);
    setDragStart(null);
    
    // Determine if we should change page based on drag distance
    const threshold = 15; // Percentage of viewport width
    
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0 && currentPage > 0) {
        // Dragged right, go to previous page
        goToPage(currentPage - 1);
      } else if (dragOffset < 0 && currentPage < totalPages - 1) {
        // Dragged left, go to next page
        goToPage(currentPage + 1);
      } else {
        // Snap back to current page
        setCurrentTranslate(prevTranslate);
        setDragOffset(0);
      }
    } else {
      // Snap back to current page
      setCurrentTranslate(prevTranslate);
      setDragOffset(0);
    }
  };

  // Calculate items per view based on screen size
  const getItemsPerView = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  const itemsPerView = getItemsPerView();
  const totalPages = Math.ceil(filteredClbData.length / itemsPerView);

  // Helper function to determine card position for smart repositioning
  const getCardPositionClass = (index, totalItems, currentPage, itemsPerView) => {
    const startIndex = currentPage * itemsPerView;
    const endIndex = startIndex + itemsPerView - 1;
    const relativeIndex = index - startIndex;
    
    // Only apply classes to currently visible cards
    if (index < startIndex || index > endIndex) return '';
    
    if (itemsPerView === 1) return 'card-single'; // Mobile - single card
    if (itemsPerView === 2) {
      // Tablet - 2 cards
      if (relativeIndex === 0) return 'card-left-edge';
      if (relativeIndex === 1) return 'card-right-edge';
    }
    if (itemsPerView === 3) {
      // Desktop - 3 cards
      if (relativeIndex === 0) return 'card-left-edge';
      if (relativeIndex === 1) return 'card-center';
      if (relativeIndex === 2) return 'card-right-edge';
    }
    return '';
  };

  // Navigation handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  const goNext = () => {
    goToPage(currentPage + 1);
  };

  const goPrev = () => {
    goToPage(currentPage - 1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">CLB Quick Reference</h1>
          <p className="app-subtitle">&lt;&gt;部分請自行改成適當位置/時機</p>
        </div>
      </header>

      <div className="search-section">
        <div className="search-container">
          <div className="search-input-group">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input
              type="search"
              className="search-input"
              placeholder="搜尋"
              value={query}
              onChange={handleInputChange}
              aria-label="Search for CLB items"
            />
            {query !== "" && (
              <button className="search-clear-btn" onClick={handleReset} aria-label="Clear search">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="app-main">
        <section className="carousel-container">
          <div className="carousel-nav-controls">
            {filteredClbData.length > 0 && totalPages > 1 && (
              <>
                <button 
                  className={`carousel-nav-btn carousel-prev-btn ${currentPage === 0 ? 'carousel-nav-disabled' : ''}`} 
                  onClick={goPrev}
                  disabled={currentPage === 0}
                  aria-label="Previous page"
                >
                  <svg viewBox="0 0 20 36" className="carousel-chevron">
                    <path d="M18.5 1.5 2 18l16.5 16.5" stroke="currentColor" strokeWidth="3" fill="none"/>
                  </svg>
                </button>
                
                <button 
                  className={`carousel-nav-btn carousel-next-btn ${currentPage >= totalPages - 1 ? 'carousel-nav-disabled' : ''}`} 
                  onClick={goNext}
                  disabled={currentPage >= totalPages - 1}
                  aria-label="Next page"
                >
                  <svg viewBox="0 0 20 36" className="carousel-chevron">
                    <path d="M1.5 1.5 18 18 1.5 34.5" stroke="currentColor" strokeWidth="3" fill="none"/>
                  </svg>
                </button>
              </>
            )}
          </div>
          
          <div 
            className="carousel-viewport" 
            ref={carouselRef}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {filteredClbData.length > 0 ? (
              <div 
                className="carousel-track"
                style={{
                  transform: `translateX(${currentTranslate + dragOffset}%)`,
                  transition: isDragging ? 'none' : 'var(--transition-smooth)'
                }}
              >
                {filteredClbData.map((item, index) => (
                  <div key={index} className="carousel-slide">
                    <article 
                      className={`card ${getCardPositionClass(index, filteredClbData.length, currentPage, itemsPerView)}`}
                      onClick={(e) => handleCardClick(item, e)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openModal(item);
                        }
                      }}
                      aria-label={`View details for ${item.englishText}`}
                    >
                      <div className="card-content">
                        <div className="card-image-container">
                          <img 
                            className="card-image" 
                            src={item.img || noImage} 
                            alt={item.img ? item.englishText : 'No image available'} 
                          />
                        </div>
                        <div className="card-text-content">
                          <h3 className="card-title">{item.englishText}</h3>
                          <p className="card-description">{item.chineseText}</p>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results-container">
                <p className="no-results-text">No matching items found</p>
                <button className="no-results-btn" onClick={handleReset}>Clear search</button>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="carousel-pagination">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  className={`pagination-dot ${currentPage === index ? 'pagination-dot-active' : ''}`}
                  onClick={() => goToPage(index)}
                  aria-label={`Page ${index + 1}`}
                  aria-current={currentPage === index ? 'page' : undefined}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal */}
      {isModalOpen && selectedCard && (
        <div 
          className="modal-overlay" 
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn" 
              onClick={closeModal}
              aria-label="Close modal"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            
            <div className="modal-content">
              <div className="modal-image-container">
                <img 
                  className="modal-image" 
                  src={selectedCard.img || noImage} 
                  alt={selectedCard.img ? selectedCard.englishText : 'No image available'} 
                />
              </div>
              
              <div className="modal-text-content">
                <h2 id="modal-title" className="modal-title">{selectedCard.englishText}</h2>
                <p className="modal-description">{selectedCard.chineseText}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;