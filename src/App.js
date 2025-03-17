import React, { useRef, useEffect, useState } from "react";
import { Viewer, Entity } from "resium";
import { Cartesian3, Color, ScreenSpaceEventHandler, ScreenSpaceEventType, LabelStyle, VerticalOrigin, Cartesian2 } from "cesium";
import { countries } from "./countries";
import LanguageSelector from "./language_selector";
import Sidebar from "./Article_sidebar";
import SearchBar from "./SearchBar";
import "./App.css";

function App() {
  const viewerRef = useRef(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState(null);
  const [articles, setArticles] = useState([]);
  const [language, setLanguage] = useState("en");
  const [searchTerm, setSearchTerm] = useState("");

  const validCountryCodes = [
  'ae', 'ar', 'at', 'au', 'be', 'bg', 'br', 'ca', 'ch', 'cn',
  'co', 'cu', 'cz', 'de', 'eg', 'fr', 'gb', 'gr', 'hk', 'hu',
  'id', 'ie', 'il', 'in', 'it', 'jp', 'kr', 'lt', 'lv', 'ma',
  'mx', 'my', 'ng', 'nl', 'no', 'nz', 'ph', 'pl', 'pt', 'ro',
  'rs', 'ru', 'sa', 'se', 'sg', 'si', 'sk', 'th', 'tr', 'tw',
  'ua', 'us', 've', 'za'
];

  const validCountryCodes2 = [
  'au', 'br', 'ca', 'cn', 'de', 'eg', 'fr', 'gb', 'gr', 'hk', 'in',
  'ie', 'il', 'it', 'jp', 'nl', 'no', 'pk', 'pe', 'ph', 'pt',
  'ro', 'ru', 'sg', 'es', 'se', 'ch', 'tw', 'ua', 'us'
  ];

  //hovering and selecting countries
  useEffect(() => {
    if (viewerRef.current) {
      const viewer = viewerRef.current.cesiumElement;
      if (viewer) {
        const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

        handler.setInputAction((movement) => {
          const pickedObject = viewer.scene.pick(movement.endPosition);
          if (pickedObject && pickedObject.id) {
            setHoveredCountry(pickedObject.id.name);
          } else {
            setHoveredCountry(null);
          }
        }, ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction((click) => {
          const pickedObject = viewer.scene.pick(click.position);
          if (pickedObject && pickedObject.id) {
            console.log("Selected Country:", pickedObject.id.name, pickedObject.id.code);  // Log selected country and code
            setSelectedCountry(pickedObject.id._name);
            setSelectedCountryCode(pickedObject.id.code)
          }
        }, ScreenSpaceEventType.LEFT_CLICK);

        return () => {
          handler.destroy();
        };
      }
    }
  });



  // fetching of articles
  useEffect(() => {
    if (validCountryCodes.includes(selectedCountryCode) && !searchTerm) {
      fetchArticles(selectedCountryCode);
    } else if (!validCountryCodes.includes(selectedCountryCode) && !searchTerm) {
      fetchArticles(selectedCountry);
    }
  }, [selectedCountryCode, selectedCountry]);



  //fetching articles function
  const fetchArticles = (country, query) => {
      const apiKey = 'c573f39a53cd4eeea0341e609c251baf';
      const gnewsApiKey = '14ddbe11c97ebbd3e479b6e4f3bce88c';
      let url = ``;

      if (query && validCountryCodes2.includes(selectedCountryCode)) {
          url = `https://gnews.io/api/v4/search?q=${query}&country=${country}&apikey=${gnewsApiKey}`;
      } else if (query && !validCountryCodes2.includes(selectedCountryCode)) {
          if (/\s/.test(country)) {
            country = country.replace(/\s+/g, '');
          }
          url = `https://api.gdeltproject.org/api/v2/doc/doc?query=sourcecountry:${country} '${query}'&mode=artlist&format=json&sort=datedesc&maxrecords=100`;
      } else if (!query && validCountryCodes.includes(selectedCountryCode)) {
          //url = `https://newsapi.org/v2/top-headlines?country=${country}&pageSize=100&apiKey=${apiKey}`;
          url = `https://gnews.io/api/v4/top-headlines?country=${country}&apikey=${gnewsApiKey}`
      } else if (!query && country !== null) {
          if (/\s/.test(country)) {
            country = country.replace(/\s+/g, '');
          }
          url = `https://api.gdeltproject.org/api/v2/doc/doc?query=sourcecountry:${country}&mode=artlist&format=json&sort=datedesc&maxrecords=100`;
      }

      const req = new Request(url);


      fetch(req)
          .then(response => response.json())
          .then(async data => {
              console.log("Original articles:", data);


              let seenTitles = new Set();
              let articles = data.articles
                  .filter(article =>
                      !(
                          article.title.includes("[Removed]") ||
                          (article.content && article.content.includes("[Removed]")) ||
                          (article.source && article.source.name.includes("[Removed]"))
                      )
                  )
                  .filter(article => {
                      const title = article.title.toLowerCase();
                      if (seenTitles.has(title)) {
                          return false;
                      }
                      console.log(article.urlToImage);
                      seenTitles.add(title);
                      return true;
                  });

              //const translatedArticles = await translateArticleTitles(articles);
              setArticles(articles); 
          })
          .catch(error => {
              console.error("Error fetching articles:", error);
          });
  };



//translate function
const translateArticleTitles = async (articles) => {
  const apiKey = 'AIzaSyBjwq6x_gVXzuFCGq6S11egdCgUou3nVDg';
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  return Promise.all(articles.map(async (article) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: article.title,
        target: language,
      }),
    });

    const data = await response.json();
    const translatedTitle = data.data.translations[0].translatedText;

    const translatedTitle2 = decodeEntities(translatedTitle);

    return { ...article, title: translatedTitle2 };
  }));
};


//manual fetch of articles
const handleSearch = () => {
    if (validCountryCodes.includes(selectedCountryCode)) {
      fetchArticles(selectedCountryCode, searchTerm || null);
    }
    else {
      fetchArticles(selectedCountry, searchTerm || null);
    }
  };


  function decodeEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
  }



  //html structure
  return (
    <div className="app">
      <div className="globeContainer">
        <div className="language-selector">
          <LanguageSelector language={language} setLanguage={setLanguage} />
        </div>
        <div className="searchBar">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleSearch={handleSearch} />
        </div>
        <div className="globe">
          <Viewer full ref={viewerRef}>
            {countries.map((country, index) => (
              <Entity
                key={index}
                name={country.name}
                code={country.code}
                position={Cartesian3.fromDegrees(country.position.lon, country.position.lat)}
                point={{
                  pixelSize: 9,
                  color: validCountryCodes.includes(country.code) ? Color.YELLOW : Color.RED,
                }}
                label={{
                  text: hoveredCountry === country.name ? country.name : "",
                  font: "18pt sans-serif",
                  style: LabelStyle.FILL_AND_OUTLINE,
                  outlineWidth: 2,
                  verticalOrigin: VerticalOrigin.BOTTOM,
                  pixelOffset: new Cartesian2(0, -9),
                }}
              />
            ))}
          </Viewer>
        </div>
      </div>
      <Sidebar selectedCountry={selectedCountry} articles={articles} />
    </div>
  );
}

export default App;
