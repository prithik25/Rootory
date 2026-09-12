"use client";
import { ObservationNote } from "./observation-note";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Sprout,
  House,
  Leaf,
  Users,
  Store,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  CloudSun,
  Droplets,
  Wind,
  Search,
  Check,
  Camera,
  Heart,
  MessageCircle,
  Bookmark,
  MapPin,
  ChevronRight,
  Settings,
  Sparkles,
  Download,
  X,
  CalendarDays,
  CheckCircle2,
  ShoppingBag,
  ShieldCheck,
  Info,
  ImagePlus,
  Send,
  Trash2,
  Pencil,
  WifiOff,
  Clock3,
  Sun,
  CloudRain,
  ScanLine,
  MoreHorizontal,
  LogOut,
  CircleHelp,
  LoaderCircle,
} from "lucide-react";
import {
  type View,
  type State,
  type Plant,
  type Post,
  type Listing,
  seed,
  uid,
  day,
  age,
  dateLabel,
  pictures,
  filterListings,
} from "@/lib/data";
import { CropSafety } from "./crop-safety";
import { LiveWeather } from "./live-weather";
import { cloudInfo, backupGarden, restoreGarden } from "@/lib/cloud";
import { loadMarketplace, syncMarketplace } from "@/lib/marketplace";
import { loadCommunity, syncCommunity } from "@/lib/community";
import { privateGarden } from "@/lib/cloud-schema";
import { CloudAccount } from "./cloud-account";
import { readState, saveState, readPendingRevision } from "@/lib/storage";
import { Modal, Field, Upload, Empty, Photo } from "./primitives";
import {
  PlantForm,
  LogForm,
  PostForm,
  ListingForm,
  ReminderForm,
  EnquiryForm,
  ReportForm,
  ProfileForm,
  PlantCheck,
} from "./workflows";
type Popup = { type: string; id?: string; text?: string } | null;
const nav = [
  { id: "home", label: "Overview", icon: House },
  { id: "plants", label: "My plants", icon: Leaf },
  { id: "community", label: "Community", icon: Users },
  { id: "market", label: "Marketplace", icon: Store },
  { id: "alerts", label: "Notifications", icon: Bell },
] as const;
const titles: Record<View, string> = {
  home: "Overview",
  plants: "My plants",
  community: "Community",
  market: "Marketplace",
  alerts: "Notifications",
  check: "Plant check",
  profile: "Profile & settings",
  plans: "Rootory Plus",
};
export default function Rootory({owner = ""}: {owner?: string}) {
  const cloudRevision = useRef(0);
  const privateBaseline = useRef("");
  const communityBaseline = useRef<Post[]>([]);
  const marketplaceBaseline = useRef<{listings: Listing[]; enquiries: State["enquiries"]}>({listings:[],enquiries:[]});
  const cloudQueue = useRef(Promise.resolve());
  const scope = owner ? `account:${owner}` : "state";
  const [data, setData] = useState<State | null>(null);
  const [view, setView] = useState<View>("home");
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [modal, setModal] = useState<Popup>(null);
  const [toast, setToast] = useState("");
  const [storageError, setStorageError] = useState("");
  const [online, setOnline] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [location, setLocation] = useState("Everywhere");
  const [tab, setTab] = useState("All");
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [saved, setSaved] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;
  const notify = (text: string) => setToast(text);
  const go = (v: View) => {
    setView(v);
    setSelectedPlant(null);
    setFilter("All");
    setQuery("");
    setTab("All");
    setLocation("Everywhere");
    window.history.pushState(null, "", `#${v}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const openPlant = (id: string) => {
    go("plants");
    setSelectedPlant(id);
  };
  const update = (fn: (s: State) => State) => {
    if (owner && !loaded) { notify("Cloud records must load successfully before editing. Your cached records are available to export."); return; }
    setData((prev) => (prev ? fn(prev) : prev));
  };
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let stored = await readState(scope);
        if (owner) {
          const info = await cloudInfo();
          const remote = info ? await restoreGarden() : null;
          const pending = await readPendingRevision(scope);
          const sharedPosts = await loadCommunity(owner);
          communityBaseline.current = sharedPosts;
          const market = await loadMarketplace(owner);
          marketplaceBaseline.current = market;
          if (stored && pending !== undefined) {
            if ((stored as State & { communityVersion?: number }).communityVersion !== 1) stored = { ...stored, posts: sharedPosts, ...market };
            if ((stored as State & { marketplaceVersion?: number }).marketplaceVersion !== 1) stored = { ...stored, ...market };
            privateBaseline.current = remote ? JSON.stringify(remote.garden) : "";
            cloudRevision.current = privateBaseline.current === JSON.stringify(privateGarden(stored)) ? (info?.revision || 0) : pending;
            // Preserve unsynced local edits across reloads. The server rejects a stale revision.
          } else if (remote) {
            const base = seed();
            stored = { ...base, ...remote.garden, posts: sharedPosts, ...market };
            cloudRevision.current = remote.revision;
            privateBaseline.current = JSON.stringify(remote.garden);
          } else {
            const base = seed();
            stored = { ...base, posts: sharedPosts, ...market, plants: [], entries: [], tasks: [], notices: [], profile: { ...base.profile, name: "Grower", location: "", bio: "" } };
          }
        }
        if (!cancelled) { setData(stored || seed()); setLoaded(true); }
      } catch {
        const cached = await readState(scope).catch(() => undefined);
        if (!cancelled) {
          setData(cached || seed());
          setStorageError(owner ? "Cloud garden could not be loaded. Reconnect and reload before editing account records." : "Device storage is unavailable.");
          // Do not autosave fallback/demo data over an account after a failed load.
          setLoaded(!owner);
        }
      }
    })();
    const handleHash = () => {
      const candidate = window.location.hash.slice(1) as View;
      if (candidate in titles) {
        setView(candidate);
        setSelectedPlant(null);
        setFilter("All");
        setQuery("");
        setTab("All");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("popstate", handleHash);
    const handleNetwork = () => setOnline(navigator.onLine);
    handleNetwork();
    window.addEventListener("online", handleNetwork);
    window.addEventListener("offline", handleNetwork);
    const install = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", install);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production")
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", handleHash);
      window.removeEventListener("popstate", handleHash);
      window.removeEventListener("online", handleNetwork);
      window.removeEventListener("offline", handleNetwork);
      window.removeEventListener("beforeinstallprompt", install);
    };
  }, []);
  useEffect(() => {
    if (!data || !loaded) return;
    setSaved(false);
    const snapshot = data;
    const timer = setTimeout(() => {
      const persist = async () => {
        await saveState(snapshot, scope, owner ? cloudRevision.current : undefined);
        if (owner) {
          const privateDocument = privateGarden(snapshot);
          const fingerprint = JSON.stringify(privateDocument);
          if (privateBaseline.current !== fingerprint) {
            cloudRevision.current = await backupGarden(privateDocument, cloudRevision.current);
            privateBaseline.current = fingerprint;
          }
          await saveState(snapshot, scope, cloudRevision.current);
          await syncCommunity(communityBaseline.current, snapshot.posts, owner);
          communityBaseline.current = snapshot.posts;
          await syncMarketplace(marketplaceBaseline.current, snapshot, owner);
          marketplaceBaseline.current = { listings:snapshot.listings,enquiries:snapshot.enquiries };
          await saveState(snapshot, scope, null);
        }
      };
      cloudQueue.current = cloudQueue.current.catch(() => {}).then(persist);
      cloudQueue.current.then(() => { setSaved(true); setStorageError(""); }).catch((e) =>
        setStorageError(owner ? `Saved on this device, but cloud sync failed: ${e instanceof Error ? e.message : "Reconnect and reload."}` : "Could not save on this device. Export your records before closing."));
    }, 700);
    return () => clearTimeout(timer);
  }, [data, loaded, owner, scope]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const context = (document as any).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    Promise.resolve(
      context.registerTool(
        {
          name: "read_growing_workspace",
          description:
            "Read the current device-local Rootory plants and care reminders. Does not modify data.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: true },
          execute: (input: unknown) => {
            if (
              !input ||
              typeof input !== "object" ||
              Object.keys(input).length
            )
              throw Error("Expected an empty object.");
            const s = dataRef.current;
            return {
              mode: "device-local-demo",
              plants:
                s?.plants.map(({ id, name, crop, stage }) => ({
                  id,
                  name,
                  crop,
                  stage,
                })) || [],
              tasks: s?.tasks || [],
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch(() => {});
    return () => lifecycle.abort();
  }, []);
  if (!data)
    return (
      <div className="loading-page">
        <Sprout size={40} />
        <h1>rootory</h1>
        <p>Opening your growing world…</p>
        <LoaderCircle className="spin" />
      </div>
    );
  const unread = data.notices.filter((n) => !n.read).length;
  const plant = data.plants.find((p) => p.id === selectedPlant);
  const activeTasks = data.tasks
    .filter((t) => !t.done)
    .sort((a, b) => a.date.localeCompare(b.date));
  const initials = data.profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const completeTask = (id: string) => {
    update((s) => {
      const t = s.tasks.find((t) => t.id === id);
      if (!t || t.done) return s;
      return {
        ...s,
        tasks: s.tasks.map((x) => (x.id === id ? { ...x, done: true } : x)),
        entries: [
          {
            id: uid(),
            plantId: t.plantId,
            kind: "Care task",
            note: `Completed: ${t.title}`,
            image: "",
            date: new Date().toISOString(),
          },
          ...s.entries,
        ],
      };
    });
    notify("Care task completed and added to the timeline.");
  };
  const exportData = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "rootory-my-records.json";
    a.click();
    URL.revokeObjectURL(url);
    notify("Your records have been exported.");
  };
  const heading = (
    eyebrow: string,
    title: string,
    subtitle: string,
    action?: React.ReactNode,
  ) => (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
  const addButton = (
    <button
      className="button primary"
      onClick={() => setModal({ type: "plant" })}
    >
      <Plus size={18} />
      Add a plant
    </button>
  );
  const taskList = (tasks: typeof data.tasks) => (
    <div className="task-list">
      {tasks.length ? (
        tasks.map((t) => (
          <div className={`task-row ${t.done ? "is-done" : ""}`} key={t.id}>
            <button
              className={`task-check ${t.done ? "checked" : ""}`}
              aria-label={`Complete ${t.title}`}
              disabled={t.done}
              onClick={() => completeTask(t.id)}
            >
              {t.done ? <Check size={14} /> : <span />}
            </button>
            <button className="task-text" onClick={() => openPlant(t.plantId)}>
              <strong>{t.title}</strong>
              <small>
                {data.plants.find((p) => p.id === t.plantId)?.name || "Plant"} ·{" "}
                {dateLabel(t.date)}
              </small>
            </button>
          </div>
        ))
      ) : (
        <p className="quiet-empty">All caught up. A little room to grow.</p>
      )}
    </div>
  );
  const plantCard = (p: Plant) => (
    <article className="plant-card" key={p.id}>
      <button
        className="plant-image-button"
        onClick={() => openPlant(p.id)}
        aria-label={`Open ${p.name}`}
      >
        <Photo src={p.image} alt={p.name} className="plant-image" />
        <span className="image-label">{p.category}</span>
      </button>
      <div className="plant-card-body">
        <div className="row between">
          <button className="plain text-left" onClick={() => openPlant(p.id)}>
            <h3>{p.name}</h3>
          </button>
          <button
            className="icon-button small-icon"
            aria-label={`Log progress for ${p.name}`}
            onClick={() => setModal({ type: "log", id: p.id })}
          >
            <Plus size={17} />
          </button>
        </div>
        <p>
          <MapPin size={12} />
          {p.location || "Location not added"}
        </p>
        <div className="plant-footer">
          <span>
            <CalendarDays size={13} />
            {p.date ? `Day ${age(p.date)}` : "Date not recorded"}
          </span>
          <span className="status-badge">{p.stage}</span>
        </div>
      </div>
    </article>
  );
  const togglePost = (id: string, key: "liked" | "saved") =>
    update((s) => ({
      ...s,
      posts: s.posts.map((p) =>
        p.id !== id
          ? p
          : key === "liked"
            ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) }
            : { ...p, saved: !p.saved },
      ),
    }));
  const postCard = (p: Post, compact = false) => (
    <article className={`post-card ${compact ? "compact" : ""}`} key={p.id}>
      <div className="post-header">
        <span className="avatar earthy">
          {p.author
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </span>
        <div>
          <strong>{p.own ? data.profile.name : p.author}</strong>
          <small>
            {p.location} · {dateLabel(p.date)}
            {!p.own ? (owner ? " · Community grower" : " · Sample grower") : ""}
          </small>
        </div>
        <button
          className="icon-button borderless"
          aria-label={`Options for ${p.author}'s post`}
          onClick={() => setModal({ type: "post-options", id: p.id })}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
      <p className="post-body">{p.body}</p>
      {p.image && (
        <Photo
          src={p.image}
          alt={`${p.crop} growing progress`}
          className="post-image"
        />
      )}
      <div className="post-tags">
        <span>{p.type}</span>
        <span>#{p.crop.toLowerCase().replaceAll(" ", "")}</span>
      </div>
      <div className="post-actions">
        <button
          className={p.liked ? "liked" : ""}
          aria-label={`Like post by ${p.author}`}
          aria-pressed={p.liked}
          onClick={() => togglePost(p.id, "liked")}
        >
          <Heart size={19} fill={p.liked ? "currentColor" : "none"} />
          {p.likes}
        </button>
        <button onClick={() => setModal({ type: "comments", id: p.id })}>
          <MessageCircle size={19} />
          {p.comments.length}
          <span className="desktop-inline"> comments</span>
        </button>
        <button
          className="save-post"
          aria-label={`Save post by ${p.author}`}
          aria-pressed={p.saved}
          onClick={() => togglePost(p.id, "saved")}
        >
          <Bookmark size={19} fill={p.saved ? "currentColor" : "none"} />
        </button>
      </div>
    </article>
  );
  const listingCard = (l: Listing) => (
    <article
      className={`listing-card ${!l.available ? "unavailable" : ""}`}
      key={l.id}
    >
      <div className="listing-photo">
        <button
          onClick={() => setModal({ type: "listing-detail", id: l.id })}
          aria-label={`View ${l.title}`}
        >
          <Photo src={l.image} alt={l.title} />
        </button>
        <button
          className="bookmark-float"
          aria-label={`Save ${l.title}`}
          aria-pressed={l.saved}
          onClick={() =>
            update((s) => ({
              ...s,
              listings: s.listings.map((x) =>
                x.id === l.id ? { ...x, saved: !x.saved } : x,
              ),
            }))
          }
        >
          <Bookmark size={17} fill={l.saved ? "currentColor" : "none"} />
        </button>
        {!l.available && <span className="sold-label">Unavailable</span>}
      </div>
      <div className="listing-body">
        <span className="category-label">{l.category}</span>
        <button
          className="plain text-left"
          onClick={() => setModal({ type: "listing-detail", id: l.id })}
        >
          <h3>{l.title}</h3>
        </button>
        <div className="price">
          ₹{l.price.toLocaleString("en-IN")}
          <span> / {l.unit}</span>
        </div>
        <div className="listing-meta">
          <MapPin size={13} />
          {l.location}
          <span>·</span>
          {l.delivery}
        </div>
        <div className="seller-row">
          <span className="mini-avatar">{l.seller[0]}</span>
          <span>{l.own ? "Your listing" : l.seller}</span>
          <ChevronRight size={15} />
        </div>
      </div>
    </article>
  );
  const sampleNote = (
    <div className="inline-note">
      <Info size={16} />
      <span>
        {owner ? "Plant records sync privately. Community posts are shared with signed-in growers. Marketplace listings are shared. Submit crop observations in Alerts; nearby notices require administrator review." : "Demo workspace · Plant records stay on this device until you sign into an account. Community and marketplace are demonstrations."}
      </span>
    </div>
  );
  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar">
        <button
          className="brand plain"
          onClick={() => go("home")}
          aria-label="Rootory home"
        >
          <Sprout />
          rootory
        </button>
        <div className="workspace-label">YOUR GROWING WORLD</div>
        <nav aria-label="Main navigation">
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              className={`nav-item ${view === id ? "active" : ""}`}
              key={id}
              onClick={() => go(id)}
              aria-current={view === id ? "page" : undefined}
            >
              <Icon size={20} />
              {label}
              {id === "alerts" && unread > 0 && (
                <span className="nav-count">{unread}</span>
              )}
            </button>
          ))}
          <div className="nav-divider" />
          <button
            className={`nav-item ${view === "check" ? "active" : ""}`}
            onClick={() => go("check")}
          >
            <ScanLine size={20} />
            Plant check<span className="beta">PREVIEW</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <Sprout size={26} />
            <h3>
              A little care.
              <br />A lot of growth.
            </h3>
            <p>Make room for your next growing chapter.</p>
            <button className="text-button" onClick={() => go("plans")}>
              Explore Rootory Plus <ArrowUpRight size={15} />
            </button>
          </div>
          <button
            className={`profile-link ${view === "profile" ? "active" : ""}`}
            onClick={() => go("profile")}
          >
            <span className="avatar">{initials}</span>
            <span>
              <strong>{data.profile.name}</strong>
              <small>{data.profile.role}</small>
            </span>
            <Settings size={17} />
          </button>
        </div>
      </aside>
      <main className="main" id="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span className="desktop-inline">
              My workspace <span className="slash">/</span>
            </span>
            <span>{titles[view]}</span>
          </div>
          <div className="topbar-right">
            <button
              className="search-trigger"
              onClick={() => setModal({ type: "search" })}
            >
              <Search size={17} />
              <span>Find something…</span>
              <kbd>⌕</kbd>
            </button>
            <button
              className="icon-button borderless notification-button"
              aria-label="Open notifications"
              onClick={() => go("alerts")}
            >
              <Bell size={20} />
              {unread > 0 && <span className="notification-dot" />}
            </button>
            <button
              className="avatar profile-avatar"
              aria-label="Open profile"
              onClick={() => go("profile")}
            >
              {initials}
            </button>
          </div>
        </header>
        {!online && (
          <div className="offline-banner">
            <WifiOff size={16} />
            You’re offline. You can still update this device’s demo workspace.
          </div>
        )}
        {storageError && (
          <div className="storage-error" role="alert">
            {storageError}
          </div>
        )}
        <div className="page" key={view}>
          {view === "home" && (
            <>
              {heading(
                "A LITTLE GREENER, EVERY DAY",
                "Your growing world.",
                "Your plants, your progress, and a community to grow with.",
                addButton,
              )}
              <section className="hero-card photographic">
                <div className="hero-copy">
                  <span className="tag light">YOUR DAILY GROWING MOMENT</span>
                  <h2>
                    Make time
                    <br />
                    for a little care.
                  </h2>
                  <p>
                    {activeTasks.filter((t) => t.date <= day()).length}{" "}
                    reminders ready today. Start with one small moment.
                  </p>
                  <button
                    className="button light-button"
                    onClick={() =>
                      setModal({ type: data.plants.length ? "log" : "plant" })
                    }
                  >
                    Log today’s progress <ArrowUpRight size={18} />
                  </button>
                </div>
                <div className="hero-photo">
                  <Photo
                    src={pictures.basil}
                    alt="Fresh green basil growing in a garden"
                  />
                  <div className="photo-caption">
                    <Leaf size={16} />A little space. Endless possibility.
                  </div>
                </div>
              </section>
              <div className="stats-grid">
                <article className="stat-card">
                  <div>
                    <span>Plants in your care</span>
                    <span className="stat-icon">
                      <Leaf size={17} />
                    </span>
                  </div>
                  <strong>
                    {data.plants.length}
                    <small>plants</small>
                  </strong>
                  <p>
                    {data.plants.filter((p) => p.stage === "Growing").length}{" "}
                    growing journeys
                  </p>
                </article>
                <article className="stat-card">
                  <div>
                    <span>Care moments</span>
                    <span className="stat-icon peach">
                      <Droplets size={17} />
                    </span>
                  </div>
                  <strong>
                    {data.entries.length}
                    <small>logged</small>
                  </strong>
                  <p>Moments of care</p>
                </article>
                <article className="stat-card">
                  <div>
                    <span>Up next</span>
                    <span className="stat-icon lilac">
                      <CalendarDays size={17} />
                    </span>
                  </div>
                  <strong>
                    {activeTasks.length}
                    <small>reminders</small>
                  </strong>
                  <p>
                    {activeTasks.filter((t) => t.date <= day()).length} due
                    today
                  </p>
                </article>
              </div>
              <div className="dashboard-columns">
                <div>
                  <div className="section-title">
                    <h2>
                      Growing in your space{" "}
                      <span className="count-badge">{data.plants.length}</span>
                    </h2>
                    <button
                      className="text-button"
                      onClick={() => go("plants")}
                    >
                      View all <ArrowUpRight size={16} />
                    </button>
                  </div>
                  {data.plants.length ? (
                    <div className="plants-grid home-plants">
                      {data.plants.slice(0, 2).map(plantCard)}
                    </div>
                  ) : (
                    <Empty
                      title="A fresh start"
                      body="Add your first plant and begin its story."
                      action={addButton}
                    />
                  )}
                  <div className="section-title">
                    <h2>From the community</h2>
                    <button
                      className="text-button"
                      onClick={() => go("community")}
                    >
                      Explore <ArrowUpRight size={16} />
                    </button>
                  </div>
                  {data.posts[0] ? (
                    postCard(data.posts[0], true)
                  ) : (
                    <Empty
                      title="Your community starts here"
                      body="Share the first growing update."
                    />
                  )}
                </div>
                <aside className="dashboard-rail">
                  <section className="panel care-panel">
                    <div className="section-title">
                      <h2>A little care today</h2>
                      <span className="count-badge">
                        {activeTasks.filter((t) => t.date <= day()).length}
                      </span>
                    </div>
                    {taskList(activeTasks.slice(0, 4))}
                    <button
                      className="text-button care-footer"
                      onClick={() => setModal({ type: "reminder" })}
                    >
                      <Plus size={15} />
                      Add a reminder
                    </button>
                  </section>
                  <LiveWeather />
                  <button className="scan-promo" onClick={() => go("check")}>
                    <span className="scan-icon">
                      <ScanLine size={24} />
                    </span>
                    <div>
                      <strong>Something look different?</strong>
                      <p>Start a plant observation</p>
                    </div>
                    <ArrowUpRight size={20} />
                  </button>
                </aside>
              </div>
              {sampleNote}
            </>
          )}
          {view === "plants" && !plant && (
            <>
              {heading(
                "ONE PLANT, MANY LITTLE MOMENTS",
                "My plants.",
                "A home for every plant and its growing story.",
                addButton,
              )}
              <div className="toolbar">
                <div className="tabs" role="group" aria-label="Filter plants">
                  {["All", "Vegetable", "Herb", "Other"].map((f) => (
                    <button
                      className={filter === f ? "selected" : ""}
                      onClick={() => setFilter(f)}
                      key={f}
                    >
                      {f === "All"
                        ? "All plants"
                        : f === "Other"
                          ? "Other plants"
                          : f + "s"}
                    </button>
                  ))}
                </div>
                <div className="search-field">
                  <Search size={17} />
                  <input
                    aria-label="Search plants"
                    placeholder="Search your plants"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
              {data.plants.filter(
                (p) =>
                  (filter === "All" || p.category === filter) &&
                  `${p.name} ${p.crop}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
              ).length ? (
                <div className="plants-grid full-plants">
                  {data.plants
                    .filter(
                      (p) =>
                        (filter === "All" || p.category === filter) &&
                        `${p.name} ${p.crop}`
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                    )
                    .map(plantCard)}
                  <button
                    className="add-plant-card"
                    onClick={() => setModal({ type: "plant" })}
                  >
                    <span>
                      <Plus size={28} />
                    </span>
                    <strong>Room for one more?</strong>
                    <p>Add a plant to your growing space</p>
                  </button>
                </div>
              ) : (
                <Empty
                  title={
                    data.plants.length
                      ? "No plants found"
                      : "Your growing story starts here"
                  }
                  body={
                    data.plants.length
                      ? "Try another name or category."
                      : "Add your first plant to track its progress."
                  }
                  action={addButton}
                />
              )}
              <section className="panel reminders-section">
                <div className="section-title">
                  <h2>Care reminders</h2>
                  <button
                    className="text-button"
                    onClick={() => setModal({ type: "reminder" })}
                  >
                    <Plus size={16} />
                    Add reminder
                  </button>
                </div>
                {taskList(data.tasks)}
              </section>
              {sampleNote}
            </>
          )}
          {view === "plants" && plant && (
            <>
              <button
                className="text-button back-link"
                onClick={() => setSelectedPlant(null)}
              >
                <ArrowLeft size={17} />
                Back to my plants
              </button>
              <div className="plant-detail-hero">
                <Photo src={plant.image} alt={plant.name} />
                <div>
                  <span className="category-label">
                    {plant.category} · {plant.crop}
                  </span>
                  <h1>{plant.name}</h1>
                  <p className="muted">
                    <MapPin size={15} />
                    {plant.location || "Location not recorded"}
                  </p>
                  <div className="detail-chips">
                    <span>
                      {plant.date
                        ? `Day ${age(plant.date)}`
                        : "Planting date unknown"}
                    </span>
                    <span>{plant.setting}</span>
                    <span>{plant.quantity}</span>
                    <span>{plant.stage}</span>
                  </div>
                  <div className="row wrap">
                    <button
                      className="button primary"
                      onClick={() => setModal({ type: "log", id: plant.id })}
                    >
                      <Plus size={17} />
                      Log progress
                    </button>
                    <button
                      className="button secondary"
                      onClick={() => {
                        go("check");
                        setSelectedPlant(plant.id);
                      }}
                    >
                      <ScanLine size={17} />
                      Plant check
                    </button>
                    <button
                      className="icon-button"
                      aria-label="Edit plant"
                      onClick={() => setModal({ type: "plant", id: plant.id })}
                    >
                      <Pencil size={17} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="detail-grid">
                <section>
                  <div className="section-title">
                    <h2>The growing timeline</h2>
                    <span className="muted small">
                      {
                        data.entries.filter((e) => e.plantId === plant.id)
                          .length
                      }{" "}
                      moments
                    </span>
                  </div>
                  <div className="timeline">
                    {data.entries
                      .filter((e) => e.plantId === plant.id)
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((e) => (
                        <article className="timeline-entry" key={e.id}>
                          <span className="timeline-icon">
                            {e.kind === "Watering" ? (
                              <Droplets size={17} />
                            ) : (
                              <Leaf size={17} />
                            )}
                          </span>
                          <div className="timeline-content">
                            <div className="row between">
                              <strong>{e.kind}</strong>
                              <span className="small muted">
                                {dateLabel(e.date)}
                              </span>
                            </div>
                            <ObservationNote note={e.note}/>
                            {e.image && (
                              <Photo
                                src={e.image}
                                alt={`${plant.name} progress`}
                                className="timeline-photo"
                              />
                            )}
                            <div className="row between">
                              <button
                                className="text-button small"
                                onClick={() =>
                                  setModal({ type: "share-entry", id: e.id })
                                }
                              >
                                <Users size={14} />
                                Share with community
                              </button>
                              <button
                                className="icon-button borderless"
                                aria-label="Delete timeline entry"
                                onClick={() =>
                                  setModal({ type: "delete-entry", id: e.id })
                                }
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    {!data.entries.some((e) => e.plantId === plant.id) && (
                      <Empty
                        title="The first page is yours"
                        body="Take a photo or write a note to begin this plant’s timeline."
                      />
                    )}
                  </div>
                </section>
                <aside>
                  <section className="panel">
                    <h3>Plant details</h3>
                    <dl className="plant-facts">
                      <div>
                        <dt>Planted</dt>
                        <dd>
                          {plant.date ? dateLabel(plant.date) : "Not recorded"}
                        </dd>
                      </div>
                      <div>
                        <dt>Growing in</dt>
                        <dd>{plant.setting}</dd>
                      </div>
                      <div>
                        <dt>Soil</dt>
                        <dd>{plant.soil || "Not recorded"}</dd>
                      </div>
                      <div>
                        <dt>Health assessment</dt>
                        <dd>Not assessed</dd>
                      </div>
                    </dl>
                    <p className="small muted">
                      Growth stage is your record, not a health diagnosis.
                    </p>
                  </section>
                  <section className="panel margin-top">
                    <div className="section-title">
                      <h2>Up next</h2>
                      <button
                        className="icon-button"
                        aria-label="Add plant reminder"
                        onClick={() =>
                          setModal({ type: "reminder", id: plant.id })
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {taskList(
                      activeTasks.filter((t) => t.plantId === plant.id),
                    )}
                  </section>
                  <button
                    className="text-button danger margin-top"
                    onClick={() =>
                      setModal({ type: "delete-plant", id: plant.id })
                    }
                  >
                    <Trash2 size={15} />
                    Delete plant and its records
                  </button>
                </aside>
              </div>
            </>
          )}
          {view === "community" && (
            <>
              {heading(
                "BETTER WHEN WE GROW TOGETHER",
                "The growing circle.",
                "Small wins, honest questions, and stories from the soil.",
                <button
                  className="button primary"
                  onClick={() => setModal({ type: "post" })}
                >
                  <Plus size={18} />
                  Share an update
                </button>,
              )}
              <div className="community-layout">
                <section>
                  <button
                    className="composer"
                    onClick={() => setModal({ type: "post" })}
                  >
                    <span className="avatar">{initials}</span>
                    <span>What’s growing in your world?</span>
                    <ImagePlus size={21} />
                  </button>
                  <div className="toolbar">
                    <div className="tabs" aria-label="Community filter">
                      {[
                        "All",
                        "Progress update",
                        "Question",
                        "Harvest story",
                        "Saved",
                      ].map((f) => (
                        <button
                          className={filter === f ? "selected" : ""}
                          key={f}
                          onClick={() => setFilter(f)}
                        >
                          {f === "All"
                            ? "Latest"
                            : f === "Progress update"
                              ? "Progress"
                              : f === "Question"
                                ? "Questions"
                                : f === "Harvest story"
                                  ? "Harvests"
                                  : f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="search-field community-search">
                    <Search size={17} />
                    <input
                      aria-label="Search community"
                      placeholder="Search crops, stories, or growers"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <div className="feed">
                    {data.posts
                      .filter(
                        (p) =>
                          (filter === "All" ||
                            (filter === "Saved"
                              ? p.saved
                              : p.type === filter)) &&
                          `${p.crop} ${p.body} ${p.author}`
                            .toLowerCase()
                            .includes(query.toLowerCase()),
                      )
                      .map((p) => postCard(p))}
                    {!data.posts.some(
                      (p) =>
                        (filter === "All" ||
                          (filter === "Saved" ? p.saved : p.type === filter)) &&
                        `${p.crop} ${p.body} ${p.author}`
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                    ) && (
                      <Empty
                        title="A little quiet here"
                        body="Try another search, or share your own growing story."
                      />
                    )}
                  </div>
                </section>
                <aside className="community-rail">
                  <section className="panel">
                    <span className="circle-icon">
                      <Users size={24} />
                    </span>
                    <h2>Your kind of people.</h2>
                    <p className="muted body-copy">
                      First-time planter or lifelong farmer, there’s something
                      to learn from every growing journey.
                    </p>
                    <div className="community-values">
                      <p>
                        <CheckCircle2 size={17} />
                        Share what you’ve observed
                      </p>
                      <p>
                        <CheckCircle2 size={17} />
                        Be kind and curious
                      </p>
                      <p>
                        <CheckCircle2 size={17} />
                        Keep exact locations private
                      </p>
                    </div>
                  </section>
                  <section className="panel">
                    <h3>Explore by crop</h3>
                    <div className="crop-tags">
                      {["Tomato", "Basil", "Lettuce", "Mixed"].map((c) => (
                        <button
                          key={c}
                          className={query === c ? "selected" : ""}
                          onClick={() => {
                            setQuery(query === c ? "" : c);
                            setFilter("All");
                          }}
                        >
                          <Leaf size={14} />
                          {c}
                        </button>
                      ))}
                    </div>
                  </section>
                  <div className="inline-note">
                    <Info size={18} />
                    <span>
                      {owner ? "Posts and photos you share are visible to other signed-in growers. Community experiences are not verified agronomic advice." : "This is a local community demo. Posts remain on this device."}
                    </span>
                  </div>
                </aside>
              </div>
            </>
          )}
          {view === "market" && (
            <>
              {heading(
                "FROM ONE GROWER TO ANOTHER",
                "The local marketplace.",
                "Find a home for your harvest. Discover something to grow.",
                <button
                  className="button primary"
                  onClick={() => setModal({ type: "listing" })}
                >
                  <Plus size={18} />
                  Create listing
                </button>,
              )}
              <div className="market-banner">
                <div>
                  <span className="tag">GROWN WITH CARE</span>
                  <h2>Good things grow closer to home.</h2>
                  <p>
                    Fresh produce, new beginnings, and the people behind them.
                  </p>
                </div>
                <Photo
                  src={pictures.produce}
                  alt="A basket of colourful seasonal produce"
                />
              </div>
              <div className="toolbar">
                <div className="tabs">
                  {[
                    "All",
                    "Produce",
                    "Growing supplies",
                    "Saved",
                    "My listings",
                    "Enquiries",
                  ].map((f) => (
                    <button
                      className={tab === f ? "selected" : ""}
                      key={f}
                      onClick={() => setTab(f)}
                    >
                      {f === "All" ? "Explore all" : f}
                    </button>
                  ))}
                </div>
              </div>
              {tab !== "Enquiries" && (
                <div className="market-filters">
                  <div className="search-field">
                    <Search size={17} />
                    <input
                      aria-label="Search marketplace"
                      placeholder="Try tomatoes, basil, or a grower…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <label className="location-select">
                    <MapPin size={16} />
                    <select
                      aria-label="Filter marketplace by location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      {[
                        "Everywhere",
                        ...Array.from(
                          new Set(data.listings.map((l) => l.location)),
                        ),
                      ].map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              {tab === "Enquiries" ? (
                <section className="panel">
                  {data.enquiries.length ? (
                    data.enquiries.map((e) => (
                      <article className="enquiry-row" key={e.id}>
                        <ShoppingBag size={23} />
                        <div>
                          <strong>{e.listingTitle}</strong>
                          <p>{e.body}</p>
                          <small>
                            {dateLabel(e.date)} · {owner ? (e.direction === "received" ? `Received from ${e.senderName || "Grower"}` : "Sent to seller") : "Saved locally · Not sent"}
                          </small>
                        </div>
                      </article>
                    ))
                  ) : (
                    <Empty
                      title="Your conversations start here"
                      body={owner ? "Enquiries you send and receive appear here. Open a listing to contact its seller." : "Open a listing to try the local demo."}
                    />
                  )}
                </section>
              ) : (
                <div className="market-grid">
                  {filterListings(
                    data.listings,
                    query,
                    ["Produce", "Growing supplies"].includes(tab) ? tab : "All",
                    location,
                  )
                    .filter((l) =>
                      tab === "Saved"
                        ? l.saved
                        : tab === "My listings"
                          ? l.own
                          : true,
                    )
                    .map(listingCard)}
                  {!filterListings(
                    data.listings,
                    query,
                    ["Produce", "Growing supplies"].includes(tab) ? tab : "All",
                    location,
                  ).some((l) =>
                    tab === "Saved"
                      ? l.saved
                      : tab === "My listings"
                        ? l.own
                        : true,
                  ) && (
                    <Empty
                      title="Nothing here just yet"
                      body="Try a different filter or add a listing of your own."
                    />
                  )}
                </div>
              )}
              <div className="inline-note">
                <ShieldCheck size={18} />
                <span>
                  {owner ? "Listings are shared publicly. Enquiries are delivered privately to the seller. No payments, delivery or seller verification are provided." : "Local marketplace demo. Sign in for shared listings and seller enquiries."}
                </span>
              </div>
            </>
          )}
          {view === "alerts" && (
            <>
              {heading(
                "A LITTLE HEADS-UP",
                "Your notifications.",
                "Care reminders and updates that matter to your growing space.",
                <button
                  className="button secondary"
                  onClick={() => {
                    update((s) => ({
                      ...s,
                      notices: s.notices.map((n) => ({ ...n, read: true })),
                    }));
                    notify("All notifications marked as read.");
                  }}
                >
                  <Check size={17} />
                  Mark all read
                </button>,
              )}
              {owner && <CropSafety owner={owner} plants={data.plants} />}
              <div className="toolbar">
                <div className="tabs">
                  {[
                    "All",
                    "Unread",
                    "Care",
                    "Weather",
                    "Community",
                    ...(owner ? [] : ["Report review"]),
                  ].map((f) => (
                    <button
                      className={tab === f ? "selected" : ""}
                      key={f}
                      onClick={() => setTab(f)}
                    >
                      {f}
                      {f === "Unread" && unread > 0 ? ` (${unread})` : ""}
                    </button>
                  ))}
                </div>
              </div>
              {tab === "Report review" ? (
                <>
                  <div className="inline-note">
                    <Info size={18} />
                    <span>
                      Local review simulation. Approval demonstrates an alert in
                      this workspace; it does not verify a disease or notify
                      real farmers.
                    </span>
                  </div>
                  <button
                    className="button secondary margin-bottom"
                    onClick={() => setModal({ type: "report" })}
                  >
                    <Plus size={17} />
                    Create sample report
                  </button>
                  {data.reports.map((r) => (
                    <article className="panel report-card" key={r.id}>
                      <div className="row between">
                        <strong>
                          {r.crop} observation · {r.location}
                        </strong>
                        <span className="status-badge">{r.status}</span>
                      </div>
                      <p>{r.body}</p>
                      <small className="muted">
                        {dateLabel(r.date)} · Approximate area only
                      </small>
                      {r.status === "Pending" && (
                        <div className="row margin-top">
                          <button
                            className="button primary"
                            onClick={() => {
                              update((s) => ({
                                ...s,
                                reports: s.reports.map((x) =>
                                  x.id === r.id
                                    ? { ...x, status: "Reviewed" }
                                    : x,
                                ),
                                notices: [
                                  {
                                    id: uid(),
                                    category: "Community",
                                    title: `Sample ${r.crop.toLowerCase()} report reviewed`,
                                    body: `A ${r.crop.toLowerCase()} observation in ${r.location} has been reviewed in this demo. Inspect for similar symptoms; the cause is not confirmed. No real regional alert was sent.`,
                                    date: new Date().toISOString(),
                                    read: false,
                                  },
                                  ...s.notices,
                                ],
                              }));
                              notify(
                                "Sample report reviewed. A demo notification was created.",
                              );
                            }}
                          >
                            Review & create demo alert
                          </button>
                          <button
                            className="button secondary"
                            onClick={() =>
                              update((s) => ({
                                ...s,
                                reports: s.reports.map((x) =>
                                  x.id === r.id
                                    ? { ...x, status: "Dismissed" }
                                    : x,
                                ),
                              }))
                            }
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </>
              ) : (
                <div className="notification-list">
                  {data.notices
                    .filter(
                      (n) =>
                        tab === "All" ||
                        (tab === "Unread" ? !n.read : n.category === tab),
                    )
                    .map((n) => (
                      <article
                        className={`notification-card ${!n.read ? "unread" : ""}`}
                        key={n.id}
                      >
                        <span
                          className={`notice-icon ${n.category.toLowerCase()}`}
                        >
                          {n.category === "Care" ? (
                            <Leaf size={22} />
                          ) : n.category === "Weather" ? (
                            <CloudSun size={22} />
                          ) : (
                            <Users size={22} />
                          )}
                        </span>
                        <div>
                          <div className="row between">
                            <strong>{n.title}</strong>
                            <small className="muted">{dateLabel(n.date)}</small>
                          </div>
                          <p>{n.body}</p>
                          <div className="row">
                            <span className="category-label">{n.category}</span>
                            {n.plantId && (
                              <button
                                className="text-button small"
                                onClick={() => {
                                  update((s) => ({
                                    ...s,
                                    notices: s.notices.map((x) =>
                                      x.id === n.id ? { ...x, read: true } : x,
                                    ),
                                  }));
                                  openPlant(n.plantId!);
                                }}
                              >
                                View plant <ArrowRight size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          className="icon-button borderless"
                          aria-label={n.read ? "Mark unread" : "Mark read"}
                          onClick={() =>
                            update((s) => ({
                              ...s,
                              notices: s.notices.map((x) =>
                                x.id === n.id ? { ...x, read: !x.read } : x,
                              ),
                            }))
                          }
                        >
                          {n.read ? <Bell size={17} /> : <Check size={17} />}
                        </button>
                      </article>
                    ))}
                  {!data.notices.some(
                    (n) =>
                      tab === "All" ||
                      (tab === "Unread" ? !n.read : n.category === tab),
                  ) && (
                    <Empty
                      title="You’re all caught up"
                      body="New updates will appear here."
                    />
                  )}
                </div>
              )}
              <button
                className="text-button margin-top"
                onClick={() => go("profile")}
              >
                <Settings size={16} />
                Notification preferences
              </button>
            </>
          )}
          {view === "check" && (
            <>
              {heading(
                "LOOK CLOSER, GROW WISER",
                "Rootory Plant Check.",
                "A thoughtful starting point when something looks different.",
              )}
              <PlantCheck
                plants={data.plants}
                initialPlant={selectedPlant || undefined}
                onSave={(plantId, note, image, wholeImage) => {
                  const date = new Date().toISOString();
                  update((s) => ({
                    ...s,
                    entries: [
                      {
                        id: uid(),
                        plantId,
                        kind: "Observation",
                        note,
                        image,
                        date,
                      },
                      ...(wholeImage
                        ? [
                            {
                              id: uid(),
                              plantId,
                              kind: "Whole-plant photo",
                              note: "Context photo for the accompanying observation. This whole-plant image was not sent for AI assessment.",
                              image: wholeImage,
                              date,
                            },
                          ]
                        : []),
                      ...s.entries,
                    ],
                  }));
                  notify(
                    "Observation saved to your plant timeline.",
                  );
                  openPlant(plantId);
                }}
                onAddPlant={() => setModal({ type: "plant" })}
              />
            </>
          )}
          {view === "profile" && (
            <>
              {heading(
                "MAKE YOURSELF AT HOME",
                "Your growing profile.",
                "A few details to make this space your own.",
              )}
              <div className="profile-grid">
                <section className="panel">
                  <div className="profile-heading">
                    <span className="avatar large-avatar">{initials}</span>
                    <div>
                      <h2>{data.profile.name}</h2>
                      <p>
                        {data.profile.role} · {data.profile.location}
                      </p>
                      <span className="demo-pill">{owner ? "Account garden" : "Device-local demo"}</span>
                    </div>
                  </div>
                  <ProfileForm
                    profile={data.profile}
                    onSave={(profile) => {
                      update((s) => ({ ...s, profile }));
                      notify("Profile saved on this device.");
                    }}
                  />
                </section>
                <aside>
                  <CloudAccount automatic={Boolean(owner)} state={data} onRestore={(garden, revision) => {
                    if (revision !== undefined) cloudRevision.current = revision;
                    privateBaseline.current = JSON.stringify(garden);
                    setLoaded(true);
                    setData((s) => s ? ({ ...s, ...garden }) : s);
                    setSelectedPlant(null);
                  }} />
                  <section className="panel margin-top">
                    <h3>Your data, your choice</h3>
                    <p className="body-copy muted">
                      Records save in your browser. Use Your cloud garden above
                      to back up or restore private plant records when connected.
                    </p>
                    <button
                      className="button secondary full-width"
                      onClick={exportData}
                    >
                      <Download size={17} />
                      Export my records
                    </button>
                    <button
                      className="button secondary full-width margin-top"
                      onClick={async () => {
                        if (installPrompt) {
                          await installPrompt.prompt();
                          setInstallPrompt(null);
                        } else setModal({ type: "install" });
                      }}
                    >
                      <Download size={17} />
                      Install Rootory
                    </button>
                    <button
                      disabled={Boolean(owner)}
                      className="text-button danger margin-top"
                      onClick={() => setModal({ type: "reset" })}
                    >
                      <Trash2 size={15} />
                      Reset demo workspace
                    </button>
                  </section>
                  <section className="panel margin-top">
                    <h3>What’s connected?</h3>
                    <div className="connection-list">
                      <p>
                        <CheckCircle2 size={17} />
                        Device storage{" "}
                        <span>{saved ? "Saved" : "Saving…"}</span>
                      </p>
                      <p>
                        <Clock3 size={17} />
                        Cloud backup <span>See account panel</span>
                      </p>
                      <p>
                        <Clock3 size={17} />
                        Plant AI <span>Available after sign-in</span>
                      </p>
                      <p>
                        <Clock3 size={17} />
                        Live weather <span>Open-Meteo</span>
                      </p>
                    </div>
                  </section>
                  <button
                    className="text-button margin-top"
                    onClick={() => setModal({ type: "credits" })}
                  >
                    Photo credits <ArrowUpRight size={15} />
                  </button>
                </aside>
              </div>
            </>
          )}
          {view === "plans" && (
            <>
              {heading(
                "ROOM FOR YOUR NEXT CHAPTER",
                "Grow a little further.",
                "Simple tools now. More possibilities as your growing space expands.",
              )}
              <div className="plans-grid">
                <section className="plan-card">
                  <span className="category-label">FOR EVERY GROWER</span>
                  <h2>Rootory Free</h2>
                  <p className="plan-price">
                    ₹0<span> / always for the basics</span>
                  </p>
                  <p className="muted">Your everyday growing companion.</p>
                  <ul>
                    {[
                      "Plant profiles and progress diary",
                      "Community stories and questions",
                      "Produce and supplies listings",
                      "Essential care and local alerts",
                    ].map((t) => (
                      <li key={t}>
                        <CheckCircle2 size={18} />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="button secondary full-width"
                    onClick={() => go("plants")}
                  >
                    Continue growing <ArrowRight size={17} />
                  </button>
                </section>
                <section className="plan-card featured">
                  <span className="tag light">
                    PLANNED · NOT AVAILABLE TO PURCHASE
                  </span>
                  <h2>Rootory Plus</h2>
                  <p className="plan-price">
                    More room.
                    <br />
                    More perspective.
                  </p>
                  <p>For growing teams, nurseries, and farmer groups.</p>
                  <ul>
                    {[
                      "Multiple plots and team access",
                      "Group crop-health overview",
                      "Advanced records and reporting",
                      "Shared workflows for grower groups",
                    ].map((t) => (
                      <li key={t}>
                        <CheckCircle2 size={18} />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="button light-button full-width"
                    onClick={() => {
                      update((s) => ({
                        ...s,
                        profile: { ...s.profile, interested: true },
                      }));
                      notify(
                        "Interest saved on this device. No registration was sent.",
                      );
                    }}
                  >
                    {data.profile.interested ? (
                      <>
                        <Check size={17} />
                        Interest saved locally
                      </>
                    ) : (
                      <>
                        I’m interested <ArrowUpRight size={17} />
                      </>
                    )}
                  </button>
                  <small>
                    Pricing to be validated with growers. No payment required.
                  </small>
                </section>
              </div>
              <div className="inline-note">
                <Info size={18} />
                <span>
                  This is a subscription concept preview. Interest stays on this
                  device; no payment or signup is submitted.
                </span>
              </div>
            </>
          )}
          <footer className="page-footer">
            <span>
              <Sprout size={14} />
              Made for the way you grow.
            </span>
            <span>
              {!online ? "Offline · " : ""}
              {storageError ? "Sync needs attention" : saved ? (owner ? "Saved to your account" : "Saved on this device") : "Saving…"}
            </span>
          </footer>
        </div>
      </main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={view === id ? "active" : ""}
            onClick={() => go(id)}
            aria-label={label}
            aria-current={view === id ? "page" : undefined}
          >
            <Icon size={21} />
            <span>
              {id === "home"
                ? "Home"
                : id === "market"
                  ? "Market"
                  : id === "alerts"
                    ? "Alerts"
                    : label}
            </span>
            {id === "alerts" && unread > 0 && <i>{unread}</i>}
          </button>
        ))}
      </nav>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          <span>{toast}</span>
          <button aria-label="Dismiss message" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {modal && (
        <Modal
          title={modalTitle(modal.type)}
          description={modalDescription(modal.type, Boolean(owner))}
          onClose={() => setModal(null)}
          wide={["listing-detail", "weather", "credits"].includes(modal.type)}
        >
          {modal.type === "plant" && (
            <PlantForm
              plant={data.plants.find((p) => p.id === modal.id)}
              onSave={(p) => {
                update((s) => ({
                  ...s,
                  plants: modal.id
                    ? s.plants.map((x) => (x.id === modal.id ? p : x))
                    : [p, ...s.plants],
                }));
                setModal(null);
                notify(
                  modal.id
                    ? "Plant details updated."
                    : "Your new growing story is ready.",
                );
              }}
            />
          )}
          {modal.type === "log" && (
            <LogForm
              plants={data.plants}
              plantId={modal.id}
              onSave={(e) => {
                update((s) => ({ ...s, entries: [e, ...s.entries] }));
                setModal(null);
                notify("A new moment added to your plant’s timeline.");
              }}
            />
          )}
          {modal.type === "reminder" && (
            <ReminderForm
              plants={data.plants}
              plantId={modal.id}
              onSave={(t) => {
                update((s) => ({ ...s, tasks: [t, ...s.tasks] }));
                setModal(null);
                notify("Reminder added to your care list.");
              }}
            />
          )}
          {modal.type === "post" && (
            <PostForm
              profile={data.profile}
              onSave={(p) => {
                update((s) => ({ ...s, posts: [p, ...s.posts] }));
                setModal(null);
                notify(owner ? "Your story is being shared with the community." : "Your story was added to the demo community.");
              }}
            />
          )}
          {modal.type === "share-entry" &&
            (() => {
              const e = data.entries.find((e) => e.id === modal.id);
              const p = data.plants.find((p) => p.id === e?.plantId);
              return (
                <PostForm
                  profile={data.profile}
                  initialBody={e?.note}
                  initialImage={e?.image}
                  initialCrop={p?.crop}
                  onSave={(post) => {
                    update((s) => ({ ...s, posts: [post, ...s.posts] }));
                    setModal(null);
                    notify(owner ? "Progress is being shared with the community." : "Progress shared in the local demo community.");
                  }}
                />
              );
            })()}
          {modal.type === "listing" && (
            <ListingForm
              profile={data.profile}
              listing={data.listings.find((l) => l.id === modal.id)}
              onSave={(l) => {
                update((s) => ({
                  ...s,
                  listings: modal.id
                    ? s.listings.map((x) => (x.id === modal.id ? l : x))
                    : [l, ...s.listings],
                }));
                setModal(null);
                notify(
                  modal.id
                    ? "Listing updated."
                    : (owner ? "Listing is being published." : "Listing created in your demo marketplace."),
                );
              }}
            />
          )}
          {modal.type === "listing-detail" &&
            (() => {
              const l = data.listings.find((l) => l.id === modal.id);
              return l ? (
                <div className="listing-detail">
                  <Photo src={l.image} alt={l.title} />
                  <div>
                    <span className="category-label">{l.category}</span>
                    <h2>{l.title}</h2>
                    <div className="price">
                      ₹{l.price}
                      <span> / {l.unit}</span>
                    </div>
                    <p className="body-copy">{l.description}</p>
                    <dl className="plant-facts">
                      <div>
                        <dt>Available</dt>
                        <dd>{l.available ? l.quantity : "Unavailable"}</dd>
                      </div>
                      <div>
                        <dt>Location</dt>
                        <dd>{l.location}</dd>
                      </div>
                      <div>
                        <dt>Collection</dt>
                        <dd>{l.delivery}</dd>
                      </div>
                      <div>
                        <dt>Seller</dt>
                        <dd>{l.seller}</dd>
                      </div>
                    </dl>
                    <div className="inline-note">
                      <Info size={16} />
                      <span>
                        {l.own
                          ? (owner ? "Your listing" : "Your demo listing")
                          : "Seller and products not verified"}
                      </span>
                    </div>
                    {l.own ? (
                      <div className="row wrap">
                        <button
                          className="button primary"
                          onClick={() =>
                            setModal({ type: "listing", id: l.id })
                          }
                        >
                          <Pencil size={16} />
                          Edit listing
                        </button>
                        <button
                          className="button secondary"
                          onClick={() => {
                            update((s) => ({
                              ...s,
                              listings: s.listings.map((x) =>
                                x.id === l.id
                                  ? { ...x, available: !x.available }
                                  : x,
                              ),
                            }));
                            notify(
                              l.available
                                ? "Listing marked unavailable."
                                : "Listing marked available.",
                            );
                          }}
                        >
                          {l.available ? "Mark unavailable" : "Mark available"}
                        </button>
                      </div>
                    ) : (
                      <button
                        className="button primary full-width"
                        disabled={!l.available}
                        onClick={() => setModal({ type: "enquiry", id: l.id })}
                      >
                        <MessageCircle size={17} />
                        {owner ? "Send an enquiry" : "Save an enquiry"}
                      </button>
                    )}
                  </div>
                </div>
              ) : null;
            })()}
          {modal.type === "enquiry" && (
            <EnquiryForm
              live={Boolean(owner)}
              listing={data.listings.find((l) => l.id === modal.id)!}
              onSave={(e) => {
                update((s) => ({ ...s, enquiries: [e, ...s.enquiries] }));
                setModal(null);
                notify(owner ? "Your enquiry is being sent to the seller." : "Enquiry saved locally. No message was sent.");
              }}
            />
          )}
          {modal.type === "comments" &&
            (() => {
              const p = data.posts.find((p) => p.id === modal.id);
              return p ? (
                <div>
                  <p className="comment-original">{p.body}</p>
                  <div className="comments">
                    {p.comments.length ? (
                      p.comments.map((c) => (
                        <div className="comment" key={c.id}>
                          <span className="avatar">{c.author[0]}</span>
                          <div>
                            <strong>{c.author}</strong>
                            <p>{c.body}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="muted">Start a thoughtful conversation.</p>
                    )}
                  </div>
                  <form
                    className="comment-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const body = String(
                        new FormData(e.currentTarget).get("comment") || "",
                      ).trim();
                      if (!body) return;
                      update((s) => ({
                        ...s,
                        posts: s.posts.map((x) =>
                          x.id === p.id
                            ? {
                                ...x,
                                comments: [
                                  ...x.comments,
                                  { id: uid(), author: s.profile.name, body },
                                ],
                              }
                            : x,
                        ),
                      }));
                      e.currentTarget.reset();
                      notify("Comment added locally.");
                    }}
                  >
                    <input
                      name="comment"
                      aria-label="Your comment"
                      placeholder="Add a kind, helpful comment…"
                      maxLength={1000}
                      required
                    />
                    <button
                      className="button primary"
                      type="submit"
                      aria-label="Add comment"
                    >
                      <Send size={17} />
                    </button>
                  </form>
                </div>
              ) : null;
            })()}
          {modal.type === "post-options" && (
            <div className="stack">
              <button
                className="button secondary"
                onClick={() => {
                  togglePost(modal.id!, "saved");
                  setModal(null);
                  notify("Saved posts updated.");
                }}
              >
                <Bookmark size={17} />
                Toggle saved post
              </button>
              {data.posts.find((p) => p.id === modal.id)?.own ? (
                <button
                  className="button danger-button"
                  onClick={() =>
                    setModal({ type: "delete-post", id: modal.id })
                  }
                >
                  <Trash2 size={16} />
                  Delete my post
                </button>
              ) : (
                <button
                  className="button secondary"
                  onClick={() => setModal({ type: "flag-post", id: modal.id })}
                >
                  <ShieldCheck size={16} />
                  Report this sample post
                </button>
              )}
            </div>
          )}
          {modal.type === "flag-post" && (
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                const reason = String(
                  new FormData(e.currentTarget).get("reason"),
                );
                update((s) => ({
                  ...s,
                  notices: [
                    {
                      id: uid(),
                      category: "Community",
                      title: "Demo content report saved",
                      body: `You reported a sample post for: ${reason}. No moderation service is connected.`,
                      date: new Date().toISOString(),
                      read: false,
                    },
                    ...s.notices,
                  ],
                }));
                setModal(null);
                notify("Report saved locally for the demo.");
              }}
            >
              <Field label="Reason">
                <select name="reason">
                  <option>Misleading advice</option>
                  <option>Spam or promotion</option>
                  <option>Inappropriate content</option>
                </select>
              </Field>
              <button className="button primary">Save demo report</button>
            </form>
          )}
          {modal.type === "report" && (
            <ReportForm
              location={data.profile.location}
              onSave={(r) => {
                update((s) => ({ ...s, reports: [r, ...s.reports] }));
                setModal(null);
                notify("Sample report ready for local review.");
              }}
            />
          )}
          {modal.type === "weather" && (
            <>
              <div className="inline-note">
                <Info size={17} />
                <span>
                  Illustrative Pune forecast. Values are sample data and must
                  not guide crop treatment.
                </span>
              </div>
              <div className="forecast-grid">
                {[
                  ["Now", "27°", CloudSun],
                  ["12 PM", "29°", Sun],
                  ["3 PM", "26°", CloudRain],
                  ["6 PM", "24°", CloudRain],
                  ["9 PM", "23°", CloudSun],
                ].map(([time, temp, Icon]) => {
                  const I = Icon as typeof Sun;
                  return (
                    <div key={String(time)}>
                      <span>{String(time)}</span>
                      <I size={30} />
                      <strong>{String(temp)}</strong>
                    </div>
                  );
                })}
              </div>
              <p className="body-copy muted">
                Live weather will use your approximate location after the
                weather service is connected. Rain, wind, and humidity will be
                shown with a source and update time.
              </p>
            </>
          )}
          {modal.type === "search" && (
            <WorkspaceSearch
              data={data}
              onPlant={(id) => {
                setModal(null);
                openPlant(id);
              }}
              onListing={(id) => setModal({ type: "listing-detail", id })}
              onPost={(id) => setModal({ type: "comments", id })}
            />
          )}
          {modal.type === "install" && (
            <div className="body-copy">
              <p>
                On Chrome or Edge, look for the install icon in the address bar
                when running a production build.
              </p>
              <p>
                On iPhone, open Rootory in Safari and choose{" "}
                <strong>Share → Add to Home Screen</strong>.
              </p>
              <p className="muted">
                Installation depends on browser support. The production build
                includes the offline app shell; development mode does not
                register it.
              </p>
            </div>
          )}
          {modal.type === "credits" && (
            <div className="body-copy">
              <p>Illustrative sample photographs from Wikimedia Commons:</p>
              <ul>
                <li>
                  <a
                    href="https://commons.wikimedia.org/wiki/File:Ripe_tomato_on_tomato_plant_in_home_garden.jpg"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Tomato — Clintacc (CC0)
                  </a>
                </li>
                <li>
                  <a
                    href="https://commons.wikimedia.org/wiki/File:Basil_plant_Meadowbrook_Park.jpg"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Basil — TheTechnician27 (CC0 licensing section)
                  </a>
                </li>
                <li>
                  <a
                    href="https://commons.wikimedia.org/wiki/File:Lettuce_in_pot_with_dew.jpg"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Lettuce — 999real (CC0)
                  </a>
                </li>
                <li>
                  <a
                    href="https://commons.wikimedia.org/wiki/File:Fruit_and_vegetables_basket.jpg"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Produce — National Cancer Institute (public domain)
                  </a>
                </li>
              </ul>
              <p>
                Sample names, listings, weather, and community stories are
                illustrative. Photos are not disease reference evidence.
              </p>
            </div>
          )}
          {["delete-plant", "delete-entry", "delete-post", "reset"].includes(
            modal.type,
          ) && (
            <div className="stack">
              <p className="body-copy">
                {modal.type === "reset"
                  ? "This removes your local changes and restores the sample workspace. Export your records first if you want to keep them."
                  : modal.type === "delete-plant"
                    ? "This permanently removes the plant, its care records, and its reminders from this device. Shared posts are kept."
                    : "This removes the selected item from this device. This cannot be undone."}
              </p>
              <div className="row">
                <button
                  className="button secondary"
                  onClick={() => setModal(null)}
                >
                  Keep it
                </button>
                <button
                  className="button danger-button"
                  onClick={() => {
                    if (modal.type === "reset") {
                      setData(seed());
                      setSelectedPlant(null);
                    } else if (modal.type === "delete-plant") {
                      update((s) => ({
                        ...s,
                        plants: s.plants.filter((p) => p.id !== modal.id),
                        entries: s.entries.filter(
                          (e) => e.plantId !== modal.id,
                        ),
                        tasks: s.tasks.filter((t) => t.plantId !== modal.id),
                        notices: s.notices.filter(
                          (n) => n.plantId !== modal.id,
                        ),
                      }));
                      setSelectedPlant(null);
                    } else if (modal.type === "delete-entry")
                      update((s) => ({
                        ...s,
                        entries: s.entries.filter((e) => e.id !== modal.id),
                      }));
                    else
                      update((s) => ({
                        ...s,
                        posts: s.posts.filter((p) => p.id !== modal.id),
                      }));
                    setModal(null);
                    notify(
                      modal.type === "reset"
                        ? "Sample workspace restored."
                        : "Deleted from this device.",
                    );
                  }}
                >
                  {modal.type === "reset"
                    ? "Reset workspace"
                    : "Delete permanently"}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
function modalTitle(type: string) {
  return (
    (
      {
        plant: "A new growing story",
        log: "Capture a little progress",
        reminder: "A little reminder",
        post: "Share your growing story",
        "share-entry": "Share this moment",
        listing: "From your growing space",
        "listing-detail": "A closer look",
        enquiry: "Start with an enquiry",
        comments: "The conversation",
        "post-options": "Post options",
        "flag-post": "Report a post",
        report: "Record a local observation",
        weather: "Your growing conditions",
        search: "Find your way around",
        install: "Keep Rootory close",
        credits: "Behind the photographs",
        "delete-plant": "Delete this plant?",
        "delete-entry": "Delete this moment?",
        "delete-post": "Delete your post?",
        reset: "Start fresh?",
      } as Record<string, string>
    )[type] || "Rootory"
  );
}
function modalDescription(type: string, account = false) {
  return ["plant", "log", "reminder"].includes(type)
    ? (account ? "Private to your account. You choose what to share." : "Private to this device. You choose what to share.")
    : ["post", "share-entry", "comments", "flag-post"].includes(type)
      ? (account && type !== "flag-post" ? "Posts, comments and shared photos are visible to other signed-in growers." : "This is a local demo. Nothing is published online.")
      : ["listing", "listing-detail", "enquiry"].includes(type)
        ? (account ? "Listings are public. Enquiries are visible only to the sender and seller. No payments are processed." : "Demo marketplace. No payments or messages are sent.")
        : type === "report"
          ? "A demo observation, not a confirmed diagnosis."
          : "Your Rootory workspace";
}
function WorkspaceSearch({
  data,
  onPlant,
  onListing,
  onPost,
}: {
  data: State;
  onPlant: (id: string) => void;
  onListing: (id: string) => void;
  onPost: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const match = (s: string) =>
    q.trim().length > 0 && s.toLowerCase().includes(q.toLowerCase());
  const plants = data.plants.filter((p) => match(p.name + " " + p.crop));
  const listings = data.listings.filter((l) => match(l.title));
  const posts = data.posts.filter((p) => match(p.body + " " + p.crop));
  return (
    <>
      <div className="search-field">
        <Search size={18} />
        <input
          autoFocus
          placeholder="Search plants, produce, or stories…"
          aria-label="Search workspace"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="search-results">
        {plants.map((p) => (
          <button key={p.id} onClick={() => onPlant(p.id)}>
            <Leaf size={18} />
            <span>
              {p.name}
              <small>My plants</small>
            </span>
            <ChevronRight size={16} />
          </button>
        ))}
        {listings.map((l) => (
          <button key={l.id} onClick={() => onListing(l.id)}>
            <Store size={18} />
            <span>
              {l.title}
              <small>Marketplace</small>
            </span>
            <ChevronRight size={16} />
          </button>
        ))}
        {posts.map((p) => (
          <button key={p.id} onClick={() => onPost(p.id)}>
            <Users size={18} />
            <span>
              {p.body.slice(0, 65)}…<small>Community · {p.author}</small>
            </span>
            <ChevronRight size={16} />
          </button>
        ))}
        {q && !plants.length && !listings.length && !posts.length && (
          <p className="muted">No matches. Try a crop name like “tomato”.</p>
        )}
        {!q && <p className="muted">Try “tomato”, “basil”, or “harvest”.</p>}
      </div>
    </>
  );
}
