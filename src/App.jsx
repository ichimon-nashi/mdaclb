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
  const carouselRef = useRef(null);

  useEffect(() => {
    // Check device size
    const checkDeviceSize = () => {
      setIsMobile(window.innerWidth <= 734);
      setIsTablet(window.innerWidth > 734 && window.innerWidth <= 1068);
    };
    
    checkDeviceSize();
    window.addEventListener('resize', checkDeviceSize);
    
    // Apply CSS variable for items per view
    document.documentElement.style.setProperty('--items-per-view', getItemsPerView());
    
    return () => window.removeEventListener('resize', checkDeviceSize);
  }, [isMobile, isTablet]);

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

  // Touch handlers for mobile swiping
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
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
  };

  // Calculate items per view based on screen size
  const getItemsPerView = () => {
    if (isMobile) return 1;
    if (isTablet) return 1; // Show partial view of next item on tablet
    return 1; // Show partial view of next item on desktop
  };

  const itemsPerView = getItemsPerView();
  const totalPages = Math.ceil(filteredClbData.length / itemsPerView);

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

  // Get displayed items for the current page
  const startIndex = currentPage * itemsPerView;
  const visibleItems = filteredClbData.slice(startIndex, startIndex + itemsPerView);

  return (
    <div className="main-container">
      <header className="site-header">
        <div className="header-wrapper">
          <h1>CLB Quick Reference</h1>
          <p className="header-note">&lt;&gt;部分請自行改成適當位置/時機</p>
        </div>
      </header>

      <div className="search-wrapper fixed">
        <div className="search-container">
          <div className="search-box">
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
              <button className="clear-button" onClick={handleReset} aria-label="Clear search">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="main-content">
        <section className="carousel-section">
          <div className="carousel-controls">
            {filteredClbData.length > 0 && totalPages > 1 && (
              <>
                <button 
                  className={`nav-button prev-button ${currentPage === 0 ? 'disabled' : ''}`} 
                  onClick={goPrev}
                  disabled={currentPage === 0}
                  aria-label="Previous page"
                >
                  <svg viewBox="0 0 20 36" className="chevron">
                    <path d="M18.5 1.5 2 18l16.5 16.5" stroke="currentColor" strokeWidth="3" fill="none"/>
                  </svg>
                </button>
                
                <button 
                  className={`nav-button next-button ${currentPage >= totalPages - 1 ? 'disabled' : ''}`} 
                  onClick={goNext}
                  disabled={currentPage >= totalPages - 1}
                  aria-label="Next page"
                >
                  <svg viewBox="0 0 20 36" className="chevron">
                    <path d="M1.5 1.5 18 18 1.5 34.5" stroke="currentColor" strokeWidth="3" fill="none"/>
                  </svg>
                </button>
              </>
            )}
          </div>
          
          <div 
            className="carousel-wrapper" 
            ref={carouselRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {filteredClbData.length > 0 ? (
              <div 
                className="item-row"
                style={{
                  transform: `translateX(${-currentPage * 100}%)`
                }}
              >
                {filteredClbData.map((item, index) => (
                  <div key={index} className="row-item">
                    <div className="item-card">
                      <div className="item-content">
                        <div className="image-wrapper">
                          {item.img ? (
                            <img className="item-image" src={item.img} alt={item.englishText} />
                          ) : (
                            <img className="item-image" src={noImage} alt="No image available" />
                          )}
                        </div>
                        <div className="item-info">
                          <h3 className="item-title">{item.englishText}</h3>
                          <p className="item-description">{item.chineseText}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No matching items found</p>
                <button className="reset-search" onClick={handleReset}>Clear search</button>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  className={`page-dot ${currentPage === index ? 'active' : ''}`}
                  onClick={() => goToPage(index)}
                  aria-label={`Page ${index + 1}`}
                  aria-current={currentPage === index ? 'page' : undefined}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;