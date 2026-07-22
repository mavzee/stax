import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Star,
  Store,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";

import "./user.css";

const cardItems = [
  {
    id: 1,
    name: "Charizard ex",
    game: "Pokemon",
    set: "Obsidian Flames",
    rarity: "Special Illustration Rare",
    condition: "Near Mint",
    price: 4250,
    stock: 2,
    seller: "Dragon Vault",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Blue-Eyes White Dragon",
    game: "Yu-Gi-Oh!",
    set: "Legend of Blue Eyes",
    rarity: "Ultra Rare",
    condition: "Excellent",
    price: 1950,
    stock: 4,
    seller: "Duelist Corner",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Monkey D. Luffy",
    game: "One Piece",
    set: "Romance Dawn",
    rarity: "Leader Parallel",
    condition: "Near Mint",
    price: 3200,
    stock: 1,
    seller: "Grand Line Cards",
    rating: 5,
  },
  {
    id: 4,
    name: "Jace, the Mind Sculptor",
    game: "Magic",
    set: "Worldwake",
    rarity: "Mythic Rare",
    condition: "Excellent",
    price: 2200,
    stock: 3,
    seller: "Mana Market",
    rating: 4.7,
  },
  {
    id: 5,
    name: "Pikachu VMAX",
    game: "Pokemon",
    set: "Vivid Voltage",
    rarity: "Rainbow Rare",
    condition: "Near Mint",
    price: 5400,
    stock: 2,
    seller: "Pika Shop",
    rating: 4.9,
  },
  {
    id: 6,
    name: "Red-Eyes Black Dragon",
    game: "Yu-Gi-Oh!",
    set: "Metal Raiders",
    rarity: "Ultra Rare",
    condition: "Lightly Played",
    price: 1350,
    stock: 5,
    seller: "Duelist Corner",
    rating: 4.6,
  },
];

const shopEvents = [
  {
    id: 1,
    title: "Saturday Pokemon League",
    game: "Pokemon",
    date: "August 3, 2026",
    time: "2:00 PM",
    venue: "STAX Card Shop",
    fee: 150,
    slots: 8,
  },
  {
    id: 2,
    title: "One Piece Weekly Tournament",
    game: "One Piece",
    date: "August 7, 2026",
    time: "5:30 PM",
    venue: "STAX Card Shop",
    fee: 250,
    slots: 12,
  },
  {
    id: 3,
    title: "Yu-Gi-Oh! Duel Night",
    game: "Yu-Gi-Oh!",
    date: "August 10, 2026",
    time: "4:00 PM",
    venue: "STAX Card Shop",
    fee: 200,
    slots: 6,
  },
];

const rankings = {
  1: [
    { rank: 1, name: "Marco Santos", wins: 18, losses: 2, points: 56 },
    { rank: 2, name: "Jared Cruz", wins: 16, losses: 4, points: 50 },
    { rank: 3, name: "Paolo Reyes", wins: 14, losses: 5, points: 44 },
    { rank: 4, name: "Luis Mendoza", wins: 12, losses: 7, points: 38 },
  ],
  2: [
    { rank: 1, name: "Kevin Lim", wins: 15, losses: 3, points: 48 },
    { rank: 2, name: "Joshua Tan", wins: 13, losses: 4, points: 42 },
    { rank: 3, name: "Miguel Ramos", wins: 11, losses: 6, points: 36 },
    { rank: 4, name: "Aaron Flores", wins: 10, losses: 8, points: 32 },
  ],
  3: [
    { rank: 1, name: "Daniel Sy", wins: 12, losses: 4, points: 40 },
    { rank: 2, name: "Ken Garcia", wins: 11, losses: 5, points: 36 },
    { rank: 3, name: "Ralph Ong", wins: 9, losses: 7, points: 30 },
    { rank: 4, name: "John Velasco", wins: 8, losses: 8, points: 27 },
  ],
  4: [
    { rank: 1, name: "Ivan Guerrero", wins: 10, losses: 5, points: 34 },
    { rank: 2, name: "Chris Dela Cruz", wins: 9, losses: 6, points: 31 },
    { rank: 3, name: "Nathan Lee", wins: 8, losses: 7, points: 28 },
    { rank: 4, name: "Sam Bautista", wins: 7, losses: 8, points: 25 },
  ],
};

