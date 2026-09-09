import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Edit3,
  Eye,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import {
  createCard,
  createEvent,
  createRanking,
  deleteCard,
  deleteCardImage,
  deleteEvent,
  deleteOrder,
  deleteQuestion,
  deleteRanking,
  getCards,
  getEvents,
  getOrders,
  getQuestions,
  getRankings,
  updateCard,
  updateEvent,
  updateOrder,
  updateQuestionStatus as updateQuestionStatusDB,
  updateRanking,
  uploadCardImage,
} from "../lib/database";

import "./admin.css";

const RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Mythic Rare",
];

const COLOR_IDENTITIES = [
  "White",
  "Blue",
  "Black",
  "Red",
  "Green",
  "Multicolor",
  "Colorless",
];

const CONDITIONS = [
  "Near Mint",
  "Lightly Played",
  "Moderately Played",
  "Heavily Played",
  "Damaged",
];

const FINISHES = [
  "Nonfoil",
  "Foil",
  "Etched Foil",
];

const FORMATS = [
  "Standard",
  "Pioneer",
  "Modern",
  "Legacy",
  "Vintage",
  "Commander",
  "Pauper",
];

const RARITY_LETTER = {
  Common: "C",
  Uncommon: "U",
  Rare: "R",
  "Mythic Rare": "M",
};

const COLOR_LETTER = {
  White: "W",
  Blue: "U",
  Black: "B",
  Red: "R",
  Green: "G",
  Multicolor: "M",
  Colorless: "C",
};

const BRACKET_FORMAT = {
  1: "Standard",
  2: "Commander",
  3: "Legacy",
  4: "Modern",
};

const initialUsers = [
  {
    id: 1,
    name: "Ivan Guerrero",
    email: "user@stax.com",
    role: "Player",
    bracket: 4,
    status: "Active",
    joined: "2026-01-10",
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@stax.com",
    role: "Admin",
    bracket: 1,
    status: "Active",
    joined: "2025-12-01",
  },
];

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "cards",
    label: "Cards",
    icon: Package,
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
    id: "users",
    label: "Users",
    icon: Users,
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBag,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

const emptyCardForm = {
  name: "",
  game: "Magic",
  set: "",
  setCode: "",
  rarity: "Rare",
  colors: "Colorless",
  condition: "Near Mint",
  finish: "Nonfoil",
  seller: "STAX Card Shop",
  price: "",
  stock: "",
  featured: false,
  status: "Available",
  imageUrl: "",
  imagePath: "",
};

const emptyEventForm = {
  title: "",
  format: "Standard",
  date: "",
  time: "",
  venue: "STAX Card Shop",
  fee: "",
  slots: "",
  registered: 0,
  bracket: "Division 1",
  status: "Open",
};

const emptyRankingForm = {
  name: "",
  bracket: 1,
  wins: 0,
  losses: 0,
  points: 0,
  rank: 1,
};

