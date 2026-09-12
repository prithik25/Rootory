export type View =
  | "home"
  | "plants"
  | "community"
  | "market"
  | "alerts"
  | "check"
  | "profile"
  | "plans";
export type Plant = {
  id: string;
  name: string;
  crop: string;
  category: string;
  date: string;
  location: string;
  setting: string;
  quantity: string;
  soil: string;
  image: string;
  stage: "Growing" | "Harvested";
};
export type Entry = {
  id: string;
  plantId: string;
  kind: string;
  note: string;
  image: string;
  date: string;
};
export type Task = {
  id: string;
  plantId: string;
  title: string;
  date: string;
  done: boolean;
};
export type Post = {
  id: string;
  author: string;
  own: boolean;
  location: string;
  crop: string;
  type: string;
  body: string;
  image: string;
  date: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: { id: string; author: string; body: string }[];
};
export type Listing = {
  id: string;
  title: string;
  category: "Produce" | "Growing supplies";
  price: number;
  unit: string;
  quantity: string;
  location: string;
  delivery: string;
  description: string;
  seller: string;
  own: boolean;
  image: string;
  available: boolean;
  saved: boolean;
};
export type Notice = {
  id: string;
  title: string;
  body: string;
  category: "Care" | "Weather" | "Community";
  date: string;
  read: boolean;
  plantId?: string;
};
export type Report = {
  id: string;
  crop: string;
  body: string;
  location: string;
  date: string;
  status: "Pending" | "Reviewed" | "Dismissed";
};
export type Enquiry = {
  direction?: "sent" | "received";
  senderName?: string;
  id: string;
  listingId: string;
  listingTitle: string;
  body: string;
  date: string;
};
export type Profile = {
  name: string;
  location: string;
  role: string;
  bio: string;
  care: boolean;
  weather: boolean;
  community: boolean;
  interested: boolean;
};
export type State = {
  version: 1;
  plants: Plant[];
  entries: Entry[];
  tasks: Task[];
  posts: Post[];
  listings: Listing[];
  notices: Notice[];
  reports: Report[];
  enquiries: Enquiry[];
  profile: Profile;
};
export const uid = () => crypto.randomUUID();
export function day(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function age(date: string) {
  return Math.max(
    0,
    Math.floor(
      (new Date(day()).getTime() - new Date(date).getTime()) / 86400000,
    ),
  );
}
export function dateLabel(date: string) {
  if (date.slice(0, 10) === day()) return "Today";
  if (date.slice(0, 10) === day(-1)) return "Yesterday";
  return new Date(
    date.length === 10 ? date + "T12:00:00" : date,
  ).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
export const pictures = {
  tomato: "/assets/tomato.webp",
  basil: "/assets/basil.webp",
  lettuce: "/assets/leafy-lettuce.webp",
  produce: "/assets/produce-basket.webp",
};
export function seed(): State {
  return {
    version: 1,
    profile: {
      name: "Demo grower",
      location: "Pune, Maharashtra",
      role: "Home gardener",
      bio: "Growing a little greener, one plant at a time.",
      care: true,
      weather: true,
      community: true,
      interested: false,
    },
    plants: [
      {
        id: "tomato",
        name: "Cherry tomato",
        crop: "Tomato",
        category: "Vegetable",
        date: day(-34),
        location: "Terrace garden",
        setting: "Grow bag",
        quantity: "3 plants",
        soil: "Potting mix",
        image: pictures.tomato,
        stage: "Growing",
      },
      {
        id: "basil",
        name: "Sweet basil",
        crop: "Basil",
        category: "Herb",
        date: day(-18),
        location: "Kitchen balcony",
        setting: "Pot",
        quantity: "2 plants",
        soil: "Not recorded",
        image: pictures.basil,
        stage: "Growing",
      },
      {
        id: "lettuce",
        name: "Little gem lettuce",
        crop: "Lettuce",
        category: "Vegetable",
        date: day(-26),
        location: "Terrace garden",
        setting: "Raised bed",
        quantity: "6 plants",
        soil: "Not recorded",
        image: pictures.lettuce,
        stage: "Growing",
      },
    ],
    entries: [
      {
        id: "e1",
        plantId: "tomato",
        kind: "Progress",
        note: "The first little tomatoes are here. Keeping a photo record as they ripen.",
        image: pictures.tomato,
        date: day(-1),
      },
      {
        id: "e2",
        plantId: "tomato",
        kind: "Watering",
        note: "Checked the soil before watering this morning.",
        image: "",
        date: day(-2),
      },
      {
        id: "e3",
        plantId: "basil",
        kind: "Progress",
        note: "New leaves opening up. Moved the pot closer to the morning light.",
        image: pictures.basil,
        date: day(-1),
      },
      {
        id: "e4",
        plantId: "lettuce",
        kind: "Progress",
        note: "Leaves are filling out nicely in the raised bed.",
        image: pictures.lettuce,
        date: day(-3),
      },
    ],
    tasks: [
      {
        id: "t1",
        plantId: "tomato",
        title: "Check soil moisture",
        date: day(),
        done: false,
      },
      {
        id: "t2",
        plantId: "basil",
        title: "Take a progress photo",
        date: day(),
        done: false,
      },
      {
        id: "t3",
        plantId: "lettuce",
        title: "Inspect the lower leaves",
        date: day(1),
        done: false,
      },
    ],
    posts: [
      {
        id: "p1",
        author: "Meera S.",
        own: false,
        location: "Pune",
        crop: "Tomato",
        type: "Progress update",
        body: "Day 34 and the first tomatoes are turning red! This started with three tiny seedlings on my terrace. What are you growing this week?",
        image: pictures.tomato,
        date: day(),
        likes: 24,
        liked: false,
        saved: false,
        comments: [
          {
            id: "c1",
            author: "Arjun K.",
            body: "That first harvest feeling is the best.",
          },
        ],
      },
      {
        id: "p2",
        author: "Arjun K.",
        own: false,
        location: "Nashik",
        crop: "Basil",
        type: "Question",
        body: "My basil is getting bushier every week. How do you keep track of which cuttings you planted first?",
        image: pictures.basil,
        date: day(-1),
        likes: 16,
        liked: false,
        saved: false,
        comments: [],
      },
      {
        id: "p3",
        author: "Nisha R.",
        own: false,
        location: "Pune",
        crop: "Mixed",
        type: "Harvest story",
        body: "A colourful little harvest, shared with neighbours. Small spaces can bring so much joy.",
        image: pictures.produce,
        date: day(-2),
        likes: 38,
        liked: false,
        saved: false,
        comments: [],
      },
    ],
    listings: [
      {
        id: "l1",
        title: "Garden-grown tomatoes",
        category: "Produce",
        price: 60,
        unit: "kg",
        quantity: "5 kg",
        location: "Pune",
        delivery: "Local pickup",
        description:
          "A sample listing for freshly harvested tomatoes. Enquire about availability and pickup before making arrangements.",
        seller: "Meera’s terrace garden",
        own: false,
        image: pictures.tomato,
        available: true,
        saved: false,
      },
      {
        id: "l2",
        title: "Basil starter plants",
        category: "Growing supplies",
        price: 80,
        unit: "plant",
        quantity: "8 plants",
        location: "Pune",
        delivery: "Local pickup",
        description:
          "A sample listing for young basil plants in nursery pots. Suitable for demonstrating a growing-supplies enquiry.",
        seller: "Green Corner Nursery",
        own: false,
        image: pictures.basil,
        available: true,
        saved: false,
      },
      {
        id: "l3",
        title: "Fresh garden lettuce",
        category: "Produce",
        price: 40,
        unit: "bunch",
        quantity: "12 bunches",
        location: "Nashik",
        delivery: "Pickup or local delivery",
        description:
          "A sample listing for freshly picked lettuce. Final quantity and collection details are confirmed with the grower.",
        seller: "Nisha’s kitchen garden",
        own: false,
        image: pictures.lettuce,
        available: true,
        saved: false,
      },
      {
        id: "l4",
        title: "Seasonal vegetable basket",
        category: "Produce",
        price: 250,
        unit: "basket",
        quantity: "4 baskets",
        location: "Pune",
        delivery: "Local pickup",
        description:
          "A sample mixed-produce basket. Contents depend on what is ready to harvest.",
        seller: "Neighbourhood Growers",
        own: false,
        image: pictures.produce,
        available: true,
        saved: false,
      },
    ],
    notices: [
      {
        id: "n1",
        title: "A moment for your tomatoes",
        body: "Your reminder: check soil moisture in the terrace garden.",
        category: "Care",
        date: day(),
        read: false,
        plantId: "tomato",
      },
      {
        id: "n2",
        title: "Rain in the example forecast",
        body: "Sample weather scenario: rain is expected this afternoon in Pune. This is not a live forecast.",
        category: "Weather",
        date: day(),
        read: false,
      },
      {
        id: "n3",
        title: "Welcome to your growing community",
        body: "Explore sample stories, or share an update from your own plants. Posts in this demo stay on this device.",
        category: "Community",
        date: day(-1),
        read: true,
      },
    ],
    reports: [
      {
        id: "r1",
        crop: "Tomato",
        body: "Sample report: spots observed on several tomato leaves. Cause not confirmed.",
        location: "Pune",
        date: day(),
        status: "Pending",
      },
    ],
    enquiries: [],
  };
}
export function filterListings(
  listings: Listing[],
  query: string,
  category: string,
  location: string,
) {
  return listings.filter(
    (l) =>
      (category === "All" || l.category === category) &&
      (location === "Everywhere" ||
        l.location.toLowerCase().includes(location.toLowerCase())) &&
      `${l.title} ${l.seller} ${l.location}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
}
