import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

import { supabase } from "../lib/supabase";

import {
  checkoutCart,
  createQuestion,
  getCards,
  getEvents,
  getMyProfile,
  getQuestions,
  getRankings,
  registerForEvent,
} from "../lib/database";

import "./user.css";

/* =========================================================
   MENU
========================================================= */

const menuItems = [
  {
    id: "home",
    label: "Home",
    icon: Home,
  },
  {
    id: "shop",
    label: "Card Shop",
    icon: Store,
  },
  {
    id: "events",
    label: "Events",
    icon: CalendarDays,
  },
  {
    id: "rankings",
    label: "Rankings",
    icon: Trophy,
  },
  {
    id: "community",
    label: "Community",
    icon: MessageCircle,
  },
  {
    id: "cart",
    label: "Cart",
    icon: ShoppingCart,
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
];

/* =========================================================
   HELPERS
========================================================= */

const formatPrice = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value || 0));

const formatEventDate = (date) => {
  if (!date) return "TBA";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
};

const formatEventTime = (time) => {
  if (!time) return "TBA";

  const [hour, minute] = time.split(":");

  const date = new Date();

  date.setHours(
    Number(hour),
    Number(minute),
    0,
    0
  );

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getDateParts = (date) => {
  if (!date) {
    return {
      day: "--",
      month: "---",
    };
  }

  const value = new Date(`${date}T00:00:00`);

  return {
    day: value.getDate(),
    month: value
      .toLocaleDateString("en-US", {
        month: "short",
      })
      .toUpperCase(),
  };
};

const getInitials = (name = "") => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "ST";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

/* =========================================================
   USER APP
========================================================= */

const UserApp = ({
  onLogout,
  profile,
}) => {
  /* =======================================================
     STATE
  ======================================================= */

  const [activePage, setActivePage] =
    useState("home");

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(false);

  const [searchText, setSearchText] =
    useState("");

  const [gameFilter, setGameFilter] =
    useState("All");

  /*
   * Used by the full rankings page.
   */
  const [
    selectedBracket,
    setSelectedBracket,
  ] = useState(1);

  /*
   * Separate dropdown for the HOME leaderboard.
   */
  const [
    homeLeaderboardBracket,
    setHomeLeaderboardBracket,
  ] = useState(1);

  const [favorites, setFavorites] =
    useState([]);

  const [cart, setCart] =
    useState([]);

  const [
    questionText,
    setQuestionText,
  ] = useState("");

  const [
    cardItems,
    setCardItems,
  ] = useState([]);

  const [
    shopEvents,
    setShopEvents,
  ] = useState([]);

  const [
    rankingItems,
    setRankingItems,
  ] = useState([]);

  const [
    questions,
    setQuestions,
  ] = useState([]);

  const [
    profileData,
    setProfileData,
  ] = useState(profile || null);

  const [
    checkoutLoading,
    setCheckoutLoading,
  ] = useState(false);

  const [
    registeringEvent,
    setRegisteringEvent,
  ] = useState(null);

  /* =======================================================
     LOAD CARDS
  ======================================================= */

  const loadCards = useCallback(
    async () => {
      try {
        const data = await getCards();

        const mapped = (data || [])
          .filter(
            (item) =>
              item.status === "Available" &&
              Number(item.stock || 0) > 0
          )
          .map((item) => ({
            id: item.id,
            name: item.name,
            game:
              item.game ||
              "Magic: The Gathering",
            set:
              item.set_name ||
              "",
            rarity:
              item.rarity ||
              "",
            condition:
              item.condition ||
              "",
            price:
              Number(item.price || 0),
            stock:
              Number(item.stock || 0),
            seller:
              item.seller ||
              "STAX Card Shop",
            rating: 5,
            imageUrl:
              item.image_url ||
              "",
          }));

        setCardItems(mapped);
      } catch (error) {
        console.error(
          "Failed to load cards:",
          error
        );
      }
    },
    []
  );

  /* =======================================================
     LOAD EVENTS
  ======================================================= */

  const loadEvents = useCallback(
    async () => {
      try {
        const data = await getEvents();

        const mapped = (data || [])
          .filter(
            (item) =>
              item.status !== "Closed"
          )
          .map((item) => ({
            id: item.id,

            title:
              item.title ||
              "Untitled Event",

            game:
              item.format ||
              "Tournament",

            format:
              item.format ||
              "Tournament",

            date:
              item.event_date ||
              "",

            time:
              item.event_time ||
              "",

            venue:
              item.venue ||
              "STAX Card Shop",

            fee:
              Number(
                item.fee || 0
              ),

            totalSlots:
              Number(
                item.slots || 0
              ),

            registered:
              Number(
                item.registered || 0
              ),

            slots: Math.max(
              Number(
                item.slots || 0
              ) -
                Number(
                  item.registered ||
                    0
                ),
              0
            ),

            bracket:
              item.bracket ||
              "",

            status:
              item.status ||
              "Open",

            imageUrl:
              item.image_url ||
              "",
          }));

        setShopEvents(mapped);
      } catch (error) {
        console.error(
          "Failed to load events:",
          error
        );
      }
    },
    []
  );

  /* =======================================================
     LOAD RANKINGS
  ======================================================= */

  const loadRankings = useCallback(
    async () => {
      try {
        const data =
          await getRankings();

        setRankingItems(
          data || []
        );
      } catch (error) {
        console.error(
          "Failed to load rankings:",
          error
        );
      }
    },
    []
  );

  /* =======================================================
     LOAD QUESTIONS
  ======================================================= */

  const loadQuestions = useCallback(
    async () => {
      try {
        const data =
          await getQuestions();

        const mapped = (
          data || []
        ).map((item) => ({
          id: item.id,

          user:
            item.user_name ||
            "STAX Player",

          category:
            item.category ||
            "General",

          question:
            item.question ||
            "",

          replies:
            Number(
              item.replies || 0
            ),

          status:
            item.status ||
            "Open",

          time:
            item.created_at
              ? new Date(
                  item.created_at
                ).toLocaleString()
              : "",
        }));

        setQuestions(mapped);
      } catch (error) {
        console.error(
          "Failed to load questions:",
          error
        );
      }
    },
    []
  );

  /* =======================================================
     INITIALIZE
  ======================================================= */

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      await Promise.all([
        loadCards(),
        loadEvents(),
        loadRankings(),
        loadQuestions(),
      ]);

      try {
        const userProfile =
          await getMyProfile();

        if (!active) return;

        if (userProfile) {
          setProfileData(
            userProfile
          );

          const bracket =
            Number(
              userProfile.bracket
            ) || 1;

          setSelectedBracket(
            bracket
          );

          setHomeLeaderboardBracket(
            bracket
          );
        }
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, [
    loadCards,
    loadEvents,
    loadRankings,
    loadQuestions,
  ]);

  /* =======================================================
     REALTIME
  ======================================================= */

  useEffect(() => {
    const channel = supabase
      .channel(
        "stax-user-realtime"
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "cards",
        },
        () => {
          loadCards();
        }
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        () => {
          loadEvents();
        }
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rankings",
        },
        () => {
          loadRankings();
        }
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table:
            "community_questions",
        },
        () => {
          loadQuestions();
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [
    loadCards,
    loadEvents,
    loadRankings,
    loadQuestions,
  ]);

  /* =======================================================
     FILTER CARDS
  ======================================================= */

  const filteredCards =
    useMemo(() => {
      const query =
        searchText
          .trim()
          .toLowerCase();

      return cardItems.filter(
        (card) => {
          const matchesGame =
            gameFilter === "All" ||
            card.game ===
              gameFilter;

          const haystack = [
            card.name,
            card.game,
            card.set,
            card.rarity,
            card.seller,
          ]
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !query ||
            haystack.includes(
              query
            );

          return (
            matchesGame &&
            matchesSearch
          );
        }
      );
    }, [
      cardItems,
      gameFilter,
      searchText,
    ]);

  /* =======================================================
     CART
  ======================================================= */

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(
            item.quantity || 0
          ),
        0
      ),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(
            item.price || 0
          ) *
            Number(
              item.quantity || 0
            ),
        0
      ),
    [cart]
  );

  /* =======================================================
     PROFILE
  ======================================================= */

  const playerName =
    profileData?.full_name ||
    "STAX Player";

  const playerBracket =
    Number(
      profileData?.bracket
    ) || 1;

  const currentPlayerRanking =
    useMemo(
      () =>
        rankingItems.find(
          (item) =>
            String(
              item.name || ""
            ).toLowerCase() ===
            String(
              playerName || ""
            ).toLowerCase()
        ),
      [
        rankingItems,
        playerName,
      ]
    );

  const playerRank =
    currentPlayerRanking?.rank ||
    "-";

  const playerPoints =
    currentPlayerRanking?.points ||
    0;

  /* =======================================================
     HOME LEADERBOARD
  ======================================================= */

  const homeLeaderboardPlayers =
    useMemo(() => {
      return rankingItems
        .filter(
          (player) =>
            Number(
              player.bracket
            ) ===
            Number(
              homeLeaderboardBracket
            )
        )
        .sort(
          (a, b) =>
            Number(a.rank || 9999) -
            Number(b.rank || 9999)
        )
        .slice(0, 5);
    }, [
      rankingItems,
      homeLeaderboardBracket,
    ]);

  /* =======================================================
     FULL RANKINGS
  ======================================================= */

  const selectedRankingPlayers =
    useMemo(() => {
      return rankingItems
        .filter(
          (player) =>
            Number(
              player.bracket
            ) ===
            Number(
              selectedBracket
            )
        )
        .sort(
          (a, b) =>
            Number(a.rank || 9999) -
            Number(b.rank || 9999)
        );
    }, [
      rankingItems,
      selectedBracket,
    ]);

  /* =======================================================
     GAMES
  ======================================================= */

  const games = useMemo(() => {
    const values =
      cardItems
        .map(
          (card) => card.game
        )
        .filter(Boolean);

    return [
      "All",
      ...new Set(values),
    ];
  }, [cardItems]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const navigate = (page) => {
    setActivePage(page);

    setMobileSidebarOpen(
      false
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     FAVORITES
  ======================================================= */

  const toggleFavorite = (
    cardId
  ) => {
    setFavorites(
      (current) =>
        current.includes(
          cardId
        )
          ? current.filter(
              (id) =>
                id !== cardId
            )
          : [
              ...current,
              cardId,
            ]
    );
  };

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const addToCart = (card) => {
    setCart((current) => {
      const existing =
        current.find(
          (item) =>
            item.id === card.id
        );

      if (existing) {
        return current.map(
          (item) =>
            item.id ===
            card.id
              ? {
                  ...item,

                  quantity:
                    Math.min(
                      item.quantity +
                        1,
                      card.stock
                    ),
                }
              : item
        );
      }

      return [
        ...current,
        {
          ...card,
          quantity: 1,
        },
      ];
    });
  };

  /* =======================================================
     CHANGE QUANTITY
  ======================================================= */

  const changeQuantity = (
    cardId,
    amount
  ) => {
    setCart((current) =>
      current
        .map((item) => {
          if (
            item.id !== cardId
          ) {
            return item;
          }

          return {
            ...item,

            quantity:
              Math.max(
                0,
                Math.min(
                  item.stock,
                  item.quantity +
                    amount
                )
              ),
          };
        })
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  };

  /* =======================================================
     SUBMIT QUESTION
  ======================================================= */

  const submitQuestion =
    async () => {
      const value =
        questionText.trim();

      if (!value) return;

      try {
        await createQuestion({
          category: "General",
          question: value,
        });

        setQuestionText("");

        await loadQuestions();
      } catch (error) {
        console.error(error);

        alert(
          error.message ||
            "Unable to post question."
        );
      }
    };

  /* =======================================================
     CHECKOUT
  ======================================================= */

  const handleCheckout =
    async () => {
      if (!cart.length) {
        return;
      }

      try {
        setCheckoutLoading(
          true
        );

        await checkoutCart(
          cart
        );

        setCart([]);

        await loadCards();

        alert(
          "Order placed successfully."
        );
      } catch (error) {
        console.error(error);

        alert(
          error.message ||
            "Unable to complete checkout."
        );
      } finally {
        setCheckoutLoading(
          false
        );
      }
    };

  /* =======================================================
     REGISTER EVENT
  ======================================================= */

  const handleRegisterEvent =
    async (eventId) => {
      try {
        setRegisteringEvent(
          eventId
        );

        await registerForEvent(
          eventId
        );

        await loadEvents();

        alert(
          "Registration successful."
        );
      } catch (error) {
        console.error(error);

        alert(
          error.message ||
            "Unable to register for this event."
        );
      } finally {
        setRegisteringEvent(
          null
        );
      }
    };

  /* =======================================================
     MARKET CARD
  ======================================================= */

  const renderMarketCard = (
    card
  ) => {
    const favorite =
      favorites.includes(
        card.id
      );

    return (
      <article
        className="market-card"
        key={card.id}
      >
        <div
          className={`market-card__image ${
            card.imageUrl
              ? "has-real-image"
              : ""
          }`}
        >
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              className="market-card__actual-image"
            />
          ) : (
            <span>
              {card.name}
            </span>
          )}

          <button
            type="button"
            className={`favorite-button ${
              favorite
                ? "is-favorite"
                : ""
            }`}
            onClick={() =>
              toggleFavorite(
                card.id
              )
            }
            aria-label="Favorite card"
          >
            <Heart size={17} />
          </button>
        </div>

        <div className="market-card__body">
          <div className="market-card__game-row">
            <span>
              {card.game}
            </span>

            <span className="rating">
              <Star
                size={12}
                fill="currentColor"
              />

              {card.rating}
            </span>
          </div>

          <h3>
            {card.name}
          </h3>

          <p className="card-rarity">
            {card.set}

            {card.rarity
              ? ` · ${card.rarity}`
              : ""}
          </p>

          <div className="card-condition-row">
            <span>
              {card.condition}
            </span>

            <span>
              {card.stock} in stock
            </span>
          </div>

          <div className="market-card__seller">
            Sold by{" "}
            <strong>
              {card.seller}
            </strong>
          </div>

          <div className="market-card__footer">
            <strong>
              {formatPrice(
                card.price
              )}
            </strong>

            <button
              type="button"
              onClick={() =>
                addToCart(card)
              }
            >
              <ShoppingCart
                size={14}
              />

              Add
            </button>
          </div>
        </div>
      </article>
    );
  };

  /* =======================================================
     HOME
  ======================================================= */

  const renderHome = () => (
    <>
      {/* HERO */}

      <section className="hero-section">
        <div className="hero-section__content">
          <span className="eyebrow">
            STAX CARD COMMUNITY
          </span>

          <h1>
            Build your deck.
            Rise through the
            ranks.
          </h1>

          <p>
            Buy cards, join
            tournaments, track
            your ranking, and
            connect with other
            players in the STAX
            community.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              onClick={() =>
                navigate("shop")
              }
            >
              <ShoppingBag
                size={18}
              />

              Browse Cards

              <ChevronRight
                size={17}
              />
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() =>
                navigate(
                  "events"
                )
              }
            >
              <CalendarDays
                size={18}
              />

              View Events
            </button>
          </div>
        </div>

        <div className="hero-stat-panel">
          <div>
            <Store size={25} />

            <strong>
              {cardItems.length}
            </strong>

            <span>
              Cards available
            </span>
          </div>

          <div>
            <CalendarDays
              size={25}
            />

            <strong>
              {shopEvents.length}
            </strong>

            <span>
              Upcoming events
            </span>
          </div>

          <div>
            <Trophy size={25} />

            <strong>
              #{playerRank}
            </strong>

            <span>
              Your ranking
            </span>
          </div>
        </div>
      </section>

      {/* POPULAR CARDS */}

      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              MARKETPLACE
            </span>

            <h2>
              Popular Cards
            </h2>

            <p>
              Discover cards
              available in the
              STAX marketplace.
            </p>
          </div>

          <button
            type="button"
            className="text-button"
            onClick={() =>
              navigate("shop")
            }
          >
            View all

            <ChevronRight
              size={16}
            />
          </button>
        </div>

        <div className="card-market-grid">
          {cardItems
            .slice(0, 4)
            .map(
              renderMarketCard
            )}

          {!cardItems.length && (
            <div className="empty-state full-grid-item">
              <ShoppingBag
                size={30}
              />

              <h3>
                No cards
                available
              </h3>

              <p>
                Cards added by
                the administrator
                will appear here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* DASHBOARD */}

      <section className="dashboard-grid">
        {/* UPCOMING EVENTS */}

        <article className="dashboard-panel">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">
                EVENTS
              </span>

              <h2>
                Upcoming Events
              </h2>
            </div>

            <button
              type="button"
              className="text-button"
              onClick={() =>
                navigate(
                  "events"
                )
              }
            >
              View all

              <ChevronRight
                size={15}
              />
            </button>
          </div>

          <div className="mini-event-list">
            {shopEvents
              .slice(0, 4)
              .map((event) => {
                const date =
                  getDateParts(
                    event.date
                  );

                return (
                  <div
                    className="mini-event-item"
                    key={
                      event.id
                    }
                  >
                    {event.imageUrl ? (
                      <div className="mini-event-poster">
                        <img
                          src={
                            event.imageUrl
                          }
                          alt={
                            event.title
                          }
                        />
                      </div>
                    ) : (
                      <div className="event-date-box">
                        <strong>
                          {date.day}
                        </strong>

                        <span>
                          {
                            date.month
                          }
                        </span>
                      </div>
                    )}

                    <div>
                      <h3>
                        {
                          event.title
                        }
                      </h3>

                      <p>
                        {formatEventDate(
                          event.date
                        )}

                        {" · "}

                        {formatEventTime(
                          event.time
                        )}

                        {" · "}

                        {event.venue}
                      </p>
                    </div>
                  </div>
                );
              })}

            {!shopEvents.length && (
              <div className="empty-state">
                <CalendarDays
                  size={28}
                />

                <h3>
                  No upcoming
                  events
                </h3>
              </div>
            )}
          </div>
        </article>

        {/* =================================================
            HOME LEADERBOARD WITH DROPDOWN
        ================================================= */}

        <article className="dashboard-panel">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">
                LEADERBOARD
              </span>

              <h2>
                Bracket{" "}
                {
                  homeLeaderboardBracket
                }{" "}
                Leaders
              </h2>
            </div>

            <div className="home-leaderboard-controls">
              <select
                value={
                  homeLeaderboardBracket
                }
                onChange={(
                  event
                ) =>
                  setHomeLeaderboardBracket(
                    Number(
                      event
                        .target
                        .value
                    )
                  )
                }
                aria-label="Select leaderboard bracket"
              >
                <option
                  value={1}
                >
                  Bracket 1
                </option>

                <option
                  value={2}
                >
                  Bracket 2
                </option>

                <option
                  value={3}
                >
                  Bracket 3
                </option>

                <option
                  value={4}
                >
                  Bracket 4
                </option>
              </select>

              <Trophy
                size={22}
              />
            </div>
          </div>

          <div className="leader-preview-list">
            {homeLeaderboardPlayers.map(
              (player) => (
                <div
                  className="leader-preview-item"
                  key={
                    player.id
                  }
                >
                  <span className="rank-number">
                    {
                      player.rank
                    }
                  </span>

                  <div className="player-avatar">
                    {getInitials(
                      player.name
                    )}
                  </div>

                  <div>
                    <strong>
                      {
                        player.name
                      }
                    </strong>

                    <span>
                      {Number(
                        player.wins ||
                          0
                      )}
                      W ·{" "}
                      {Number(
                        player.losses ||
                          0
                      )}
                      L
                    </span>
                  </div>

                  <strong className="player-points">
                    {Number(
                      player.points ||
                        0
                    )}{" "}
                    pts
                  </strong>
                </div>
              )
            )}

            {!homeLeaderboardPlayers.length && (
              <div className="leaderboard-empty">
                <Trophy
                  size={28}
                />

                <strong>
                  No players yet
                </strong>

                <span>
                  No rankings
                  available for
                  Bracket{" "}
                  {
                    homeLeaderboardBracket
                  }.
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="home-view-ranking-button"
            onClick={() => {
              setSelectedBracket(
                homeLeaderboardBracket
              );

              navigate(
                "rankings"
              );
            }}
          >
            View full Bracket{" "}
            {
              homeLeaderboardBracket
            }{" "}
            ranking

            <ChevronRight
              size={15}
            />
          </button>
        </article>
      </section>
    </>
  );

  /* =======================================================
     SHOP
  ======================================================= */

  const renderShop = () => (
    <section className="page-section">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            MARKETPLACE
          </span>

          <h1>
            Card Shop
          </h1>

          <p>
            Browse cards
            available from the
            STAX marketplace.
          </p>
        </div>

        <button
          type="button"
          className="cart-summary-button"
          onClick={() =>
            navigate("cart")
          }
        >
          <ShoppingCart
            size={17}
          />

          Cart

          <span>
            {cartCount}
          </span>
        </button>
      </div>

      <div className="shop-toolbar">
        <label className="search-field">
          <Search
            size={17}
          />

          <input
            type="text"
            placeholder="Search cards..."
            value={searchText}
            onChange={(
              event
            ) =>
              setSearchText(
                event.target
                  .value
              )
            }
          />
        </label>

        <select
          value={gameFilter}
          onChange={(
            event
          ) =>
            setGameFilter(
              event.target.value
            )
          }
        >
          {games.map(
            (game) => (
              <option
                key={game}
                value={game}
              >
                {game}
              </option>
            )
          )}
        </select>
      </div>

      <div className="results-line">
        Showing{" "}
        <strong>
          {
            filteredCards.length
          }
        </strong>{" "}
        cards
      </div>

      <div className="card-market-grid">
        {filteredCards.map(
          renderMarketCard
        )}

        {!filteredCards.length && (
          <div className="empty-state large full-grid-item">
            <Search
              size={34}
            />

            <h2>
              No cards found
            </h2>

            <p>
              Try changing your
              search or filter.
            </p>
          </div>
        )}
      </div>
    </section>
  );

  /* =======================================================
     EVENTS
  ======================================================= */

  const renderEvents = () => (
    <section className="page-section">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            TOURNAMENTS
          </span>

          <h1>
            Events
          </h1>

          <p>
            Register for
            upcoming STAX
            tournaments and
            community events.
          </p>
        </div>
      </div>

      <div className="event-grid">
        {shopEvents.map(
          (event) => (
            <article
              className="event-card"
              key={event.id}
            >
              <div
                className={`event-card__banner ${
                  event.imageUrl
                    ? "has-event-image"
                    : ""
                }`}
              >
                {event.imageUrl ? (
                  <img
                    src={
                      event.imageUrl
                    }
                    alt={
                      event.title
                    }
                    className="event-card__poster"
                  />
                ) : (
                  <>
                    <span>
                      {
                        event.format
                      }
                    </span>

                    <Trophy
                      size={40}
                    />
                  </>
                )}
              </div>

              <div className="event-card__body">
                <span className="event-status">
                  {event.status}
                </span>

                <h2>
                  {event.title}
                </h2>

                <div className="event-detail-list">
                  <p>
                    <strong>
                      Date:
                    </strong>{" "}
                    {formatEventDate(
                      event.date
                    )}
                  </p>

                  <p>
                    <strong>
                      Time:
                    </strong>{" "}
                    {formatEventTime(
                      event.time
                    )}
                  </p>

                  <p>
                    <strong>
                      Venue:
                    </strong>{" "}
                    {event.venue}
                  </p>

                  {event.bracket && (
                    <p>
                      <strong>
                        Bracket:
                      </strong>{" "}
                      {
                        event.bracket
                      }
                    </p>
                  )}

                  <p>
                    <strong>
                      Entry:
                    </strong>{" "}
                    {formatPrice(
                      event.fee
                    )}
                  </p>
                </div>

                <div className="event-card__footer">
                  <span>
                    {event.slots}{" "}
                    slots remaining
                  </span>

                  <button
                    type="button"
                    disabled={
                      event.slots <=
                        0 ||
                      registeringEvent ===
                        event.id
                    }
                    onClick={() =>
                      handleRegisterEvent(
                        event.id
                      )
                    }
                  >
                    {registeringEvent ===
                    event.id
                      ? "Registering..."
                      : event.slots <=
                          0
                        ? "Full"
                        : "Register"}
                  </button>
                </div>
              </div>
            </article>
          )
        )}

        {!shopEvents.length && (
          <div className="empty-state large full-grid-item">
            <CalendarDays
              size={36}
            />

            <h2>
              No upcoming
              events
            </h2>

            <p>
              New tournaments
              will appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );

  /* =======================================================
     RANKINGS
  ======================================================= */

  const renderRankings = () => (
    <section className="page-section">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            COMPETITIVE
          </span>

          <h1>
            Rankings
          </h1>

          <p>
            View player
            standings across
            every STAX bracket.
          </p>
        </div>
      </div>

      <div className="bracket-tabs">
        {[1, 2, 3, 4].map(
          (bracket) => (
            <button
              type="button"
              key={bracket}
              className={
                selectedBracket ===
                bracket
                  ? "active"
                  : ""
              }
              onClick={() =>
                setSelectedBracket(
                  bracket
                )
              }
            >
              Bracket{" "}
              {bracket}
            </button>
          )
        )}
      </div>

      <div className="ranking-card">
        <div className="ranking-card__header">
          <div>
            <span>
              CURRENT
              STANDINGS
            </span>

            <h2>
              Bracket{" "}
              {selectedBracket}
            </h2>
          </div>

          <Trophy
            size={31}
          />
        </div>

        <div className="ranking-table-wrapper">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>
                  Rank
                </th>

                <th>
                  Player
                </th>

                <th>
                  Wins
                </th>

                <th>
                  Losses
                </th>

                <th>
                  Points
                </th>
              </tr>
            </thead>

            <tbody>
              {selectedRankingPlayers.map(
                (player) => (
                  <tr
                    key={
                      player.id
                    }
                  >
                    <td>
                      <span
                        className={`rank-badge rank-badge-${player.rank}`}
                      >
                        {
                          player.rank
                        }
                      </span>
                    </td>

                    <td>
                      <div className="ranking-player">
                        <div className="player-avatar">
                          {getInitials(
                            player.name
                          )}
                        </div>

                        <strong>
                          {
                            player.name
                          }
                        </strong>
                      </div>
                    </td>

                    <td>
                      {Number(
                        player.wins ||
                          0
                      )}
                    </td>

                    <td>
                      {Number(
                        player.losses ||
                          0
                      )}
                    </td>

                    <td>
                      <strong>
                        {Number(
                          player.points ||
                            0
                        )}
                      </strong>
                    </td>
                  </tr>
                )
              )}

              {!selectedRankingPlayers.length && (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign:
                        "center",
                    }}
                  >
                    No rankings
                    available for
                    this bracket.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  /* =======================================================
     COMMUNITY
  ======================================================= */

  const renderCommunity =
    () => (
      <section className="page-section">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">
              COMMUNITY
            </span>

            <h1>
              Questions &
              Discussions
            </h1>

            <p>
              Ask questions and
              connect with other
              STAX players.
            </p>
          </div>
        </div>

        <div className="community-layout">
          <div>
            <div className="question-form">
              <div className="question-form__icon">
                <CircleHelp
                  size={21}
                />
              </div>

              <div className="question-form__content">
                <h2>
                  Ask the
                  community
                </h2>

                <textarea
                  rows={4}
                  value={
                    questionText
                  }
                  onChange={(
                    event
                  ) =>
                    setQuestionText(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="What would you like to ask?"
                />

                <div className="question-form__footer">
                  <span>
                    Be respectful
                    and keep your
                    question
                    related to
                    STAX and card
                    gaming.
                  </span>

                  <button
                    type="button"
                    onClick={
                      submitQuestion
                    }
                    disabled={
                      !questionText.trim()
                    }
                  >
                    Post Question
                  </button>
                </div>
              </div>
            </div>

            <div className="question-list">
              {questions.map(
                (question) => (
                  <article
                    className="question-card"
                    key={
                      question.id
                    }
                  >
                    <div className="question-avatar">
                      {getInitials(
                        question.user
                      )}
                    </div>

                    <div className="question-card__content">
                      <div className="question-meta">
                        <strong>
                          {
                            question.user
                          }
                        </strong>

                        <span>
                          {
                            question.time
                          }
                        </span>
                      </div>

                      <span className="question-category">
                        {
                          question.category
                        }
                      </span>

                      <h3>
                        {
                          question.question
                        }
                      </h3>

                      <button
                        type="button"
                      >
                        <MessageCircle
                          size={14}
                        />

                        {question.replies}{" "}
                        replies
                      </button>
                    </div>
                  </article>
                )
              )}

              {!questions.length && (
                <div className="empty-state">
                  <MessageCircle
                    size={30}
                  />

                  <h3>
                    No questions
                    yet
                  </h3>

                  <p>
                    Be the first
                    to start a
                    discussion.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="community-sidebar">
            <h3>
              Community
              Guidelines
            </h3>

            <ul>
              <li>
                Respect other
                players.
              </li>

              <li>
                Keep discussions
                relevant.
              </li>

              <li>
                Avoid spam or
                duplicate posts.
              </li>

              <li>
                Share helpful
                information.
              </li>
            </ul>
          </aside>
        </div>
      </section>
    );

  /* =======================================================
     CART
  ======================================================= */

  const renderCart = () => (
    <section className="page-section">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            CHECKOUT
          </span>

          <h1>
            Your Cart
          </h1>

          <p>
            Review your cards
            before placing your
            order.
          </p>
        </div>
      </div>

      {!cart.length ? (
        <div className="empty-state large">
          <ShoppingCart
            size={38}
          />

          <h2>
            Your cart is empty
          </h2>

          <p>
            Add cards from the
            marketplace to get
            started.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("shop")
            }
          >
            Browse Cards
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cart.map(
              (item) => (
                <article
                  className="cart-item"
                  key={item.id}
                >
                  <div
                    className={`cart-item__image ${
                      item.imageUrl
                        ? "has-real-image"
                        : ""
                    }`}
                  >
                    {item.imageUrl ? (
                      <img
                        src={
                          item.imageUrl
                        }
                        alt={
                          item.name
                        }
                        className="cart-item__actual-image"
                      />
                    ) : (
                      <span>
                        {
                          item.name
                        }
                      </span>
                    )}
                  </div>

                  <div className="cart-item__details">
                    <span>
                      {item.game}
                    </span>

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      {
                        item.condition
                      }{" "}
                      ·{" "}
                      {formatPrice(
                        item.price
                      )}{" "}
                      each
                    </p>
                  </div>

                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        changeQuantity(
                          item.id,
                          -1
                        )
                      }
                    >
                      <Minus
                        size={14}
                      />
                    </button>

                    <span>
                      {
                        item.quantity
                      }
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        changeQuantity(
                          item.id,
                          1
                        )
                      }
                      disabled={
                        item.quantity >=
                        item.stock
                      }
                    >
                      <Plus
                        size={14}
                      />
                    </button>
                  </div>

                  <strong>
                    {formatPrice(
                      item.price *
                        item.quantity
                    )}
                  </strong>
                </article>
              )
            )}
          </div>

          <aside className="order-summary">
            <h2>
              Order Summary
            </h2>

            <div>
              <span>
                Items
              </span>

              <strong>
                {cartCount}
              </strong>
            </div>

            <div>
              <span>
                Subtotal
              </span>

              <strong>
                {formatPrice(
                  cartTotal
                )}
              </strong>
            </div>

            <div>
              <span>
                Shipping
              </span>

              <strong>
                Free
              </strong>
            </div>

            <div className="order-total">
              <span>
                Total
              </span>

              <strong>
                {formatPrice(
                  cartTotal
                )}
              </strong>
            </div>

            <button
              type="button"
              onClick={
                handleCheckout
              }
              disabled={
                checkoutLoading
              }
            >
              {checkoutLoading
                ? "Processing..."
                : "Place Order"}
            </button>
          </aside>
        </div>
      )}
    </section>
  );

  /* =======================================================
     PROFILE
  ======================================================= */

  const renderProfile = () => (
    <section className="page-section">
      <div className="profile-header-card">
        <div className="profile-avatar">
          {getInitials(
            playerName
          )}
        </div>

        <div>
          <span className="eyebrow">
            PLAYER PROFILE
          </span>

          <h1>
            {playerName}
          </h1>

          <p>
            {profileData?.email ||
              ""}
          </p>
        </div>
      </div>

      <div className="profile-grid">
        <article className="profile-panel">
          <h2>
            Account
            Information
          </h2>

          <div className="profile-info-row">
            <span>
              Name
            </span>

            <strong>
              {playerName}
            </strong>
          </div>

          <div className="profile-info-row">
            <span>
              Email
            </span>

            <strong>
              {profileData?.email ||
                "-"}
            </strong>
          </div>

          <div className="profile-info-row">
            <span>
              Bracket
            </span>

            <strong>
              Bracket{" "}
              {playerBracket}
            </strong>
          </div>

          <div className="profile-info-row">
            <span>
              Status
            </span>

            <strong>
              {profileData?.status ||
                "Active"}
            </strong>
          </div>

          <div className="profile-info-row">
            <span>
              Joined
            </span>

            <strong>
              {profileData?.joined
                ? new Date(
                    profileData.joined
                  ).toLocaleDateString()
                : "-"}
            </strong>
          </div>
        </article>

        <article className="profile-panel">
          <h2>
            Player Stats
          </h2>

          <div className="profile-stat-grid">
            <div>
              <Trophy
                size={25}
              />

              <strong>
                #{playerRank}
              </strong>

              <span>
                Current Rank
              </span>
            </div>

            <div>
              <Star
                size={25}
              />

              <strong>
                {playerPoints}
              </strong>

              <span>
                Points
              </span>
            </div>

            <div>
              <ShoppingBag
                size={25}
              />

              <strong>
                {cartCount}
              </strong>

              <span>
                Cart Items
              </span>
            </div>

            <div>
              <Heart
                size={25}
              />

              <strong>
                {
                  favorites.length
                }
              </strong>

              <span>
                Favorites
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );

  /* =======================================================
     PAGE SWITCH
  ======================================================= */

  const renderCurrentPage =
    () => {
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

        case "home":
        default:
          return renderHome();
      }
    };

  /* =======================================================
     APP
  ======================================================= */

  return (
    <div className="user-app">
      {/* SIDEBAR */}

      <aside
        className={`user-sidebar ${
          mobileSidebarOpen
            ? "is-mobile-open"
            : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand__logo">
            S
          </div>

          <div>
            <strong>
              STAX
            </strong>

            <span>
              Card Community
            </span>
          </div>

          <button
            type="button"
            className="sidebar-close-button"
            onClick={() =>
              setMobileSidebarOpen(
                false
              )
            }
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-navigation">
          {menuItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <button
                  type="button"
                  key={item.id}
                  className={
                    activePage ===
                    item.id
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    navigate(
                      item.id
                    )
                  }
                >
                  <Icon
                    size={19}
                  />

                  <span>
                    {item.label}
                  </span>

                  {item.id ===
                    "cart" &&
                    cartCount >
                      0 && (
                      <span className="sidebar-count">
                        {
                          cartCount
                        }
                      </span>
                    )}
                </button>
              );
            }
          )}
        </nav>

        <div className="sidebar-player-card">
          <div className="player-avatar">
            {getInitials(
              playerName
            )}
          </div>

          <div>
            <strong>
              {playerName}
            </strong>

            <span>
              Bracket{" "}
              {playerBracket}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="sidebar-logout"
          onClick={onLogout}
        >
          <LogOut
            size={18}
          />

          Logout
        </button>
      </aside>

      {/* MOBILE OVERLAY */}

      {mobileSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() =>
            setMobileSidebarOpen(
              false
            )
          }
        />
      )}

      {/* MAIN */}

      <main className="user-main">
        {/* HEADER */}

        <header className="user-header">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setMobileSidebarOpen(
                true
              )
            }
          >
            <Menu
              size={20}
            />
          </button>

          <label className="header-search">
            <Search
              size={17}
            />

            <input
              type="text"
              placeholder="Search cards..."
              value={searchText}
              onChange={(
                event
              ) =>
                setSearchText(
                  event.target
                    .value
                )
              }
              onFocus={() => {
                if (
                  activePage !==
                  "shop"
                ) {
                  navigate(
                    "shop"
                  );
                }
              }}
            />
          </label>

          <div className="header-actions">
            <button
              type="button"
              className="header-cart-button"
              onClick={() =>
                navigate("cart")
              }
              aria-label="Cart"
            >
              <ShoppingCart
                size={19}
              />

              {cartCount >
                0 && (
                <span>
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className="header-profile-button"
              onClick={() =>
                navigate(
                  "profile"
                )
              }
            >
              <div className="player-avatar">
                {getInitials(
                  playerName
                )}
              </div>

              <div>
                <strong>
                  {playerName}
                </strong>

                <span>
                  Bracket{" "}
                  {playerBracket}
                </span>
              </div>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}

        <div className="user-page-content">
          {renderCurrentPage()}
        </div>
      </main>
    </div>
  );
};

export default UserApp;