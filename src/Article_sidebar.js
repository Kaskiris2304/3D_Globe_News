import React from "react";

function reformatDate(dateStr) {

  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const hour = dateStr.substring(9, 11);
  const minute = dateStr.substring(11, 13);
  const second = dateStr.substring(13, 15);

  
  return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
}

function Sidebar({ selectedCountry, articles }) {
  return (
    <div className="sidebar">
      <h2>{selectedCountry ? `News in ${selectedCountry}` : "Select a country"}</h2>
      {articles.length > 0 ? (
        articles.map((article, index) => {
          const formattedDate = article.seendate ? reformatDate(article.seendate) : null;
          const date = formattedDate ? new Date(formattedDate) : null;
          return (
            <div key={article.url || index} className="article">
              <h3 className="article-title">{article.title}</h3>
              <div className="article-details">
                {article.socialimage && (
                  <img
                    src={article.socialimage}
                    alt={article.title}
                    className="article-image"
                    style={{ width: '60%', height: 'auto' }}
                  />
                )}
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="article-image"
                    style={{ width: '60%', height: 'auto' }}
                  />
                )}
                {article.author && <p><strong>Author:</strong> {article.author}</p>}
                {article.source && <p><strong>Source:</strong> {article.source.name}</p>}
                {article.publishedAt && <p><strong>Date:</strong> {new Date(article.publishedAt).toLocaleDateString()}</p>}
                {date && !isNaN(date.getTime()) && (
                  <p><strong>Date:</strong> {date.toLocaleDateString()}</p>
                )}
                {article.url && (
                  <p>
                    <strong>Read more:</strong> <a href={article.url} target="_blank" rel="noopener noreferrer">{article.url}</a>
                  </p>
                )}
              </div>
              <hr className="article-separator" />
            </div>
          );
        })
      ) : (
        <p>No articles available</p>
      )}
    </div>
  );
}

export default Sidebar;
