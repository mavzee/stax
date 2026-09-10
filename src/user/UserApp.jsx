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
    label: "My Cart",
    icon: ShoppingCart,
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
];


function formatPrice(
  price
) {
  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(price || 0)
  );
}


function formatEventDate(
  date
) {
  if (!date) {
    return "";
  }

  const [
    year,
    month,
    day,
  ] = date
    .split("-")
    .map(Number);

  const parsed =
    new Date(
      year,
      month - 1,
      day
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  ).format(parsed);
}


function formatEventTime(
  time
) {
  if (!time) {
    return "";
  }

  const [
    hours,
    minutes,
  ] = time
    .slice(
      0,
      5
    )
    .split(":")
    .map(Number);

  const parsed =
    new Date();

  parsed.setHours(
    hours,
    minutes,
    0,
    0
  );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(parsed);
}


function getDateParts(
  date
) {
  if (!date) {
    return {
      day: "",
      month: "",
    };
  }

  const [
    year,
    month,
    day,
  ] = date
    .split("-")
    .map(Number);

  const parsed =
    new Date(
      year,
      month - 1,
      day
    );

  return {
    day,

    month:
      new Intl.DateTimeFormat(
        "en-US",
        {
          month: "short",
        }
      ).format(
        parsed
      ),
  };
}


function getInitials(
  name = ""
) {
  return name
    .split(" ")
    .filter(Boolean)
    .map(
      (part) =>
        part[0]
    )
    .join("")
    .slice(
      0,
      2
    )
    .toUpperCase();
}


