// CheapShark "search games" endpoint.
// Example: https://www.cheapshark.com/api/1.0/games?title=portal&pageSize=10
// Returns: gameID, external (title), cheapest, cheapestDealID, steamAppID, thumb, etc.
const BASE_URL = "https://www.cheapshark.com/api/1.0/games";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const cardsGrid = document.getElementById("cards-grid");
const statusMessage = document.getElementById("status-message");

// Popmotion keyframes (from Animation -> Keyframes)
const { keyframes } = window.popmotion || {};

document.addEventListener("DOMContentLoaded", () => {
  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  });
});

function handleSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    statusMessage.textContent = "Please type a game title first.";
    return;
  }

  fetchGames(query);
}

function fetchGames(query) {
  statusMessage.textContent = `Searching for "${query}"...`;
  cardsGrid.innerHTML = "";

  const url = `${BASE_URL}?title=${encodeURIComponent(query)}&pageSize=8`;

  fetch(url)
    .then((res) => res.json())
    .then((games) => {
      if (!Array.isArray(games) || games.length === 0) {
        statusMessage.textContent = `No results found for "${query}".`;
        return;
      }

      renderGames(games);
      statusMessage.textContent = `Showing ${games.length} result(s) for "${query}".`;
      animateCards();
    })
    .catch((err) => {
      console.error("Error fetching games:", err);
      statusMessage.textContent = "Error loading games. Please try again.";
    });
}

function renderGames(games) {
  cardsGrid.innerHTML = "";

  games.forEach((game) => {
    const card = document.createElement("article");
    card.className = "game-card";

    const title = game.external || "Unknown title";
    const cheapest = game.cheapest ? Number(game.cheapest).toFixed(2) : "N/A";
    const thumb = game.thumb || "";
    const steamAppID = game.steamAppID || null;

    // CheapShark redirect link to the cheapest deal (will usually go to Steam or another store)
    const dealLink = game.cheapestDealID
      ? `https://www.cheapshark.com/redirect?dealID=${game.cheapestDealID}`
      : null;

    card.innerHTML = `
      <div class="game-top">
        <img
          class="game-thumb"
          src="${thumb}"
          alt="${title}"
        />
        <div class="game-main">
          <div class="game-title">${title}</div>
          <div class="game-sub">
            ${steamAppID ? `Steam App ID: ${steamAppID}` : "No Steam ID listed"}
          </div>
        </div>
      </div>

      <div class="game-bottom">
        <div class="game-price">
          Cheapest price: <span>$${cheapest}</span>
        </div>
        ${
          dealLink
            ? `<a class="view-deal" href="${dealLink}" target="_blank" rel="noopener noreferrer">
                 View Deal
               </a>`
            : ""
        }
      </div>
    `;

    cardsGrid.appendChild(card);
  });
}

// Animate cards with Popmotion Keyframes
function animateCards() {
  const cards = document.querySelectorAll(".game-card");

  if (!keyframes) {
    console.warn("Popmotion keyframes not available – showing cards without animation.");
    cards.forEach((card) => {
      card.style.opacity = 1;
      card.style.transform = "translateY(0)";
    });
    return;
  }

  cards.forEach((card, index) => {
    keyframes({
      values: [
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0 }
      ],
      duration: 600,
      ease: "easeOut",
      delay: index * 120, // stagger so they cascade in
      onUpdate: (latest) => {
        card.style.opacity = latest.opacity;
        card.style.transform = `translateY(${latest.y}px)`;
      }
    });
  });
}
