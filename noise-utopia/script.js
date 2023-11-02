 // Initialize functions on page load
      document.addEventListener("DOMContentLoaded", function () {
        setupSoundCloudPlayer();
        updateDateTime();
        setInterval(updateDateTime, 60000);
        fetchWeather();
        populateGridAndFilters(); // This needs to run before you try to access clearButton
      });
      // Setting up SoundCloud player
      function setupSoundCloudPlayer() {
        const soundcloudTrackUrl =
          "https://soundcloud.com/ambientmusicalgenre/essential-ambient-mix";

        const iframeElement = document.createElement("iframe");
        iframeElement.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
          soundcloudTrackUrl
        )}`;
        iframeElement.width = "100%";
        iframeElement.height = "166";
        iframeElement.frameborder = "no";
        iframeElement.scrolling = "no";
        iframeElement.allow = "autoplay";
        iframeElement.style.display = "none";

        const soundcloudPlayerContainer =
          document.getElementById("soundcloud-player");
        soundcloudPlayerContainer.appendChild(iframeElement);

        const widget = SC.Widget(iframeElement);
        const playButton = document.getElementById("playButton");
        const playIcon = playButton.querySelector(".play-icon");
        const stopIcon = playButton.querySelector(".stop-icon");

        playButton.addEventListener("click", () => {
          widget.toggle();

          if (playButton.getAttribute("data-playing") === "false") {
            playIcon.style.display = "none";
            stopIcon.style.display = "block";
            playButton.setAttribute("data-playing", "true");
          } else {
            playIcon.style.display = "block";
            stopIcon.style.display = "none";
            playButton.setAttribute("data-playing", "false");
          }
        });

        const currentlyPlayingElement =
          document.querySelector(".currently-playing");
        let currentTrackTitle = "NOISE MIX PLAYER";

        widget.bind(SC.Widget.Events.PLAY, () => {
          widget.getCurrentSound((sound) => {
            currentTrackTitle = "NOW PLAYING: " + sound.title.toUpperCase();
            currentlyPlayingElement.textContent = currentTrackTitle;
          });
        });

        widget.bind(SC.Widget.Events.PAUSE, () => {
          currentTrackTitle = "NOISE MIX PLAYER";
          currentlyPlayingElement.textContent = currentTrackTitle;
        });
      }

      // Update date and time
      function updateDateTime() {
        const now = new Date();
        const options = { year: "numeric", month: "long", day: "numeric" };

        document.getElementById("date").textContent =
          "Date: " + now.toLocaleDateString("en-US", options);
        document.getElementById("time").textContent =
          "Time: " + now.toLocaleTimeString("en-US");
      }

      // Fetch weather data
      function fetchWeather() {
        const apiKey = "fd31b6f4f5d9fcdeca9b39a97bacc424";
        const city = "Providence, US";

        fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
        )
          .then((response) => response.json())
          .then((data) => {
            const temp = (data.main.temp - 273.15).toFixed(1);
            document.getElementById(
              "weather-data"
            ).textContent = `${temp}°C in ${city}`;
          })
          .catch((error) => {
            console.error(
              "There was a problem with fetching the weather data:",
              error
            );
          });
      }

      // Filter and grid functionality
      const filters = document.getElementById("filters");
      const filtersInitialTop = filters.offsetTop;

      window.addEventListener("scroll", function () {
        if (window.pageYOffset > filtersInitialTop) {
          filters.style.position = "sticky";
          filters.style.top = "0";
        } else {
          filters.style.position = "absolute";
          filters.style.top = filtersInitialTop + "px";
        }
      });

      const filterButtons = document.querySelectorAll(".filter-button");
      const clearButton = document.querySelector(".clear-button");

      function hideOtherFilters(clickedButton) {
        console.log('hideOtherFilters called'); // To confirm function is called

        const filterButtons = document.querySelectorAll(".filter-button");
        filterButtons.forEach((button) => {
          if (button !== clickedButton) {
            button.style.display = "none";
          }
        });
      }

      function showAllFilters() {
        console.log('showAllFilters called'); // To confirm function is called

        const filterButtons = document.querySelectorAll(".filter-button");
        filterButtons.forEach((button) => {
          button.style.display = "inline-block";
        });
      }

      filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
          if (!button.classList.contains("clear-button")) {
            hideOtherFilters(button);
          } else {
            showAllFilters();
          }
        });
      });

      clearButton.addEventListener("click", () => {
        filterGrid("All");
        showAllFilters();
      });

      function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
      }

      // function createDropboxRawLink(link) {
      //   return link + "&raw=1";
      // }

      function createGridItem(data) {
        const gridItem = document.createElement("div");
        gridItem.classList.add("grid-item");
        gridItem.setAttribute("data-category", data.category);
      
        const link = document.createElement("a");
        link.target = "_blank";
        link.href = data.link;
        gridItem.appendChild(link);
      
        const img = document.createElement("img");
        // Directly assign the image URL from the data without modification
        img.src = data.image ? data.image : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250"><rect width="250" height="250" fill="red"/></svg>';
        link.appendChild(img);
      
        const overlay = document.createElement("div");
        overlay.classList.add("overlay");
        overlay.innerHTML = `<h3>${data.title}</h3><p>${data.year} - ${data.name}</p>`;
        link.appendChild(overlay);
      
        return gridItem;
      }      

      function filterGrid(category) {
        const gridItems = document.querySelectorAll(".grid-item");
        gridItems.forEach((item) => {
          const itemCategories = item.dataset.category
            .split(", ")
            .map((cat) => cat.trim());

          if (category === "All" || itemCategories.includes(category)) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });
      }
      function populateGridAndFilters() {
  const url = "./info.json";
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      const container = document.querySelector(".grid-container");
      const sheetData = json.Sheet1;

      shuffleArray(sheetData);

      sheetData.forEach((data) => {
        const gridItem = createGridItem(data);
        container.appendChild(gridItem);
      });

      const categories = [
        ...new Set(
          sheetData.flatMap((item) =>
            item.category.split(", ").map((category) => category.trim())
          )
        ),
      ];

      const filterContainer = document.getElementById("filters");

      // Create and append the clear button first
      const clearButton = document.createElement("button");
      clearButton.textContent = "Clear";
      clearButton.classList.add("filter-button", "clear-button");
      clearButton.style.display = "none"; // Initially hidden
      filterContainer.appendChild(clearButton);

      clearButton.addEventListener("click", function() {
        filterGrid("All");
        showAllFilters();
      });

      // Create filter buttons
      categories.forEach((category) => {
        const filterButton = document.createElement("button");
        filterButton.textContent = category;
        filterButton.classList.add("filter-button");
        filterButton.addEventListener("click", function() {
          hideOtherFilters(this, clearButton); // Also pass the clearButton
          filterGrid(category);
        });
        filterContainer.appendChild(filterButton);
      });
    });
}

function hideOtherFilters(clickedButton, clearButton) {
  // Hide all filter buttons except the clicked one
  const filterButtons = document.querySelectorAll(".filter-button");
  filterButtons.forEach((button) => {
    if (button !== clickedButton && button !== clearButton) {
      button.style.display = "none";
    }
  });
  clearButton.style.display = "inline-block"; // Show the clear button
}

function showAllFilters() {
  // Show all filter buttons and hide the clear button
  const filterButtons = document.querySelectorAll(".filter-button");
  filterButtons.forEach((button) => {
    button.style.display = "inline-block";
  });
  const clearButton = document.querySelector(".clear-button");
  clearButton.style.display = "none"; // Hide the clear button
}

function filterGrid(category) {
  const gridItems = document.querySelectorAll(".grid-item");
  gridItems.forEach((item) => {
    const itemCategories = item.dataset.category
      .split(", ")
      .map((cat) => cat.trim());

    if (category === "All" || itemCategories.includes(category)) {
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });
}

