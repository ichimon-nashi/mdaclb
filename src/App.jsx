import { useState } from "react";
import { clbData } from "./clbData.js";
import noImage from "./assets/noimage.png";

function App() {
  const [query, setQuery] = useState("");

  // --------SEARCH INPUT FILTER--------
  const handleInputChange = (e) => {
    setQuery(e.target.value.toLowerCase());
    console.log(e.target.value);
  };

  const handleReset = () => {
    setQuery("");
  };

  // Filter CLB items based on query
  const filteredClbData = clbData.filter(
    (item) =>
      item.chineseText.toLowerCase().includes(query.toLowerCase()) ||
      item.englishText.toLowerCase().includes(query.toLowerCase())
  );

  // Map filtered data to components
  const filteredCLBItems = filteredClbData.map((item, index) => (
    <div key={index} className="carousel-item">
      <div className="card bg-base-100 shadow-sm fixed-card">
        <div className="card-img-container">
          {item.img !== "" ? (
            <img className="cardImg" src={item.img} alt={item.englishText} />
          ) : (
            <img className="cardImg" src={noImage} alt="No image available" />
          )}
        </div>
        <div className="card-body">
          <h2 className="card-title">{item.englishText}</h2>
          <p>{item.chineseText}</p>
        </div>
      </div>
    </div>
  ));

  return (
    <>
      <div className="heading">
        <h1>
          <span className="neon">CLB</span> Quick Ref.
        </h1>
        <small>&lt;&gt;部分請自行改成適當位置/時機</small>
      </div>

      <div className="searchbox">
        <label className="searchInput input w-96">
          <svg
            className="icons magnifyingIcon h-[1.2rem] opacity-50"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <g
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2.5"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input
            type="search"
            placeholder="搜尋"
            value={query}
            onChange={handleInputChange}
          />
        </label>
        <button className="icons resetBtn" onClick={handleReset}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="carousel rounded-box">
        {filteredCLBItems.length > 0 ? (
          filteredCLBItems
        ) : (
          <p className="no-results">No matching items found</p>
        )}
      </div>
    </>
  );
}

export default App;