const emptyUserForm = {
  name: "",
  email: "",
  role: "Player",
  bracket: 1,
  status: "Active",
  joined: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function RarityBadge({ value }) {
  const className = String(value)
    .toLowerCase()
    .replaceAll(" ", "-");

  return (
    <span
      className={`admin-rarity admin-rarity--${className}`}
    >
      <span className="admin-rarity-dot">
        {RARITY_LETTER[value] || "?"}
      </span>

      {value}
    </span>
  );
}

function ColorPip({ value }) {
  const className = String(value).toLowerCase();

  return (
    <span
      className={`admin-color-pip admin-color-pip--${className}`}
    >
      <span className="admin-color-pip-dot">
        {COLOR_LETTER[value] || "?"}
      </span>

      {value}
    </span>
  );
}

function AdminApp({
  onLogout,
  profile,
}) {
  const [activePage, setActivePage] =
    useState("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [globalSearch, setGlobalSearch] =
    useState("");

  const [rarityFilter, setRarityFilter] =
    useState("All");

  const [cards, setCards] = useState([]);
  const [events, setEvents] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [orders, setOrders] = useState([]);

  const [users, setUsers] =
    useState(initialUsers);

  const [modal, setModal] = useState(null);
  const [editingItem, setEditingItem] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [cardForm, setCardForm] =
    useState(emptyCardForm);

  const [eventForm, setEventForm] =
    useState(emptyEventForm);

  const [rankingForm, setRankingForm] =
    useState(emptyRankingForm);

  const [userForm, setUserForm] =
    useState(emptyUserForm);

  const [
    cardImageFile,
    setCardImageFile,
  ] = useState(null);

  const [
    cardImagePreview,
    setCardImagePreview,
  ] = useState("");

  const [cardSaving, setCardSaving] =
    useState(false);

  const loadCards =
    useCallback(async () => {
      try {
        const data =
          await getCards();

        setCards(
          data.map((card) => ({
            id: card.id,
            name: card.name,
            game: card.game,
            set: card.set_name,
            setCode: card.set_code,
            rarity: card.rarity,
            colors: card.colors,
            condition: card.condition,
            finish: card.finish,
            seller: card.seller,
            price: Number(card.price),
            stock: Number(card.stock),
            featured: card.featured,
            status: card.status,
            imageUrl:
              card.image_url || "",
            imagePath:
              card.image_path || "",
          }))
        );
      } catch (error) {
        console.error(
          "Could not load cards:",
          error
        );
      }
    }, []);

  const loadEvents =
    useCallback(async () => {
      try {
        const data =
          await getEvents();

        setEvents(
          data.map((item) => ({
            id: item.id,
            title: item.title,
            format: item.format,
            date: item.event_date,
            time: item.event_time,
            venue: item.venue,
            fee: Number(item.fee),
            slots: Number(item.slots),
            registered: Number(
              item.registered
            ),
            bracket: item.bracket,
            status: item.status,
          }))
        );
      } catch (error) {
        console.error(
          "Could not load events:",
          error
        );
      }
    }, []);

  const loadRankings =
    useCallback(async () => {
      try {
        const data =
          await getRankings();

        setRankings(data);
      } catch (error) {
        console.error(
          "Could not load rankings:",
          error
        );
      }
    }, []);

  const loadQuestions =
    useCallback(async () => {
      try {
        const data =
          await getQuestions();

        setQuestions(
          data.map((item) => ({
            id: item.id,
            user: item.user_name,
            category: item.category,
            question: item.question,
            replies: item.replies,
            status: item.status,
            date: new Date(
              item.created_at
            )
              .toISOString()
              .slice(0, 10),
          }))
        );
      } catch (error) {
        console.error(
          "Could not load questions:",
          error
        );
      }
    }, []);

  const loadOrders =
    useCallback(async () => {
      try {
        const data =
          await getOrders();

        setOrders(
          data.map((item) => ({
            id: item.id,
            orderNumber:
              item.order_number,
            customer: item.customer,
            item: item.item,
            quantity: Number(
              item.quantity
            ),
            total: Number(item.total),
            payment: item.payment,
            delivery: item.delivery,
            date: new Date(
              item.created_at
            )
              .toISOString()
              .slice(0, 10),
          }))
        );
      } catch (error) {
        console.error(
          "Could not load orders:",
          error
        );
      }
    }, []);

  useEffect(() => {
    async function loadEverything() {
      await Promise.all([
        loadCards(),
        loadEvents(),
        loadRankings(),
        loadQuestions(),
        loadOrders(),
      ]);
    }

    loadEverything();
  }, [
    loadCards,
    loadEvents,
    loadRankings,
    loadQuestions,
    loadOrders,
  ]);

  useEffect(() => {
    const channel =
      supabase
        .channel(
          "stax-admin-realtime"
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

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
          },
          () => {
            loadOrders();
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
    loadOrders,
  ]);

  const totalRevenue = orders
    .filter(
      (order) =>
        order.payment === "Paid"
    )
    .reduce(
      (total, order) =>
        total + order.total,
      0
    );

  const lowStockCards =
    cards.filter(
      (card) => card.stock <= 2
    );

  const mythicCount =
    cards.filter(
      (card) =>
        card.rarity ===
        "Mythic Rare"
    ).length;

  const filteredCards =
    useMemo(() => {
      const query =
        globalSearch
          .trim()
          .toLowerCase();

      return cards.filter(
        (card) => {
          const matchesQuery =
            !query ||
            `${card.name} ${card.game} ${card.set} ${card.setCode} ${card.rarity} ${card.colors}`
              .toLowerCase()
              .includes(query);

          const matchesRarity =
            rarityFilter ===
              "All" ||
            card.rarity ===
              rarityFilter;

          return (
            matchesQuery &&
            matchesRarity
          );
        }
      );
    }, [
      cards,
      globalSearch,
      rarityFilter,
    ]);

  const filteredEvents =
    useMemo(() => {
      const query =
        globalSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return events;
      }

      return events.filter(
        (event) =>
          `${event.title} ${event.format} ${event.venue}`
            .toLowerCase()
            .includes(query)
      );
    }, [
      events,
      globalSearch,
    ]);

  const filteredUsers =
    useMemo(() => {
      const query =
        globalSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return users;
      }

      return users.filter(
        (user) =>
          `${user.name} ${user.email} ${user.role}`
            .toLowerCase()
            .includes(query)
      );
    }, [
      users,
      globalSearch,
    ]);

  const filteredOrders =
    useMemo(() => {
      const query =
        globalSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return orders;
      }

      return orders.filter(
        (order) =>
          `${order.orderNumber} ${order.customer} ${order.item}`
            .toLowerCase()
            .includes(query)
      );
    }, [
      orders,
      globalSearch,
    ]);

  function navigate(page) {
    setActivePage(page);
    setSidebarOpen(false);
    setGlobalSearch("");
    setRarityFilter("All");
  }

  function openAddModal(type) {
    setEditingItem(null);

    if (type === "card") {
      setCardForm(
        emptyCardForm
      );

      setCardImageFile(
        null
      );

      setCardImagePreview(
        ""
      );
    }

    if (type === "event") {
      setEventForm(
        emptyEventForm
      );
    }

    if (type === "ranking") {
      setRankingForm(
        emptyRankingForm
      );
    }

    if (type === "user") {
      setUserForm({
        ...emptyUserForm,
        joined: new Date()
          .toISOString()
          .slice(0, 10),
      });
    }

    setModal(type);
  }

  function openEditModal(
    type,
    item
  ) {
    setEditingItem(item);

    if (type === "card") {
      setCardForm(item);

      setCardImageFile(
        null
      );

      setCardImagePreview(
        item.imageUrl || ""
      );
    }

    if (type === "event") {
      setEventForm(item);
    }

    if (type === "ranking") {
      setRankingForm(item);
    }

    if (type === "user") {
      setUserForm(item);
    }

    setModal(type);
  }

  function closeModal() {
    setModal(null);
    setEditingItem(null);

    setCardImageFile(
      null
    );

    setCardImagePreview(
      ""
    );
  }

  function handleCardImageChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please choose an image file."
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Image must be 5MB or smaller."
      );
      return;
    }

    setCardImageFile(file);

    const preview =
      URL.createObjectURL(
        file
      );

    setCardImagePreview(
      preview
    );
  }

  async function saveCard(
    event
  ) {
    event.preventDefault();

    if (cardSaving) {
      return;
    }

    setCardSaving(true);

    try {
      let imageUrl =
        cardForm.imageUrl ||
        "";

      let imagePath =
        cardForm.imagePath ||
        "";

      let oldImagePath =
        null;

      if (cardImageFile) {
        const uploaded =
          await uploadCardImage(
            cardImageFile
          );

        if (
          editingItem?.imagePath
        ) {
          oldImagePath =
            editingItem.imagePath;
        }

        imageUrl =
          uploaded.url;

        imagePath =
          uploaded.path;
      }

      const cardData = {
        name:
          cardForm.name.trim(),

        game:
          cardForm.game ||
          "Magic",

        set_name:
          cardForm.set.trim(),

        set_code:
          cardForm.setCode
            .trim()
            .toUpperCase(),

        rarity:
          cardForm.rarity,

        colors:
          cardForm.colors,

        condition:
          cardForm.condition,

        finish:
          cardForm.finish,

        seller:
          cardForm.seller.trim(),

        price:
          Number(
            cardForm.price
          ),

        stock:
          Number(
            cardForm.stock
          ),

        featured:
          Boolean(
            cardForm.featured
          ),

        status:
          Number(
            cardForm.stock
          ) <= 0
            ? "Unavailable"
            : cardForm.status,

        image_url:
          imageUrl || null,

        image_path:
          imagePath || null,
      };

      if (editingItem) {
        await updateCard(
          editingItem.id,
          cardData
        );
      } else {
        await createCard(
          cardData
        );
      }

      if (oldImagePath) {
        try {
          await deleteCardImage(
            oldImagePath
          );
        } catch (error) {
          console.warn(
            "Old image cleanup failed:",
            error
          );
        }
      }

      closeModal();

      await loadCards();
    } catch (error) {
      console.error(
        "Save card:",
        error
      );

      alert(
        error.message ||
        "Could not save card."
      );
    } finally {
      setCardSaving(false);
    }
  }

  async function saveEvent(
    event
  ) {
    event.preventDefault();

    const data = {
      title:
        eventForm.title.trim(),

      format:
        eventForm.format,

      event_date:
        eventForm.date,

      event_time:
        eventForm.time,

      venue:
        eventForm.venue.trim(),

      fee:
        Number(
          eventForm.fee
        ),

      slots:
        Number(
          eventForm.slots
        ),

      registered:
        Number(
          eventForm.registered ||
            0
        ),

      bracket:
        eventForm.bracket,

      status:
        eventForm.status,
    };

    try {
      if (editingItem) {
        await updateEvent(
          editingItem.id,
          data
        );
      } else {
        await createEvent(
          data
        );
      }

      closeModal();

      await loadEvents();
    } catch (error) {
      console.error(
        error
      );

      alert(
        "Could not save event."
      );
    }
  }

  async function saveRanking(
    event
  ) {
    event.preventDefault();

    const data = {
      name:
        rankingForm.name.trim(),

      bracket:
        Number(
          rankingForm.bracket
        ),

      wins:
        Number(
          rankingForm.wins
        ),

      losses:
        Number(
          rankingForm.losses
        ),

      points:
        Number(
          rankingForm.points
        ),

      rank:
        Number(
          rankingForm.rank
        ),
    };

    try {
      if (editingItem) {
        await updateRanking(
          editingItem.id,
          data
        );
      } else {
        await createRanking(
          data
        );
      }

      closeModal();

      await loadRankings();
    } catch (error) {
      console.error(
        error
      );

      alert(
        "Could not save ranking."
      );
    }
  }

  function saveUser(event) {
    event.preventDefault();

    const normalizedUser = {
      ...userForm,
      bracket: Number(
        userForm.bracket
      ),
    };

    if (editingItem) {
      setUsers((current) =>
        current.map(
          (item) =>
            item.id ===
            editingItem.id
              ? {
                  ...normalizedUser,
                  id:
                    editingItem.id,
                }
              : item
        )
      );
    } else {
      setUsers((current) => [
        {
          ...normalizedUser,
          id: Date.now(),
        },
        ...current,
      ]);
    }

    closeModal();
  }

  function requestDelete(
    type,
    item
  ) {
    setDeleteTarget({
      type,
      item,
    });
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const {
      type,
      item,
    } = deleteTarget;

    try {
      if (type === "card") {
        await deleteCard(
          item.id,
          item.imagePath
        );
      }

      if (type === "event") {
        await deleteEvent(
          item.id
        );
      }

      if (type === "ranking") {
        await deleteRanking(
          item.id
        );
      }

      if (type === "question") {
        await deleteQuestion(
          item.id
        );
      }

      if (type === "order") {
        await deleteOrder(
          item.id
        );
      }

      if (type === "user") {
        setUsers(
          (current) =>
            current.filter(
              (user) =>
                user.id !==
                item.id
            )
        );
      }

      setDeleteTarget(
        null
      );
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert(
        "Could not delete item."
      );
    }
  }

  async function updateQuestionStatus(
    id,
    status
  ) {
    try {
      await updateQuestionStatusDB(
        id,
        status
      );

      await loadQuestions();
    } catch (error) {
      console.error(
        error
      );
    }
  }

  async function updateOrderField(
    id,
    field,
    value
  ) {
    try {
      await updateOrder(
        id,
        {
          [field]: value,
        }
      );

      await loadOrders();
    } catch (error) {
      console.error(
        error
      );

      alert(
        "Could not update order."
      );
    }
  }

  function renderDashboard() {
    return (
      <>
        <section className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">
              Overview
            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Manage the STAX
              marketplace from one
              dashboard.
            </p>
          </div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={() =>
              openAddModal("card")
            }
          >
            <Plus size={18} />
            Add new card
          </button>
        </section>

        <section className="admin-stat-grid">
          <article className="admin-stat-card">
            <div className="admin-stat-icon">
              <CircleDollarSign
                size={23}
              />
            </div>

            <div>
              <span>
                Total revenue
              </span>

              <strong>
                {formatCurrency(
                  totalRevenue
                )}
              </strong>

              <small>
                Paid orders only
              </small>
            </div>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-icon">
              <Package
                size={23}
              />
            </div>

            <div>
              <span>
                Cards listed
              </span>

              <strong>
                {cards.length}
              </strong>

              <small>
                {
                  lowStockCards.length
                }{" "}
                low-stock cards
              </small>
            </div>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-icon">
              <Sparkles
                size={23}
              />
            </div>

            <div>
              <span>
                Mythic rares
              </span>

              <strong>
                {mythicCount}
              </strong>

              <small>
                In inventory
              </small>
            </div>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-icon">
              <Users
                size={23}
              />
            </div>

            <div>
              <span>
                Registered users
              </span>

              <strong>
                {users.length}
              </strong>

              <small>
                {
                  users.filter(
                    (user) =>
                      user.status ===
                      "Active"
                  ).length
                }{" "}
                active
              </small>
            </div>
          </article>
        </section>

        <section className="admin-dashboard-grid">
          <article className="admin-panel admin-revenue-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">
                  Performance
                </span>

                <h2>
                  Sales overview
                </h2>
              </div>

              <BarChart3
                size={23}
              />
            </div>

            <div className="admin-chart">
              {[
                35,
                48,
                40,
                67,
                56,
                78,
                88,
              ].map(
                (
                  height,
                  index
                ) => (
                  <div
                    className="admin-chart-column"
                    key={index}
                  >
                    <div
                      className="admin-chart-bar"
                      style={{
                        height: `${height}%`,
                      }}
                    />

                    <span>
                      {
                        [
                          "Mon",
                          "Tue",
                          "Wed",
                          "Thu",
                          "Fri",
                          "Sat",
                          "Sun",
                        ][index]
                      }
                    </span>
                  </div>
                )
              )}
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">
                  Inventory
                </span>

                <h2>
                  Low stock
                </h2>
              </div>

              <Package
                size={23}
              />
            </div>

            <div className="admin-compact-list">
              {lowStockCards.map(
                (card) => (
                  <div
                    className="admin-compact-item"
                    key={card.id}
                  >
                    {card.imageUrl ? (
                      <img
                        src={
                          card.imageUrl
                        }
                        alt={
                          card.name
                        }
                        className="admin-card-photo"
                      />
                    ) : (
                      <div className="admin-product-thumbnail">
                        {card.name.slice(
                          0,
                          1
                        )}
                      </div>
                    )}

                    <div>
                      <strong>
                        {card.name}
                      </strong>

                      <span>
                        {card.set}
                      </span>
                    </div>

                    <span
                      className={`admin-stock-count ${
                        card.stock ===
                        0
                          ? "danger"
                          : ""
                      }`}
                    >
                      {card.stock} left
                    </span>
                  </div>
                )
              )}
            </div>
          </article>
        </section>

        <section className="admin-dashboard-grid lower">
          <article className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">
                  Recent
                </span>

                <h2>
                  Latest orders
                </h2>
              </div>

              <button
                type="button"
                className="admin-text-button"
                onClick={() =>
                  navigate("orders")
                }
              >
                View all
              </button>
            </div>

            <div className="admin-compact-list">
              {orders
                .slice(0, 4)
                .map((order) => (
                  <div
                    className="admin-compact-item"
                    key={order.id}
                  >
                    <div className="admin-product-thumbnail">
                      <ShoppingBag
                        size={17}
                      />
                    </div>

                    <div>
                      <strong>
                        {
                          order.customer
                        }
                      </strong>

                      <span>
                        {
                          order.orderNumber
                        }{" "}
                        ·{" "}
                        {order.item}
                      </span>
                    </div>

                    <strong>
                      {formatCurrency(
                        order.total
                      )}
                    </strong>
                  </div>
                ))}
            </div>
          </article>

          <article className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">
                  Community
                </span>

                <h2>
                  Pending questions
                </h2>
              </div>

              <MessageCircle
                size={23}
              />
            </div>

            <div className="admin-compact-list">
              {questions
                .filter(
                  (question) =>
                    question.status ===
                    "Open"
                )
                .slice(0, 4)
                .map(
                  (question) => (
                    <div
                      className="admin-question-preview"
                      key={
                        question.id
                      }
                    >
                      <strong>
                        {
                          question.user
                        }
                      </strong>

                      <p>
                        {
                          question.question
                        }
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuestionStatus(
                            question.id,
                            "Answered"
                          )
                        }
                      >
                        Mark answered
                      </button>
                    </div>
                  )
                )}
            </div>
          </article>
        </section>
      </>
    );
  }

  function renderCards() {
    return (
      <>
        <section className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">
              Inventory
            </span>

            <h1>
              Manage Cards
            </h1>

            <p>
              Add, edit, delete,
              price, stock, and
              photos.
            </p>
          </div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={() =>
              openAddModal("card")
            }
          >
            <Plus size={18} />
            Add card
          </button>
        </section>

        <div className="admin-filter-row">
          <button
            type="button"
            className={
              rarityFilter === "All"
                ? "active"
                : ""
            }
            onClick={() =>
              setRarityFilter("All")
            }
          >
            All rarities
          </button>

          {RARITIES.map(
            (rarity) => (
              <button
                key={rarity}
                type="button"
                className={
                  rarityFilter ===
                  rarity
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setRarityFilter(
                    rarity
                  )
                }
              >
                {rarity}
              </button>
            )
          )}
        </div>

        <AdminTableCard>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Card</th>
                  <th>Set</th>
                  <th>Color</th>
                  <th>Rarity</th>
                  <th>Finish</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCards.map(
                  (card) => (
                    <tr key={card.id}>
                      <td>
                        <div className="admin-name-cell">
                          {card.imageUrl ? (
                            <img
                              src={
                                card.imageUrl
                              }
                              alt={
                                card.name
                              }
                              className="admin-card-photo"
                            />
                          ) : (
                            <div className="admin-product-thumbnail">
                              {card.name.slice(
                                0,
                                1
                              )}
                            </div>
                          )}

                          <div>
                            <strong>
                              {
                                card.name
                              }

                              {card.featured && (
                                <Sparkles
                                  size={
                                    12
                                  }
                                  className="admin-featured-star"
                                />
                              )}
                            </strong>

                            <span>
                              {
                                card.condition
                              }
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {card.set}

                        <span className="admin-set-code">
                          {
                            card.setCode
                          }
                        </span>
                      </td>

                      <td>
                        <ColorPip
                          value={
                            card.colors
                          }
                        />
                      </td>

                      <td>
                        <RarityBadge
                          value={
                            card.rarity
                          }
                        />
                      </td>

                      <td>
                        {
                          card.finish
                        }
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            card.price
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`admin-stock-count ${
                            card.stock ===
                            0
                              ? "danger"
                              : ""
                          }`}
                        >
                          {
                            card.stock
                          }
                        </span>
                      </td>

                      <td>
                        <StatusBadge
                          value={
                            card.status
                          }
                        />
                      </td>

                      <td>
                        <ActionButtons
                          onEdit={() =>
                            openEditModal(
                              "card",
                              card
                            )
                          }
                          onDelete={() =>
                            requestDelete(
                              "card",
                              card
                            )
                          }
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </AdminTableCard>
      </>
    );
  }

  function renderEvents() {
    return (
      <>
        <section className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">
              Tournaments
            </span>

            <h1>
              Manage Events
            </h1>

            <p>
              Create and manage
              tournaments.
            </p>
          </div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={() =>
              openAddModal("event")
            }
          >
            <Plus size={18} />
            Create event
          </button>
        </section>

        <div className="admin-event-grid">
          {filteredEvents.map(
            (event) => (
              <article
                className="admin-event-card"
                key={event.id}
              >
                <div className="admin-event-card__header">
                  <span>
                    {event.format}
                  </span>

                  <StatusBadge
                    value={
                      event.status
                    }
                  />
                </div>

                <h2>
                  {event.title}
                </h2>

                <div className="admin-event-details">
                  <p>
                    <strong>
                      Date:
                    </strong>{" "}
                    {event.date}
                  </p>

                  <p>
                    <strong>
                      Time:
                    </strong>{" "}
                    {event.time}
                  </p>

                  <p>
                    <strong>
                      Venue:
                    </strong>{" "}
                    {event.venue}
                  </p>

                  <p>
                    <strong>
                      Division:
                    </strong>{" "}
                    {
                      event.bracket
                    }
                  </p>

                  <p>
                    <strong>
                      Fee:
                    </strong>{" "}
                    {formatCurrency(
                      event.fee
                    )}
                  </p>
                </div>

                <div className="admin-registration-progress">
                  <div>
                    <span>
                      Registrations
                    </span>

                    <strong>
                      {
                        event.registered
                      }
                      /{event.slots}
                    </strong>
                  </div>

                  <div className="admin-progress-track">
                    <span
                      style={{
                        width: `${
                          event.slots >
                          0
                            ? Math.min(
                                (event.registered /
                                  event.slots) *
                                  100,
                                100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="admin-card-actions">
                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(
                        "event",
                        event
                      )
                    }
                  >
                    <Edit3
                      size={16}
                    />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() =>
                      requestDelete(
                        "event",
                        event
                      )
                    }
                  >
                    <Trash2
                      size={16}
                    />
                    Delete
                  </button>
                </div>
              </article>
            )
          )}
        </div>
      </>
    );
  }

  function renderRankings() {
    return (
      <>
        <section className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">
              Leaderboards
            </span>

            <h1>
              Manage Rankings
            </h1>

            <p>
              Update divisions,
              wins, losses,
              points and rank.
            </p>
          </div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={() =>
              openAddModal(
                "ranking"
              )
            }
          >
            <Plus size={18} />
            Add player
          </button>
        </section>

        {[1, 2, 3, 4].map(
          (bracket) => (
            <AdminTableCard
              key={bracket}
              title={`Division ${bracket} · ${BRACKET_FORMAT[bracket]}`}
              icon={
                <Trophy
                  size={20}
                />
              }
            >
              <div className="admin-table-wrapper">
                <table className="admin-table">
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
                      <th>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {rankings
                      .filter(
                        (
                          player
                        ) =>
                          Number(
                            player.bracket
                          ) ===
                          bracket
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
                      .map(
                        (
                          player
                        ) => (
                          <tr
                            key={
                              player.id
                            }
                          >
                            <td>
                              <span className="admin-rank-badge">
                                #
                                {
                                  player.rank
                                }
                              </span>
                            </td>

                            <td>
                              <div className="admin-name-cell">
                                <div className="admin-user-avatar">
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

                            <td>
                              <ActionButtons
                                onEdit={() =>
                                  openEditModal(
                                    "ranking",
                                    player
                                  )
                                }
                                onDelete={() =>
                                  requestDelete(
                                    "ranking",
                                    player
                                  )
                                }
                              />
                            </td>
                          </tr>
                        )
                      )}
                  </tbody>
                </table>
              </div>
            </AdminTableCard>
          )
        )}
      </>
    );
  }

  function renderCommunity() {
    return (
      <>
        <section className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">
              Moderation
            </span>

            <h1>
              Manage Community
            </h1>

            <p>
              Review and moderate
              community questions.
            </p>
          </div>
        </section>

        <div className="admin-question-list">
          {questions.map(
            (question) => (
              <article
                className="admin-question-card"
                key={question.id}
              >
                <div className="admin-question-card__top">
                  <div className="admin-name-cell">
                    <div className="admin-user-avatar">
                      {getInitials(
                        question.user
                      )}
                    </div>

                    <div>
                      <strong>
                        {
                          question.user
                        }
                      </strong>

                      <span>
                        {
                          question.category
                        }{" "}
                        ·{" "}
                        {
                          question.date
                        }
                      </span>
                    </div>
                  </div>

                  <StatusBadge
                    value={
                      question.status
                    }
                  />
                </div>

                <h3>
                  {
                    question.question
                  }
                </h3>

                <p>
                  {
                    question.replies
                  }{" "}
                  replies
                </p>

                <div className="admin-card-actions">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuestionStatus(
                        question.id,
                        "Answered"
                      )
                    }
                  >
                    <Check
                      size={16}
                    />
                    Mark answered
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuestionStatus(
                        question.id,
                        "Closed"
                      )
                    }
                  >
                    <ShieldCheck
                      size={16}
                    />
                    Close
                  </button>

                  <button
                    type="button"
                    className="danger"
                    onClick={() =>
                      requestDelete(
                        "question",
                        question
                      )
                    }
                  >
                    <Trash2
                      size={16}
                    />
                    Delete
                  </button>
                </div>
              </article>
            )
          )}
        </div>
      </>
    );
  }

  function renderUsers() {
    return (
      <>
        <section className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">
              Accounts
            </span>

            <h1>
              Manage Users
            </h1>

            <p>
              This page is still
              local in this version.
            </p>
          </div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={() =>
              openAddModal("user")
            }
          >
            <Plus size={18} />
            Add user
          </button>
        </section>

        <AdminTableCard>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>
                    Division
                  </th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map(
                  (user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="admin-name-cell">
                          <div className="admin-user-avatar">
                            {getInitials(
                              user.name
                            )}
                          </div>

                          <div>
                            <strong>
                              {
                                user.name
                              }
                            </strong>

                            <span>
                              {
                                user.email
                              }
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {user.role}
                      </td>

                      <td>
                        Division{" "}
                        {
                          user.bracket
                        }{" "}
                        ·{" "}
                        {
                          BRACKET_FORMAT[
                            user.bracket
                          ]
                        }
                      </td>

                      <td>
                        <StatusBadge
                          value={
                            user.status
                          }
                        />
                      </td>

                      <td>
                        {
                          user.joined
                        }
                      </td>

                      <td>
                        <ActionButtons
                          onEdit={() =>
                            openEditModal(
                              "user",
                              user
                            )
                          }
                          onDelete={() =>
                            requestDelete(
                              "user",
                              user
                            )
                          }
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </AdminTableCard>
      </>
    );
  }

  function renderOrders() {
    return (
      <>
        <section className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">
              Sales
            </span>

            <h1>
              Manage Orders
            </h1>

            <p>
              Update payment and
              delivery status.
            </p>
          </div>
        </section>

        <AdminTableCard>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>
                    Customer
                  </th>
                  <th>Item</th>
                  <th>Total</th>
                  <th>
                    Payment
                  </th>
                  <th>
                    Delivery
                  </th>
                  <th>Date</th>
                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>
                          {
                            order.orderNumber
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          order.customer
                        }
                      </td>

                      <td>
                        {order.item} ×{" "}
                        {
                          order.quantity
                        }
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            order.total
                          )}
                        </strong>
                      </td>

                      <td>
                        <select
                          className="admin-inline-select"
                          value={
                            order.payment
                          }
                          onChange={(
                            event
                          ) =>
                            updateOrderField(
                              order.id,
                              "payment",
                              event
                                .target
                                .value
                            )
                          }
                        >
                          <option value="Pending">
                            Pending
                          </option>

                          <option value="Paid">
                            Paid
                          </option>

                          <option value="Refunded">
                            Refunded
                          </option>
                        </select>
                      </td>

                      <td>
                        <select
                          className="admin-inline-select"
                          value={
                            order.delivery
                          }
                          onChange={(
                            event
                          ) =>
                            updateOrderField(
                              order.id,
                              "delivery",
                              event
                                .target
                                .value
                            )
                          }
                        >
                          <option value="Pending">
                            Pending
                          </option>

                          <option value="Processing">
                            Processing
                          </option>

                          <option value="Shipped">
                            Shipped
                          </option>

                          <option value="Delivered">
                            Delivered
                          </option>

                          <option value="Cancelled">
                            Cancelled
                          </option>
                        </select>
                      </td>

                      <td>
                        {order.date}
                      </td>

                      <td>
                        <div className="admin-action-buttons">
                          <button
                            type="button"
                            title="View order"
                          >
                            <Eye
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            className="danger"
                            onClick={() =>
                              requestDelete(
                                "order",
                                order
                              )
                            }
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </AdminTableCard>
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <section className="admin-page-heading">
          <div>
            <span className="admin-eyebrow">
              Configuration
            </span>

            <h1>
              Shop Settings
            </h1>

            <p>
              Update shop
              preferences.
            </p>
          </div>
        </section>

        <div className="admin-settings-grid">
          <form
            className="admin-settings-card"
            onSubmit={(event) =>
              event.preventDefault()
            }
          >
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">
                  General
                </span>

                <h2>
                  Shop information
                </h2>
              </div>
            </div>

            <AdminField label="Shop name">
              <input defaultValue="STAX Card Shop" />
            </AdminField>

            <AdminField label="Shop email">
              <input
                type="email"
                defaultValue="admin@stax.com"
              />
            </AdminField>

            <AdminField label="Phone number">
              <input defaultValue="+63 912 345 6789" />
            </AdminField>

            <AdminField label="Shop address">
              <textarea
                rows="4"
                defaultValue="STAX Card Shop, Philippines"
              />
            </AdminField>

            <button
              type="submit"
              className="admin-primary-button"
            >
              Save information
            </button>
          </form>

          <form
            className="admin-settings-card"
            onSubmit={(event) =>
              event.preventDefault()
            }
          >
            <div className="admin-panel-heading">
              <div>
                <span className="admin-eyebrow">
                  Marketplace
                </span>

                <h2>
                  Order settings
                </h2>
              </div>
            </div>

            <AdminField label="Default currency">
              <select defaultValue="PHP">
                <option value="PHP">
                  PHP — Philippine Peso
                </option>

                <option value="USD">
                  USD — US Dollar
                </option>
              </select>
            </AdminField>

            <AdminField label="Order pickup">
              <select defaultValue="Enabled">
                <option>
                  Enabled
                </option>

                <option>
                  Disabled
                </option>
              </select>
            </AdminField>

            <AdminField label="Delivery">
              <select defaultValue="Enabled">
                <option>
                  Enabled
                </option>

                <option>
                  Disabled
                </option>
              </select>
            </AdminField>

            <AdminField label="Community questions">
              <select defaultValue="Enabled">
                <option>
                  Enabled
                </option>

                <option>
                  Disabled
                </option>
              </select>
            </AdminField>

            <button
              type="submit"
              className="admin-primary-button"
            >
              Save preferences
            </button>
          </form>
        </div>
      </>
    );
  }

  function renderPage() {
    switch (activePage) {
      case "cards":
        return renderCards();

      case "events":
        return renderEvents();

      case "rankings":
        return renderRankings();

      case "community":
        return renderCommunity();

      case "users":
        return renderUsers();

      case "orders":
        return renderOrders();

      case "settings":
        return renderSettings();

      default:
        return renderDashboard();
    }
  }

  const adminName =
    profile?.full_name ||
    "Admin User";

  return (
    <div className="admin-app">
      <aside
        className={`admin-sidebar ${
          sidebarOpen
            ? "is-mobile-open"
            : ""
        }`}
      >
        <div className="admin-brand">
          <div className="admin-brand__logo">
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
            className="admin-sidebar-close"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-account-card">
          <div className="admin-user-avatar">
            {getInitials(
              adminName
            )}
          </div>

          <div>
            <strong>
              {adminName}
            </strong>

            <span>
              Administrator
            </span>
          </div>
        </div>

        <nav className="admin-navigation">
          <span className="admin-navigation-label">
            Main menu
          </span>

          {navigationItems.map(
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
                </button>
              );
            }
          )}
        </nav>

        <button
          type="button"
          className="admin-logout"
          onClick={onLogout}
        >
          <LogOut size={19} />
          <span>
            Log out
          </span>
        </button>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="admin-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <div className="admin-main">
        <header className="admin-header">
          <button
            type="button"
            className="admin-mobile-menu"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            <Menu size={22} />
          </button>

          <label className="admin-header-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search current section..."
              value={
                globalSearch
              }
              onChange={(event) =>
                setGlobalSearch(
                  event.target
                    .value
                )
              }
            />
          </label>

          <div className="admin-header-actions">
            <button
              type="button"
              className="admin-header-icon"
            >
              <ClipboardList
                size={19}
              />
            </button>

            <button
              type="button"
              className="admin-profile-button"
            >
              <div className="admin-user-avatar">
                {getInitials(
                  adminName
                )}
              </div>

              <div>
                <strong>
                  {adminName}
                </strong>

                <span>
                  Administrator
                </span>
              </div>

              <ChevronDown
                size={16}
              />
            </button>
          </div>
        </header>

        <main className="admin-content">
          {renderPage()}
        </main>
      </div>

      {modal === "card" && (
        <Modal
          title={
            editingItem
              ? "Edit card"
              : "Add new card"
          }
          onClose={closeModal}
        >
          <form
            className="admin-form"
            onSubmit={saveCard}
          >
            <div className="admin-form-grid">
              <AdminField
                label="Card name"
                full
              >
                <input
                  required
                  value={
                    cardForm.name
                  }
                  onChange={(
                    event
                  ) =>
                    setCardForm({
                      ...cardForm,
                      name:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Game">
                <select
                  value={
                    cardForm.game
                  }
                  onChange={(
                    event
                  ) =>
                    setCardForm({
                      ...cardForm,
                      game:
                        event.target
                          .value,
                    })
                  }
                >
                  <option>
                    Magic
                  </option>
                  <option>
                    Pokemon
                  </option>
                  <option>
                    Yu-Gi-Oh!
                  </option>
                  <option>
                    One Piece
                  </option>
                </select>
              </AdminField>

              <AdminField label="Set name">
                <input
                  required
                  value={
                    cardForm.set
                  }
                  onChange={(
                    event
                  ) =>
                    setCardForm({
                      ...cardForm,
                      set:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Set code">
                <input
                  required
                  value={
                    cardForm.setCode
                  }
                  onChange={(
                    event
                  ) =>
                    setCardForm({
                      ...cardForm,
                      setCode:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Color identity">
                <select
                  value={
                    cardForm.colors
                  }
                  onChange={(
                    event
                  ) =>
                    setCardForm({
                      ...cardForm,
                      colors:
                        event.target
                          .value,
                    })
                  }
                >
                  {COLOR_IDENTITIES.map(
                    (color) => (
                      <option
                        key={color}
                      >
                        {color}
                      </option>
                    )
                  )}
                </select>
              </AdminField>

              <AdminField label="Rarity">
                <select
                  value={
                    cardForm.rarity
                  }
                  onChange={(
                    event
                  ) =>
                    setCardForm({
                      ...cardForm,
                      rarity:
                        event.target
                          .value,
                    })
                  }
                >
                  {RARITIES.map(
                    (rarity) => (
                      <option
                        key={
                          rarity
                        }
                      >
                        {rarity}
                      </option>
                    )
                  )}
                </select>
              </AdminField>

              <AdminField label="Finish">
                <select
                  value={
                    cardForm.finish
                  }
                  onChange={(
                    event
                  ) =>
                    setCardForm({
                      ...cardForm,
                      finish:
                        event.target
                          .value,
                    })
                  }
                >
                  {FINISHES.map(
                    (finish) => (
                      <option
                        key={
                          finish
                        }
                      >
                        {finish}
                      </option>
                    )
                  )}
                </select>
              </AdminField>

              <AdminField label="Condition">
                <select
                  value={
                    cardForm.condition
                  }
                  onChange={(
                    event
                  ) =>
                    setCardForm({
                      ...cardForm,
                      condition:
                        event.target
                          .value,
                    })
                  }
                >
                  {CONDITIONS.map(
                    (
                      condition
                    ) => (
                      <option
                        key={
                          condition
                        }
                      >
                        {
                          condition
                        }
                      </option>
                    )
                  )}
                </select>
              </AdminField>

              <AdminField label="Seller">
                <input
                  value={
                    cardForm.seller
                  }
                  onChange={(
                    event
                  ) =>
                    setCardForm({
                      ...cardForm,
                      seller:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Price">
                <input
                  required
                  type="number"
                  min="0"
                  value={
                    cardForm.price
                  }
                  onChange={(
                    event
                  ) =>
                    setCardForm({
                      ...cardForm,
                      price:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Stock">
                <input
                  required
                  type="number"
                  min="0"
                  value={
                    cardForm.stock
                  }
                  onChange={(
                    event
                  ) =>
                    setCardForm({
                      ...cardForm,
                      stock:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Status">
                <select
                  value={
                    cardForm.status
                  }
                  onChange={(
                    event
                  ) =>
                    setCardForm({
                      ...cardForm,
                      status:
                        event.target
                          .value,
                    })
                  }
                >
                  <option>
                    Available
                  </option>

                  <option>
                    Unavailable
                  </option>
                </select>
              </AdminField>

              <AdminField label="Featured card">
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      cardForm.featured
                    }
                    onChange={(
                      event
                    ) =>
                      setCardForm({
                        ...cardForm,
                        featured:
                          event.target
                            .checked,
                      })
                    }
                  />

                  Show this card as
                  featured
                </label>
              </AdminField>

              <AdminField
                label="Card photo"
                full
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={
                    handleCardImageChange
                  }
                />

                {cardImagePreview && (
                  <div className="admin-card-image-preview">
                    <img
                      src={
                        cardImagePreview
                      }
                      alt="Card preview"
                    />
                  </div>
                )}
              </AdminField>
            </div>

            <ModalFooter
              onCancel={
                closeModal
              }
              saving={
                cardSaving
              }
            />
          </form>
        </Modal>
      )}

      {modal === "event" && (
        <Modal
          title={
            editingItem
              ? "Edit event"
              : "Create event"
          }
          onClose={closeModal}
        >
          <form
            className="admin-form"
            onSubmit={saveEvent}
          >
            <div className="admin-form-grid">
              <AdminField
                label="Event title"
                full
              >
                <input
                  required
                  value={
                    eventForm.title
                  }
                  onChange={(
                    event
                  ) =>
                    setEventForm({
                      ...eventForm,
                      title:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Format">
                <select
                  value={
                    eventForm.format
                  }
                  onChange={(
                    event
                  ) =>
                    setEventForm({
                      ...eventForm,
                      format:
                        event.target
                          .value,
                    })
                  }
                >
                  {FORMATS.map(
                    (format) => (
                      <option
                        key={
                          format
                        }
                      >
                        {format}
                      </option>
                    )
                  )}
                </select>
              </AdminField>

              <AdminField label="Division">
                <select
                  value={
                    eventForm.bracket
                  }
                  onChange={(
                    event
                  ) =>
                    setEventForm({
                      ...eventForm,
                      bracket:
                        event.target
                          .value,
                    })
                  }
                >
                  <option>
                    Division 1
                  </option>
                  <option>
                    Division 2
                  </option>
                  <option>
                    Division 3
                  </option>
                  <option>
                    Division 4
                  </option>
                </select>
              </AdminField>

              <AdminField label="Date">
                <input
                  required
                  type="date"
                  value={
                    eventForm.date
                  }
                  onChange={(
                    event
                  ) =>
                    setEventForm({
                      ...eventForm,
                      date:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Time">
                <input
                  required
                  type="time"
                  value={
                    eventForm.time
                  }
                  onChange={(
                    event
                  ) =>
                    setEventForm({
                      ...eventForm,
                      time:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField
                label="Venue"
                full
              >
                <input
                  required
                  value={
                    eventForm.venue
                  }
                  onChange={(
                    event
                  ) =>
                    setEventForm({
                      ...eventForm,
                      venue:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Entry fee">
                <input
                  required
                  type="number"
                  min="0"
                  value={
                    eventForm.fee
                  }
                  onChange={(
                    event
                  ) =>
                    setEventForm({
                      ...eventForm,
                      fee:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Available slots">
                <input
                  required
                  type="number"
                  min="1"
                  value={
                    eventForm.slots
                  }
                  onChange={(
                    event
                  ) =>
                    setEventForm({
                      ...eventForm,
                      slots:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Registered players">
                <input
                  type="number"
                  min="0"
                  value={
                    eventForm.registered
                  }
                  onChange={(
                    event
                  ) =>
                    setEventForm({
                      ...eventForm,
                      registered:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Registration status">
                <select
                  value={
                    eventForm.status
                  }
                  onChange={(
                    event
                  ) =>
                    setEventForm({
                      ...eventForm,
                      status:
                        event.target
                          .value,
                    })
                  }
                >
                  <option>
                    Open
                  </option>
                  <option>
                    Full
                  </option>
                  <option>
                    Closed
                  </option>
                </select>
              </AdminField>
            </div>

            <ModalFooter
              onCancel={
                closeModal
              }
            />
          </form>
        </Modal>
      )}

      {modal === "ranking" && (
        <Modal
          title={
            editingItem
              ? "Edit player ranking"
              : "Add ranked player"
          }
          onClose={closeModal}
        >
          <form
            className="admin-form"
            onSubmit={saveRanking}
          >
            <div className="admin-form-grid">
              <AdminField
                label="Player name"
                full
              >
                <input
                  required
                  value={
                    rankingForm.name
                  }
                  onChange={(
                    event
                  ) =>
                    setRankingForm({
                      ...rankingForm,
                      name:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Division">
                <select
                  value={
                    rankingForm.bracket
                  }
                  onChange={(
                    event
                  ) =>
                    setRankingForm({
                      ...rankingForm,
                      bracket:
                        event.target
                          .value,
                    })
                  }
                >
                  <option value="1">
                    Division 1 ·
                    Standard
                  </option>
                  <option value="2">
                    Division 2 ·
                    Commander
                  </option>
                  <option value="3">
                    Division 3 ·
                    Legacy
                  </option>
                  <option value="4">
                    Division 4 ·
                    Modern
                  </option>
                </select>
              </AdminField>

              <AdminField label="Rank">
                <input
                  required
                  type="number"
                  min="1"
                  value={
                    rankingForm.rank
                  }
                  onChange={(
                    event
                  ) =>
                    setRankingForm({
                      ...rankingForm,
                      rank:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Wins">
                <input
                  required
                  type="number"
                  min="0"
                  value={
                    rankingForm.wins
                  }
                  onChange={(
                    event
                  ) =>
                    setRankingForm({
                      ...rankingForm,
                      wins:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Losses">
                <input
                  required
                  type="number"
                  min="0"
                  value={
                    rankingForm.losses
                  }
                  onChange={(
                    event
                  ) =>
                    setRankingForm({
                      ...rankingForm,
                      losses:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField
                label="Points"
                full
              >
                <input
                  required
                  type="number"
                  min="0"
                  value={
                    rankingForm.points
                  }
                  onChange={(
                    event
                  ) =>
                    setRankingForm({
                      ...rankingForm,
                      points:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>
            </div>

            <ModalFooter
              onCancel={
                closeModal
              }
            />
          </form>
        </Modal>
      )}

      {modal === "user" && (
        <Modal
          title={
            editingItem
              ? "Edit user"
              : "Add new user"
          }
          onClose={closeModal}
        >
          <form
            className="admin-form"
            onSubmit={saveUser}
          >
            <div className="admin-form-grid">
              <AdminField label="Full name">
                <input
                  required
                  value={
                    userForm.name
                  }
                  onChange={(
                    event
                  ) =>
                    setUserForm({
                      ...userForm,
                      name:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Email address">
                <input
                  required
                  type="email"
                  value={
                    userForm.email
                  }
                  onChange={(
                    event
                  ) =>
                    setUserForm({
                      ...userForm,
                      email:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>

              <AdminField label="Role">
                <select
                  value={
                    userForm.role
                  }
                  onChange={(
                    event
                  ) =>
                    setUserForm({
                      ...userForm,
                      role:
                        event.target
                          .value,
                    })
                  }
                >
                  <option>
                    Player
                  </option>

                  <option>
                    Admin
                  </option>
                </select>
              </AdminField>

              <AdminField label="Division">
                <select
                  value={
                    userForm.bracket
                  }
                  onChange={(
                    event
                  ) =>
                    setUserForm({
                      ...userForm,
                      bracket:
                        event.target
                          .value,
                    })
                  }
                >
                  <option value="1">
                    Division 1 ·
                    Standard
                  </option>

                  <option value="2">
                    Division 2 ·
                    Commander
                  </option>

                  <option value="3">
                    Division 3 ·
                    Legacy
                  </option>

                  <option value="4">
                    Division 4 ·
                    Modern
                  </option>
                </select>
              </AdminField>

              <AdminField label="Status">
                <select
                  value={
                    userForm.status
                  }
                  onChange={(
                    event
                  ) =>
                    setUserForm({
                      ...userForm,
                      status:
                        event.target
                          .value,
                    })
                  }
                >
                  <option>
                    Active
                  </option>

                  <option>
                    Suspended
                  </option>

                  <option>
                    Inactive
                  </option>
                </select>
              </AdminField>

              <AdminField label="Joined date">
                <input
                  required
                  type="date"
                  value={
                    userForm.joined
                  }
                  onChange={(
                    event
                  ) =>
                    setUserForm({
                      ...userForm,
                      joined:
                        event.target
                          .value,
                    })
                  }
                />
              </AdminField>
            </div>

            <ModalFooter
              onCancel={
                closeModal
              }
            />
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <div className="admin-modal-backdrop">
          <div className="admin-confirm-dialog">
            <div className="admin-confirm-icon">
              <Trash2
                size={23}
              />
            </div>

            <h2>
              Delete item?
            </h2>

            <p>
              This will remove{" "}
              <strong>
                {deleteTarget.item
                  .name ||
                  deleteTarget.item
                    .title ||
                  deleteTarget.item
                    .question ||
                  deleteTarget.item
                    .orderNumber ||
                  deleteTarget.item
                    .id}
              </strong>
              .
            </p>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-danger-button"
                onClick={
                  confirmDelete
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminTableCard({
  title,
  icon,
  children,
}) {
  return (
    <section className="admin-table-card">
      {title && (
        <div className="admin-panel-heading admin-table-card-heading">
          <h2>
            {title}
          </h2>

          {icon}
        </div>
      )}

      {children}
    </section>
  );
}

function StatusBadge({
  value,
}) {
  const className =
    String(value)
      .toLowerCase()
      .replaceAll(
        " ",
        "-"
      );

  return (
    <span
      className={`admin-status admin-status--${className}`}
    >
      {value}
    </span>
  );
}

function ActionButtons({
  onEdit,
  onDelete,
}) {
  return (
    <div className="admin-action-buttons">
      <button
        type="button"
        onClick={onEdit}
      >
        <Edit3
          size={16}
        />
      </button>

      <button
        type="button"
        className="danger"
        onClick={onDelete}
      >
        <Trash2
          size={16}
        />
      </button>
    </div>
  );
}

function AdminField({
  label,
  full = false,
  children,
}) {
  return (
    <label
      className={`admin-field ${
        full
          ? "admin-field--full"
          : ""
      }`}
    >
      <span>
        {label}
      </span>

      {children}
    </label>
  );
}

function Modal({
  title,
  onClose,
  children,
}) {
  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <div>
            <span className="admin-eyebrow">
              STAX Administration
            </span>

            <h2>
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            <X
              size={20}
            />
          </button>
        </div>

        <div className="admin-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

function ModalFooter({
  onCancel,
  saving = false,
}) {
  return (
    <div className="admin-modal-footer">
      <button
        type="button"
        className="admin-secondary-button"
        onClick={onCancel}
        disabled={saving}
      >
        Cancel
      </button>

      <button
        type="submit"
        className="admin-primary-button"
        disabled={saving}
      >
        {saving
          ? "Saving..."
          : "Save changes"}
      </button>
    </div>
  );
}

export default AdminApp;