function UserApp({
  onLogout,
  profile,
}) {
  const [
    activePage,
    setActivePage,
  ] = useState(
    "home"
  );

  const [
    mobileSidebarOpen,
    setMobileSidebarOpen,
  ] = useState(
    false
  );

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    gameFilter,
    setGameFilter,
  ] = useState("All");

  const [
    selectedBracket,
    setSelectedBracket,
  ] = useState(1);

  const [
    favorites,
    setFavorites,
  ] = useState([]);

  const [
    cart,
    setCart,
  ] = useState([]);

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
  ] = useState(
    profile ||
    null
  );

  const [
    checkoutLoading,
    setCheckoutLoading,
  ] = useState(false);

  const [
    registeringEvent,
    setRegisteringEvent,
  ] = useState(null);


  /* =========================================================
     LOAD CARDS
  ========================================================= */

  const loadCards =
    useCallback(
      async () => {
        try {
          const data =
            await getCards();

          setCardItems(
            data
              .filter(
                (card) =>
                  card.status ===
                    "Available" &&
                  Number(
                    card.stock
                  ) > 0
              )
              .map(
                (card) => ({
                  id:
                    card.id,

                  name:
                    card.name,

                  game:
                    card.game ||
                    "Magic",

                  set:
                    card.set_name,

                  rarity:
                    card.rarity,

                  condition:
                    card.condition,

                  price:
                    Number(
                      card.price
                    ),

                  stock:
                    Number(
                      card.stock
                    ),

                  seller:
                    card.seller,

                  rating:
                    5,

                  imageUrl:
                    card.image_url ||
                    "",
                })
              )
          );
        } catch (error) {
          console.error(
            "Could not load cards:",
            error
          );
        }
      },
      []
    );


  /* =========================================================
     LOAD EVENTS
  ========================================================= */

  const loadEvents =
    useCallback(
      async () => {
        try {
          const data =
            await getEvents();

          setShopEvents(
            data
              .filter(
                (item) =>
                  item.status !==
                  "Closed"
              )
              .map(
                (item) => ({
                  id:
                    item.id,

                  title:
                    item.title,

                  game:
                    item.format,

                  date:
                    item.event_date,

                  time:
                    item.event_time,

                  venue:
                    item.venue,

                  fee:
                    Number(
                      item.fee
                    ),

                  slots:
                    Math.max(
                      Number(
                        item.slots
                      ) -
                        Number(
                          item.registered
                        ),
                      0
                    ),

                  status:
                    item.status,

                  imageUrl:
                    item.image_url ||
                    "",
                })
              )
          );
        } catch (error) {
          console.error(
            "Could not load events:",
            error
          );
        }
      },
      []
    );


  /* =========================================================
     LOAD RANKINGS
  ========================================================= */

  const loadRankings =
    useCallback(
      async () => {
        try {
          const data =
            await getRankings();

          setRankingItems(
            data
          );
        } catch (error) {
          console.error(
            "Could not load rankings:",
            error
          );
        }
      },
      []
    );


  /* =========================================================
     LOAD QUESTIONS
  ========================================================= */

  const loadQuestions =
    useCallback(
      async () => {
        try {
          const data =
            await getQuestions();

          setQuestions(
            data.map(
              (item) => ({
                id:
                  item.id,

                user:
                  item.user_name,

                category:
                  item.category,

                question:
                  item.question,

                replies:
                  item.replies,

                status:
                  item.status,

                time:
                  new Date(
                    item.created_at
                  ).toLocaleString(),
              })
            )
          );
        } catch (error) {
          console.error(
            "Could not load questions:",
            error
          );
        }
      },
      []
    );


  /* =========================================================
     INITIALIZE
  ========================================================= */

  useEffect(() => {
    async function initialize() {
      await Promise.all([
        loadCards(),
        loadEvents(),
        loadRankings(),
        loadQuestions(),
      ]);

      try {
        const currentProfile =
          await getMyProfile();

        setProfileData(
          currentProfile
        );

        if (
          currentProfile
            ?.bracket
        ) {
          setSelectedBracket(
            Number(
              currentProfile.bracket
            )
          );
        }
      } catch (error) {
        console.error(
          "Could not load profile:",
          error
        );
      }
    }

    initialize();
  }, [
    loadCards,
    loadEvents,
    loadRankings,
    loadQuestions,
  ]);


  /* =========================================================
     REALTIME
  ========================================================= */

  useEffect(() => {
    const channel =
      supabase
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


  const filteredCards =
    useMemo(
      () => {
        const search =
          searchText
            .trim()
            .toLowerCase();

        return cardItems.filter(
          (card) => {
            const matchesSearch =
              !search ||
              card.name
                .toLowerCase()
                .includes(
                  search
                ) ||
              card.game
                .toLowerCase()
                .includes(
                  search
                ) ||
              card.set
                .toLowerCase()
                .includes(
                  search
                ) ||
              card.rarity
                .toLowerCase()
                .includes(
                  search
                ) ||
              card.seller
                .toLowerCase()
                .includes(
                  search
                );

            const matchesGame =
              gameFilter ===
                "All" ||
              card.game ===
                gameFilter;

            return (
              matchesSearch &&
              matchesGame
            );
          }
        );
      },
      [
        cardItems,
        searchText,
        gameFilter,
      ]
    );


  const cartCount =
    cart.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantity,
      0
    );


  const cartTotal =
    cart.reduce(
      (
        total,
        item
      ) =>
        total +
        item.price *
          item.quantity,
      0
    );


  const playerName =
    profileData
      ?.full_name ||
    "STAX Player";


  const playerBracket =
    Number(
      profileData
        ?.bracket ||
      1
    );


  const currentPlayerRanking =
    rankingItems.find(
      (player) =>
        player.name
          .trim()
          .toLowerCase() ===
        playerName
          .trim()
          .toLowerCase()
    );


  const playerRank =
    currentPlayerRanking
      ?.rank ||
    "-";


  const playerPoints =
    currentPlayerRanking
      ?.points ||
    0;


  function navigate(page) {
    setActivePage(page);

    setMobileSidebarOpen(
      false
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  function toggleFavorite(
    cardId
  ) {
    setFavorites(
      (current) =>
        current.includes(
          cardId
        )
          ? current.filter(
              (id) =>
                id !==
                cardId
            )
          : [
              ...current,
              cardId,
            ]
    );
  }


  function addToCart(
    card
  ) {
    setCart(
      (current) => {
        const existing =
          current.find(
            (item) =>
              item.id ===
              card.id
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
      }
    );
  }


  function changeQuantity(
    cardId,
    amount
  ) {
    setCart(
      (current) =>
        current
          .map(
            (item) =>
              item.id ===
              cardId
                ? {
                    ...item,

                    quantity:
                      Math.max(
                        0,
                        Math.min(
                          item.quantity +
                            amount,
                          item.stock
                        )
                      ),
                  }
                : item
          )
          .filter(
            (item) =>
              item.quantity >
              0
          )
    );
  }


  async function submitQuestion(
    event
  ) {
    event.preventDefault();

    const cleanQuestion =
      questionText.trim();

    if (!cleanQuestion) {
      return;
    }

    try {
      await createQuestion({
        question:
          cleanQuestion,

        category:
          "General",
      });

      setQuestionText(
        ""
      );

      await loadQuestions();
    } catch (error) {
      console.error(
        error
      );

      alert(
        "Could not post question."
      );
    }
  }


  async function handleCheckout() {
    if (
      cart.length ===
      0
    ) {
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
        "Order submitted successfully."
      );
    } catch (error) {
      console.error(
        error
      );

      alert(
        error.message ||
        "Checkout failed."
      );
    } finally {
      setCheckoutLoading(
        false
      );
    }
  }


  async function handleRegisterEvent(
    eventId
  ) {
    if (
      registeringEvent
    ) {
      return;
    }

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
      console.error(
        error
      );

      alert(
        error.message ||
        "Could not register."
      );
    } finally {
      setRegisteringEvent(
        null
      );
    }
  }


  /* =========================================================
     CARD GRID
  ========================================================= */

  function renderCardGrid(
    limit
  ) {
    const displayedCards =
      limit
        ? filteredCards.slice(
            0,
            limit
          )
        : filteredCards;


    return (
      <div className="card-market-grid">

        {displayedCards.map(
          (
            card,
            index
          ) => (
            <article
              className="market-card"
              key={
                card.id
              }
            >

              <div
                className={`market-card__image ${
                  card.imageUrl
                    ? "has-real-image"
                    : `game-image-${
                        (
                          index %
                          6
                        ) +
                        1
                      }`
                }`}
              >

                {card.imageUrl ? (
                  <img
                    src={
                      card.imageUrl
                    }
                    alt={
                      card.name
                    }
                    className="market-card__actual-image"
                  />
                ) : (
                  <span>
                    {
                      card.game
                    }
                  </span>
                )}


                <button
                  type="button"
                  className={`favorite-button ${
                    favorites.includes(
                      card.id
                    )
                      ? "is-favorite"
                      : ""
                  }`}
                  onClick={() =>
                    toggleFavorite(
                      card.id
                    )
                  }
                >
                  <Heart
                    size={19}
                  />
                </button>

              </div>


              <div className="market-card__body">

                <div className="market-card__game-row">
                  <span>
                    {
                      card.set
                    }
                  </span>

                  <span className="rating">
                    <Star
                      size={14}
                      fill="currentColor"
                    />

                    {
                      card.rating
                    }
                  </span>
                </div>


                <h3>
                  {
                    card.name
                  }
                </h3>


                <p className="card-rarity">
                  {
                    card.rarity
                  }
                </p>


                <div className="card-condition-row">
                  <span>
                    {
                      card.condition
                    }
                  </span>

                  <span>
                    {
                      card.stock
                    }{" "}
                    available
                  </span>
                </div>


                <div className="market-card__seller">
                  Sold by{" "}

                  <strong>
                    {
                      card.seller
                    }
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
                      addToCart(
                        card
                      )
                    }
                  >
                    <ShoppingBag
                      size={17}
                    />

                    Add
                  </button>
                </div>

              </div>

            </article>
          )
        )}


        {displayedCards.length ===
          0 && (
          <div className="empty-state full-grid-item">

            <Search
              size={38}
            />

            <h3>
              No cards found
            </h3>

            <p>
              Try another search
              or filter.
            </p>

          </div>
        )}

      </div>
    );
  }


  /* =========================================================
     HOME
  ========================================================= */

  function renderHome() {
    return (
      <>
        <section className="hero-section">

          <div className="hero-section__content">

            <span className="eyebrow">
              The home of local
              card players
            </span>


            <h1>
              Find cards. Join
              events. Become the
              top player.
            </h1>


            <p>
              Browse cards,
              register for
              events, check
              rankings and
              connect with the
              community.
            </p>


            <div className="hero-actions">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "shop"
                  )
                }
              >
                Browse cards

                <ChevronRight
                  size={18}
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
                View events
              </button>

            </div>

          </div>


          <div className="hero-stat-panel">

            <div>
              <ShoppingBag
                size={24}
              />

              <strong>
                {
                  cardItems.length
                }
              </strong>

              <span>
                Cards listed
              </span>
            </div>


            <div>
              <Users
                size={24}
              />

              <strong>
                {
                  rankingItems.length
                }
              </strong>

              <span>
                Ranked players
              </span>
            </div>


            <div>
              <Trophy
                size={24}
              />

              <strong>
                {
                  shopEvents.length
                }
              </strong>

              <span>
                Upcoming events
              </span>
            </div>

          </div>

        </section>


        <section className="content-section">

          <div className="section-heading">

            <div>
              <span className="eyebrow">
                Marketplace
              </span>

              <h2>
                Popular cards
              </h2>

              <p>
                Discover cards
                currently
                available.
              </p>
            </div>


            <button
              type="button"
              className="text-button"
              onClick={() =>
                navigate(
                  "shop"
                )
              }
            >
              View all cards

              <ChevronRight
                size={17}
              />
            </button>

          </div>


          {renderCardGrid(
            4
          )}

        </section>


        <section className="dashboard-grid">

          <article className="dashboard-panel">

            <div className="section-heading compact">

              <div>
                <span className="eyebrow">
                  Upcoming
                </span>

                <h2>
                  Shop events
                </h2>
              </div>

              <CalendarDays
                size={25}
              />

            </div>


            <div className="mini-event-list">

              {shopEvents
                .slice(
                  0,
                  3
                )
                .map(
                  (event) => {
                    const dateParts =
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
                              {
                                dateParts.day
                              }
                            </strong>

                            <span>
                              {
                                dateParts.month
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
                            {formatEventTime(
                              event.time
                            )}{" "}
                            ·{" "}
                            {
                              event.slots
                            }{" "}
                            slots left
                          </p>
                        </div>

                      </div>
                    );
                  }
                )}

            </div>

          </article>


          <article className="dashboard-panel">

            <div className="section-heading compact">

              <div>
                <span className="eyebrow">
                  Leaderboard
                </span>

                <h2>
                  Bracket 1
                  leaders
                </h2>
              </div>

              <Trophy
                size={25}
              />

            </div>


            <div className="leader-preview-list">

              {rankingItems
                .filter(
                  (player) =>
                    Number(
                      player.bracket
                    ) ===
                    1
                )
                .sort(
                  (
                    a,
                    b
                  ) =>
                    Number(
                      a.rank
                    ) -
                    Number(
                      b.rank
                    )
                )
                .slice(
                  0,
                  3
                )
                .map(
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
                          {
                            player.wins
                          }
                          W ·{" "}
                          {
                            player.losses
                          }
                          L
                        </span>
                      </div>


                      <strong className="player-points">
                        {
                          player.points
                        }{" "}
                        pts
                      </strong>

                    </div>
                  )
                )}

            </div>

          </article>

        </section>
      </>
    );
  }


  /* =========================================================
     SHOP
  ========================================================= */

  function renderShop() {
    const gameOptions = [
      "All",

      ...new Set(
        cardItems.map(
          (card) =>
            card.game
        )
      ),
    ];


    return (
      <section className="content-section page-section">

        <div className="page-title-row">

          <div>
            <span className="eyebrow">
              Marketplace
            </span>

            <h1>
              Card Shop
            </h1>

            <p>
              Search by card,
              game, set,
              rarity or seller.
            </p>
          </div>


          <button
            type="button"
            className="cart-summary-button"
            onClick={() =>
              navigate(
                "cart"
              )
            }
          >
            <ShoppingCart
              size={20}
            />

            Cart

            <span>
              {
                cartCount
              }
            </span>
          </button>

        </div>


        <div className="shop-toolbar">

          <label className="search-field">

            <Search
              size={19}
            />

            <input
              type="search"
              placeholder="Search for a card..."
              value={
                searchText
              }
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
            value={
              gameFilter
            }
            onChange={(
              event
            ) =>
              setGameFilter(
                event.target
                  .value
              )
            }
          >

            {gameOptions.map(
              (game) => (
                <option
                  key={
                    game
                  }
                  value={
                    game
                  }
                >
                  {game ===
                  "All"
                    ? "All games"
                    : game}
                </option>
              )
            )}

          </select>

        </div>


        <div className="results-line">

          <strong>
            {
              filteredCards.length
            }
          </strong>{" "}
          cards found

        </div>


        {renderCardGrid()}

      </section>
    );
  }


  /* =========================================================
     EVENTS
  ========================================================= */

  function renderEvents() {
    return (
      <section className="content-section page-section">

        <div className="page-title-row">

          <div>
            <span className="eyebrow">
              Compete and
              connect
            </span>

            <h1>
              Upcoming Events
            </h1>

            <p>
              Register for
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
                key={
                  event.id
                }
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
                          event.game
                        }
                      </span>

                      <CalendarDays
                        size={34}
                      />
                    </>
                  )}

                </div>


                <div className="event-card__body">

                  <span className="event-status">
                    {event.status ===
                    "Full"
                      ? "Registration full"
                      : "Registration open"}
                  </span>


                  <h2>
                    {
                      event.title
                    }
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

                      {
                        event.venue
                      }
                    </p>


                    <p>
                      <strong>
                        Entry fee:
                      </strong>{" "}

                      {formatPrice(
                        event.fee
                      )}
                    </p>

                  </div>


                  <div className="event-card__footer">

                    <span>
                      {
                        event.slots
                      }{" "}
                      slots remaining
                    </span>


                    <button
                      type="button"
                      disabled={
                        event.status ===
                          "Full" ||
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
                        : event.status ===
                            "Full" ||
                          event.slots <=
                            0
                        ? "Full"
                        : "Register now"}
                    </button>

                  </div>

                </div>

              </article>
            )
          )}


          {shopEvents.length ===
            0 && (
            <div className="empty-state full-grid-item">

              <CalendarDays
                size={42}
              />

              <h3>
                No upcoming events
              </h3>

              <p>
                Check back later for
                new tournaments.
              </p>

            </div>
          )}

        </div>

      </section>
    );
  }


  /* =========================================================
     RANKINGS
  ========================================================= */

  function renderRankings() {
    const selectedPlayers =
      rankingItems
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
          (
            a,
            b
          ) =>
            Number(
              a.rank
            ) -
            Number(
              b.rank
            )
        );


    return (
      <section className="content-section page-section">

        <div className="page-title-row">

          <div>
            <span className="eyebrow">
              Player standings
            </span>

            <h1>
              Bracket Rankings
            </h1>

            <p>
              View current
              positions and
              points.
            </p>
          </div>

        </div>


        <div className="bracket-tabs">

          {[1, 2, 3, 4].map(
            (bracket) => (
              <button
                type="button"
                key={
                  bracket
                }
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
                {
                  bracket
                }
              </button>
            )
          )}

        </div>


        <div className="ranking-card">

          <div className="ranking-card__header">

            <div>
              <span>
                Current standings
              </span>

              <h2>
                Bracket{" "}
                {
                  selectedBracket
                }
              </h2>
            </div>

            <Trophy
              size={33}
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

                {selectedPlayers.map(
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
                        {
                          player.wins
                        }
                      </td>


                      <td>
                        {
                          player.losses
                        }
                      </td>


                      <td>
                        <strong>
                          {
                            player.points
                          }
                        </strong>
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

      </section>
    );
  }


  /* =========================================================
     COMMUNITY
  ========================================================= */

  function renderCommunity() {
    return (
      <section className="content-section page-section">

        <div className="page-title-row">

          <div>
            <span className="eyebrow">
              Ask the community
            </span>

            <h1>
              Questions and
              Discussions
            </h1>

            <p>
              Ask about cards,
              events, values or
              decks.
            </p>
          </div>

        </div>


        <div className="community-layout">

          <div>

            <form
              className="question-form"
              onSubmit={
                submitQuestion
              }
            >

              <div className="question-form__icon">
                <CircleHelp
                  size={25}
                />
              </div>


              <div className="question-form__content">

                <h2>
                  Ask a question
                </h2>


                <textarea
                  value={
                    questionText
                  }
                  onChange={(
                    event
                  ) =>
                    setQuestionText(
                      event.target
                        .value
                    )
                  }
                  placeholder="What would you like to ask?"
                  rows={4}
                />


                <div className="question-form__footer">

                  <span>
                    Be respectful
                    and provide
                    details.
                  </span>


                  <button
                    type="submit"
                  >
                    Post question
                  </button>

                </div>

              </div>

            </form>


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
                          size={17}
                        />

                        {
                          question.replies
                        }{" "}
                        replies
                      </button>

                    </div>

                  </article>
                )
              )}

            </div>

          </div>


          <aside className="community-sidebar">

            <h3>
              Community guidelines
            </h3>


            <ul>
              <li>
                Use a clear
                question.
              </li>

              <li>
                Respect other
                players.
              </li>

              <li>
                Do not post
                fake listings.
              </li>

              <li>
                Report suspicious
                activity.
              </li>
            </ul>

          </aside>

        </div>

      </section>
    );
  }


  /* =========================================================
     CART
  ========================================================= */

  function renderCart() {
    return (
      <section className="content-section page-section">

        <div className="page-title-row">

          <div>
            <span className="eyebrow">
              Your order
            </span>

            <h1>
              Shopping Cart
            </h1>

            <p>
              Review selected
              cards before
              checkout.
            </p>
          </div>

        </div>


        {cart.length ===
        0 ? (

          <div className="empty-state large">

            <ShoppingCart
              size={47}
            />

            <h2>
              Your cart is empty
            </h2>

            <p>
              Browse the shop
              and add cards.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "shop"
                )
              }
            >
              Browse cards
            </button>

          </div>

        ) : (

          <div className="cart-layout">

            <div className="cart-list">

              {cart.map(
                (
                  item,
                  index
                ) => (
                  <article
                    className="cart-item"
                    key={
                      item.id
                    }
                  >

                    <div
                      className={`cart-item__image ${
                        item.imageUrl
                          ? "has-real-image"
                          : `game-image-${
                              (
                                index %
                                6
                              ) +
                              1
                            }`
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
                            item.game
                          }
                        </span>
                      )}

                    </div>


                    <div className="cart-item__details">

                      <span>
                        {
                          item.set
                        }
                      </span>

                      <h3>
                        {
                          item.name
                        }
                      </h3>

                      <p>
                        {
                          item.condition
                        }{" "}
                        ·{" "}
                        {
                          item.seller
                        }
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
                          size={16}
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
                      >
                        <Plus
                          size={16}
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
                Order summary
              </h2>


              <div>
                <span>
                  Items
                </span>

                <strong>
                  {
                    cartCount
                  }
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
                  Calculated later
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
                disabled={
                  checkoutLoading
                }
                onClick={
                  handleCheckout
                }
              >
                {checkoutLoading
                  ? "Processing..."
                  : "Proceed to checkout"}
              </button>

            </aside>

          </div>
        )}

      </section>
    );
  }


  /* =========================================================
     PROFILE
  ========================================================= */

  function renderProfile() {
    return (
      <section className="content-section page-section">

        <div className="profile-header-card">

          <div className="profile-avatar">
            {getInitials(
              playerName
            )}
          </div>


          <div>
            <span className="eyebrow">
              Player account
            </span>

            <h1>
              {
                playerName
              }
            </h1>

            <p>
              Card collector
              and tournament
              player
            </p>
          </div>


          <button
            type="button"
          >
            Edit profile
          </button>

        </div>


        <div className="profile-grid">

          <article className="profile-panel">

            <h2>
              Player information
            </h2>


            <div className="profile-info-row">
              <span>
                Current bracket
              </span>

              <strong>
                Bracket{" "}
                {
                  playerBracket
                }
              </strong>
            </div>


            <div className="profile-info-row">
              <span>
                Current rank
              </span>

              <strong>
                #
                {
                  playerRank
                }
              </strong>
            </div>


            <div className="profile-info-row">
              <span>
                Total points
              </span>

              <strong>
                {
                  playerPoints
                }{" "}
                points
              </strong>
            </div>


            <div className="profile-info-row">
              <span>
                Member since
              </span>

              <strong>
                {profileData
                  ?.joined
                  ? new Date(
                      profileData.joined
                    ).toLocaleDateString(
                      "en-US",
                      {
                        month:
                          "long",

                        year:
                          "numeric",
                      }
                    )
                  : "-"}
              </strong>
            </div>

          </article>


          <article className="profile-panel">

            <h2>
              Account activity
            </h2>


            <div className="profile-stat-grid">

              <div>
                <ShoppingBag
                  size={21}
                />

                <strong>
                  {
                    cartCount
                  }
                </strong>

                <span>
                  Cart items
                </span>
              </div>


              <div>
                <CalendarDays
                  size={21}
                />

                <strong>
                  {
                    shopEvents.length
                  }
                </strong>

                <span>
                  Events
                </span>
              </div>


              <div>
                <Heart
                  size={21}
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


              <div>
                <MessageCircle
                  size={21}
                />

                <strong>
                  {
                    questions.length
                  }
                </strong>

                <span>
                  Questions
                </span>
              </div>

            </div>

          </article>

        </div>

      </section>
    );
  }


  function renderPage() {
    switch (
      activePage
    ) {
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
              Card Marketplace
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
            <X
              size={21}
            />
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
                  key={
                    item.id
                  }
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
                    size={20}
                  />

                  <span>
                    {
                      item.label
                    }
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
              {
                playerName
              }
            </strong>

            <span>
              Bracket{" "}
              {
                playerBracket
              }

              {playerRank !==
                "-" &&
                ` · Rank #${playerRank}`}
            </span>
          </div>

        </div>


        <button
          type="button"
          className="sidebar-logout"
          onClick={
            onLogout
          }
        >
          <LogOut
            size={19}
          />

          Log out
        </button>

      </aside>


      {mobileSidebarOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={() =>
            setMobileSidebarOpen(
              false
            )
          }
        />
      )}


      <div className="user-main">

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
              size={23}
            />
          </button>


          <label className="header-search">

            <Search
              size={18}
            />

            <input
              type="search"
              placeholder="Search cards..."
              value={
                searchText
              }
              onChange={(
                event
              ) =>
                setSearchText(
                  event.target
                    .value
                )
              }
              onFocus={() =>
                setActivePage(
                  "shop"
                )
              }
            />

          </label>


          <div className="header-actions">

            <button
              type="button"
              className="header-cart-button"
              onClick={() =>
                navigate(
                  "cart"
                )
              }
            >
              <ShoppingCart
                size={20}
              />

              <span>
                {
                  cartCount
                }
              </span>
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
                  {
                    playerName
                  }
                </strong>

                <span>
                  Bracket{" "}
                  {
                    playerBracket
                  }
                </span>
              </div>

            </button>

          </div>

        </header>


        <main className="user-page-content">
          {renderPage()}
        </main>

      </div>

    </div>
  );
}


export default UserApp;