const initialQuestions = [
  {
    id: 1,
    user: "Paolo R.",
    category: "Card Rules",
    question: "Can I use Japanese cards in local Pokemon tournaments?",
    replies: 8,
    time: "2 hours ago",
  },
  {
    id: 2,
    user: "Marco S.",
    category: "Deck Building",
    question: "What is a good beginner deck for One Piece?",
    replies: 12,
    time: "5 hours ago",
  },
  {
    id: 3,
    user: "Jared C.",
    category: "Events",
    question: "Can I register for an event directly at the shop?",
    replies: 4,
    time: "Yesterday",
  },
];

const menuItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "shop", label: "Card Shop", icon: Store },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "rankings", label: "Rankings", icon: Trophy },
  { id: "community", label: "Community", icon: MessageCircle },
  { id: "cart", label: "My Cart", icon: ShoppingCart },
  { id: "profile", label: "Profile", icon: User },
];

function formatPrice(price) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(price);
}

function UserApp() {
  const [activePage, setActivePage] = useState("home");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [gameFilter, setGameFilter] = useState("All");
  const [selectedBracket, setSelectedBracket] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [questions, setQuestions] = useState(initialQuestions);
  const [questionText, setQuestionText] = useState("");

  const filteredCards = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return cardItems.filter((card) => {
      const matchesSearch =
        !search ||
        card.name.toLowerCase().includes(search) ||
        card.game.toLowerCase().includes(search) ||
        card.set.toLowerCase().includes(search);

      const matchesGame =
        gameFilter === "All" || card.game === gameFilter;

      return matchesSearch && matchesGame;
    });
  }, [searchText, gameFilter]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  function navigate(page) {
    setActivePage(page);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleFavorite(cardId) {
    setFavorites((current) =>
      current.includes(cardId)
        ? current.filter((id) => id !== cardId)
        : [...current, cardId]
    );
  }

  function addToCart(card) {
    setCart((current) => {
      const existingItem = current.find((item) => item.id === card.id);

      if (existingItem) {
        return current.map((item) =>
          item.id === card.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, card.stock),
              }
            : item
        );
      }

      return [...current, { ...card, quantity: 1 }];
    });
  }

  function changeQuantity(cardId, amount) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === cardId
            ? {
                ...item,
                quantity: Math.max(
                  0,
                  Math.min(item.quantity + amount, item.stock)
                ),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function submitQuestion(event) {
    event.preventDefault();

    const cleanQuestion = questionText.trim();

    if (!cleanQuestion) {
      return;
    }

    const newQuestion = {
      id: Date.now(),
      user: "Ivan G.",
      category: "General",
      question: cleanQuestion,
      replies: 0,
      time: "Just now",
    };

    setQuestions((current) => [newQuestion, ...current]);
    setQuestionText("");
  }

  function renderCardGrid(limit) {
    const displayedCards = limit
      ? filteredCards.slice(0, limit)
      : filteredCards;

    return (
      <div className="card-market-grid">
        {displayedCards.map((card) => (
          <article className="market-card" key={card.id}>
            <div className={`market-card__image game-image-${card.id}`}>
              <span>{card.game}</span>

              <button
                type="button"
                className={`favorite-button ${
                  favorites.includes(card.id) ? "is-favorite" : ""
                }`}
                onClick={() => toggleFavorite(card.id)}
                aria-label="Add card to favorites"
              >
                <Heart size={19} />
              </button>
            </div>

            <div className="market-card__body">
              <div className="market-card__game-row">
                <span>{card.set}</span>

                <span className="rating">
                  <Star size={14} fill="currentColor" />
                  {card.rating}
                </span>
              </div>

              <h3>{card.name}</h3>

              <p className="card-rarity">{card.rarity}</p>

              <div className="card-condition-row">
                <span>{card.condition}</span>
                <span>{card.stock} available</span>
              </div>

              <div className="market-card__seller">
                Sold by <strong>{card.seller}</strong>
              </div>

              <div className="market-card__footer">
                <strong>{formatPrice(card.price)}</strong>

                <button type="button" onClick={() => addToCart(card)}>
                  <ShoppingBag size={17} />
                  Add
                </button>
              </div>
            </div>
          </article>
        ))}

        {displayedCards.length === 0 && (
          <div className="empty-state full-grid-item">
            <Search size={38} />
            <h3>No cards found</h3>
            <p>Try changing your search or game filter.</p>
          </div>
        )}
      </div>
    );
  }

  function renderHome() {
    return (
      <>
        <section className="hero-section">
          <div className="hero-section__content">
            <span className="eyebrow">The home of local card players</span>

            <h1>Find cards. Join events. Become the top player.</h1>

            <p>
              Browse cards from trusted sellers, register for local events,
              check your bracket ranking, and connect with other players.
            </p>

            <div className="hero-actions">
              <button type="button" onClick={() => navigate("shop")}>
                Browse cards
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                className="secondary"
                onClick={() => navigate("events")}
              >
                View events
              </button>
            </div>
          </div>

          <div className="hero-stat-panel">
            <div>
              <ShoppingBag size={24} />
              <strong>1,280+</strong>
              <span>Cards listed</span>
            </div>

            <div>
              <Users size={24} />
              <strong>420</strong>
              <span>Active players</span>
            </div>

            <div>
              <Trophy size={24} />
              <strong>24</strong>
              <span>Monthly events</span>
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Marketplace</span>
              <h2>Popular cards</h2>
              <p>Discover cards currently trending in the community.</p>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() => navigate("shop")}
            >
              View all cards
              <ChevronRight size={17} />
            </button>
          </div>

          {renderCardGrid(4)}
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel">
            <div className="section-heading compact">
              <div>
                <span className="eyebrow">Upcoming</span>
                <h2>Shop events</h2>
              </div>

              <CalendarDays size={25} />
            </div>

            <div className="mini-event-list">
              {shopEvents.slice(0, 3).map((event) => (
                <div className="mini-event-item" key={event.id}>
                  <div className="event-date-box">
                    <strong>{event.date.split(" ")[1].replace(",", "")}</strong>
                    <span>{event.date.split(" ")[0].slice(0, 3)}</span>
                  </div>

                  <div>
                    <h3>{event.title}</h3>
                    <p>
                      {event.time} · {event.slots} slots left
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="dashboard-panel">
            <div className="section-heading compact">
              <div>
                <span className="eyebrow">Leaderboard</span>
                <h2>Bracket 1 leaders</h2>
              </div>

              <Trophy size={25} />
            </div>

            <div className="leader-preview-list">
              {rankings[1].slice(0, 3).map((player) => (
                <div className="leader-preview-item" key={player.name}>
                  <span className="rank-number">{player.rank}</span>

                  <div className="player-avatar">
                    {player.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div>
                    <strong>{player.name}</strong>
                    <span>
                      {player.wins}W · {player.losses}L
                    </span>
                  </div>

                  <strong className="player-points">
                    {player.points} pts
                  </strong>
                </div>
              ))}
            </div>
          </article>
        </section>
      </>
    );
  }

  function renderShop() {
    return (
      <section className="content-section page-section">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">Marketplace</span>
            <h1>Card Shop</h1>
            <p>Search cards by name, game, set, rarity, or seller.</p>
          </div>

          <button
            type="button"
            className="cart-summary-button"
            onClick={() => navigate("cart")}
          >
            <ShoppingCart size={20} />
            Cart
            <span>{cartCount}</span>
          </button>
        </div>

        <div className="shop-toolbar">
          <label className="search-field">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search for a card..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </label>

          <select
            value={gameFilter}
            onChange={(event) => setGameFilter(event.target.value)}
          >
            <option value="All">All games</option>
            <option value="Pokemon">Pokemon</option>
            <option value="Yu-Gi-Oh!">Yu-Gi-Oh!</option>
            <option value="One Piece">One Piece</option>
            <option value="Magic">Magic</option>
          </select>
        </div>

        <div className="results-line">
          <strong>{filteredCards.length}</strong> cards found
        </div>

        {renderCardGrid()}
      </section>
    );
  }

  function renderEvents() {
    return (
      <section className="content-section page-section">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">Compete and connect</span>
            <h1>Upcoming Events</h1>
            <p>Register for tournaments, leagues, and community meetups.</p>
          </div>
        </div>

        <div className="event-grid">
          {shopEvents.map((event) => (
            <article className="event-card" key={event.id}>
              <div className="event-card__banner">
                <span>{event.game}</span>
                <CalendarDays size={34} />
              </div>

              <div className="event-card__body">
                <span className="event-status">Registration open</span>

                <h2>{event.title}</h2>

                <div className="event-detail-list">
                  <p>
                    <strong>Date:</strong> {event.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {event.time}
                  </p>
                  <p>
                    <strong>Venue:</strong> {event.venue}
                  </p>
                  <p>
                    <strong>Entry fee:</strong> {formatPrice(event.fee)}
                  </p>
                </div>

                <div className="event-card__footer">
                  <span>{event.slots} slots remaining</span>
                  <button type="button">Register now</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  function renderRankings() {
    const selectedPlayers = rankings[selectedBracket];

    return (
      <section className="content-section page-section">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">Player standings</span>
            <h1>Bracket Rankings</h1>
            <p>View wins, losses, points, and current player positions.</p>
          </div>
        </div>

        <div className="bracket-tabs">
          {[1, 2, 3, 4].map((bracket) => (
            <button
              type="button"
              key={bracket}
              className={selectedBracket === bracket ? "active" : ""}
              onClick={() => setSelectedBracket(bracket)}
            >
              Bracket {bracket}
            </button>
          ))}
        </div>

        <div className="ranking-card">
          <div className="ranking-card__header">
            <div>
              <span>Current standings</span>
              <h2>Bracket {selectedBracket}</h2>
            </div>

            <Trophy size={33} />
          </div>

          <div className="ranking-table-wrapper">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Points</th>
                </tr>
              </thead>

              <tbody>
                {selectedPlayers.map((player) => (
                  <tr key={player.name}>
                    <td>
                      <span
                        className={`rank-badge rank-badge-${player.rank}`}
                      >
                        {player.rank}
                      </span>
                    </td>

                    <td>
                      <div className="ranking-player">
                        <div className="player-avatar">
                          {player.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        <strong>{player.name}</strong>
                      </div>
                    </td>

                    <td>{player.wins}</td>
                    <td>{player.losses}</td>
                    <td>
                      <strong>{player.points}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  }

  function renderCommunity() {
    return (
      <section className="content-section page-section">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">Ask the community</span>
            <h1>Questions and Discussions</h1>
            <p>
              Ask about card rules, events, card values, or deck building.
            </p>
          </div>
        </div>

        <div className="community-layout">
          <div>
            <form className="question-form" onSubmit={submitQuestion}>
              <div className="question-form__icon">
                <CircleHelp size={25} />
              </div>

              <div className="question-form__content">
                <h2>Ask a question</h2>

                <textarea
                  value={questionText}
                  onChange={(event) => setQuestionText(event.target.value)}
                  placeholder="What would you like to ask?"
                  rows={4}
                />

                <div className="question-form__footer">
                  <span>Be respectful and provide enough details.</span>
                  <button type="submit">Post question</button>
                </div>
              </div>
            </form>

            <div className="question-list">
              {questions.map((question) => (
                <article className="question-card" key={question.id}>
                  <div className="question-avatar">
                    {question.user
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div className="question-card__content">
                    <div className="question-meta">
                      <strong>{question.user}</strong>
                      <span>{question.time}</span>
                    </div>

                    <span className="question-category">
                      {question.category}
                    </span>

                    <h3>{question.question}</h3>

                    <button type="button">
                      <MessageCircle size={17} />
                      {question.replies} replies
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="community-sidebar">
            <h3>Community guidelines</h3>

            <ul>
              <li>Use a clear and descriptive question.</li>
              <li>Respect other players and their opinions.</li>
              <li>Do not post fake card listings.</li>
              <li>Report suspicious sellers to shop staff.</li>
            </ul>
          </aside>
        </div>
      </section>
    );
  }

  function renderCart() {
    return (
      <section className="content-section page-section">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">Your order</span>
            <h1>Shopping Cart</h1>
            <p>Review your selected cards before checkout.</p>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state large">
            <ShoppingCart size={47} />
            <h2>Your cart is empty</h2>
            <p>Browse the marketplace and add cards to your cart.</p>
            <button type="button" onClick={() => navigate("shop")}>
              Browse cards
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-list">
              {cart.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div className={`cart-item__image game-image-${item.id}`}>
                    <span>{item.game}</span>
                  </div>

                  <div className="cart-item__details">
                    <span>{item.set}</span>
                    <h3>{item.name}</h3>
                    <p>
                      {item.condition} · {item.seller}
                    </p>
                  </div>

                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id, -1)}
                    >
                      <Minus size={16} />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() => changeQuantity(item.id, 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </article>
              ))}
            </div>

            <aside className="order-summary">
              <h2>Order summary</h2>

              <div>
                <span>Items</span>
                <strong>{cartCount}</strong>
              </div>

              <div>
                <span>Subtotal</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>

              <div>
                <span>Shipping</span>
                <strong>Calculated later</strong>
              </div>

              <div className="order-total">
                <span>Total</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>

              <button type="button">Proceed to checkout</button>
            </aside>
          </div>
        )}
      </section>
    );
  }

  function renderProfile() {
    return (
      <section className="content-section page-section">
        <div className="profile-header-card">
          <div className="profile-avatar">IG</div>

          <div>
            <span className="eyebrow">Player account</span>
            <h1>Ivan Guerrero</h1>
            <p>Card collector and tournament player</p>
          </div>

          <button type="button">Edit profile</button>
        </div>

        <div className="profile-grid">
          <article className="profile-panel">
            <h2>Player information</h2>

            <div className="profile-info-row">
              <span>Current bracket</span>
              <strong>Bracket 4</strong>
            </div>

            <div className="profile-info-row">
              <span>Current rank</span>
              <strong>#1</strong>
            </div>

            <div className="profile-info-row">
              <span>Total points</span>
              <strong>34 points</strong>
            </div>

            <div className="profile-info-row">
              <span>Member since</span>
              <strong>January 2026</strong>
            </div>
          </article>

          <article className="profile-panel">
            <h2>Account activity</h2>

            <div className="profile-stat-grid">
              <div>
                <ShoppingBag size={21} />
                <strong>12</strong>
                <span>Orders</span>
              </div>

              <div>
                <CalendarDays size={21} />
                <strong>8</strong>
                <span>Events</span>
              </div>

              <div>
                <Heart size={21} />
                <strong>{favorites.length}</strong>
                <span>Favorites</span>
              </div>

              <div>
                <MessageCircle size={21} />
                <strong>{questions.length}</strong>
                <span>Questions</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    );
  }

  function renderPage() {
    switch (activePage) {
      case "shop":
        return renderShop();
      case "events":
        return renderEvents();
      case "rankings":
        return renderRankings();
      case "community":
        return renderCommunity();
      case "cart":
        return renderCart();
      case "profile":
        return renderProfile();
      default:
        return renderHome();
    }
  }

  return (
    <div className="user-app">
      <aside
        className={`user-sidebar ${
          mobileSidebarOpen ? "is-mobile-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand__logo">S</div>

          <div>
            <strong>STAX</strong>
            <span>Card Marketplace</span>
          </div>

          <button
            type="button"
            className="sidebar-close-button"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={21} />
          </button>
        </div>

        <nav className="sidebar-navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                type="button"
                key={item.id}
                className={activePage === item.id ? "active" : ""}
                onClick={() => navigate(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>

                {item.id === "cart" && cartCount > 0 && (
                  <span className="sidebar-count">{cartCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-player-card">
          <div className="player-avatar">IG</div>

          <div>
            <strong>Ivan Guerrero</strong>
            <span>Bracket 4 · Rank #1</span>
          </div>
        </div>

        <button type="button" className="sidebar-logout">
          <LogOut size={19} />
          Log out
        </button>
      </aside>

      {mobileSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className="user-main">
        <header className="user-header">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu size={23} />
          </button>

          <label className="header-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search cards..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onFocus={() => setActivePage("shop")}
            />
          </label>

          <div className="header-actions">
            <button
              type="button"
              className="header-cart-button"
              onClick={() => navigate("cart")}
            >
              <ShoppingCart size={20} />
              <span>{cartCount}</span>
            </button>

            <button
              type="button"
              className="header-profile-button"
              onClick={() => navigate("profile")}
            >
              <div className="player-avatar">IG</div>

              <div>
                <strong>Ivan</strong>
                <span>Bracket 4</span>
              </div>
            </button>
          </div>
        </header>

        <main className="user-page-content">{renderPage()}</main>
      </div>
    </div>
  );
}

export default UserApp;