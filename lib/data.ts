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
  chilli: "/assets/chilli.webp",
  neemCake: "/assets/neem-cake.webp",
  microgreens: "/assets/microgreens.webp",
};
export function seed(): State {
  return {
    version: 1,
    profile: {
      name: "Prithik Fernandes",
      location: "Goa (Tiswadi)",
      role: "Terrace & Container Gardener",
      bio: "Cultivating organic heirloom tomatoes, culinary herbs, and local chillies in rooftop containers.",
      care: true,
      weather: true,
      community: true,
      interested: false,
    },
    plants: [
      {
        id: "tomato",
        name: "Cherry Tomato (San Marzano)",
        crop: "Tomato",
        category: "Vegetable",
        date: day(-34),
        location: "Terrace Garden",
        setting: "Grow bag (25L)",
        quantity: "3 plants",
        soil: "Red soil + Vermicompost (2:1)",
        image: pictures.tomato,
        stage: "Growing",
      },
      {
        id: "basil",
        name: "Sweet Italian Basil",
        crop: "Basil",
        category: "Herb",
        date: day(-18),
        location: "Kitchen Balcony",
        setting: "Terracotta Pot (10-inch)",
        quantity: "2 plants",
        soil: "Cocopeat + Compost mix",
        image: pictures.basil,
        stage: "Growing",
      },
      {
        id: "lettuce",
        name: "Crisp Butterhead Lettuce",
        crop: "Lettuce",
        category: "Vegetable",
        date: day(-26),
        location: "Shaded Terrace Bed",
        setting: "Raised bed",
        quantity: "6 heads",
        soil: "Aerated potting mix",
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
        note: "Checked the soil moisture before watering this morning. Root zone is draining well in the grow bag.",
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
      {
        id: "e5",
        plantId: "tomato",
        kind: "Fertilizer",
        note: "Fed with organic vermicompost tea and wood ash for potassium support during fruit development.",
        image: "",
        date: day(-5),
      },
      {
        id: "e6",
        plantId: "tomato",
        kind: "Observation",
        note: "Noticed small yellowing margins on lowest leaf branch after evening rain.\n\nAI-assisted observation (not a diagnosis): {\"visibleSymptoms\":[\"Lower leaves showing small circular brown spots with slight yellow halos\",\"Upper canopy and emerging foliage appear vibrant green and vigorous\",\"No visible stem lesions or fruit surface blemishes\"],\"possibleCauses\":[\"Early blight (Alternaria solani) - common after high humidity or rain splash\",\"Normal aging of lowermost foliage with limited light penetration\",\"Minor septoria leaf spot or localized nutrient shift\"],\"uncertainty\":\"Visual indicators only. Fungal leaf spots share visual similarities with bacterial speck and benign leaf senescence without microscopic analysis.\",\"inspectNext\":[\"Check undersides of affected leaves for fungal spore dusting\",\"Inspect stem near soil line for dark or water-soaked streaks\",\"Ensure at least 2 inches between lowest foliage and soil surface\",\"Water at root zone to prevent soil splash onto leaves\"],\"consultExpert\":\"If circular target rings spread rapidly upward past the second branch, take leaf samples to your local Krishi Vigyan Kendra (KVK) or extension officer.\",\"usableImage\":true}",
        image: pictures.tomato,
        date: day(-4),
      },
      {
        id: "e7",
        plantId: "basil",
        kind: "Harvest",
        note: "Pinched the top two sets of leaves for fresh kitchen use. This encourages bushy lateral growth!",
        image: pictures.basil,
        date: day(-4),
      },
      {
        id: "e8",
        plantId: "lettuce",
        kind: "Watering",
        note: "Deep morning watering. Soil moisture holding steady in the shaded bed.",
        image: "",
        date: day(-2),
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
      {
        id: "t4",
        plantId: "tomato",
        title: "Prune lower yellowing leaf branch",
        date: day(),
        done: false,
      },
      {
        id: "t5",
        plantId: "basil",
        title: "Pinch early flower buds",
        date: day(2),
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
        body: "Day 34: First cherry tomato cluster blushing deep red! Started from three tiny seedlings in 25L grow bags on my terrace. What are you harvesting this weekend?",
        image: pictures.tomato,
        date: day(),
        likes: 24,
        liked: false,
        saved: false,
        comments: [
          {
            id: "c1",
            author: "Arjun K.",
            body: "That first harvest feeling is the best! The color on those trusses looks amazing.",
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
        body: "Pruning question: Do you pinch out top flower buds immediately as they form on sweet basil? Noticed much sweeter, tender leaves once flowering is delayed!",
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
        body: "Sunday morning harvest basket: 2 kg vine tomatoes, crisp romaine lettuce, and fragrant herbs for neighbours. Container gardening brings so much joy.",
        image: pictures.produce,
        date: day(-2),
        likes: 38,
        liked: false,
        saved: false,
        comments: [],
      },
      {
        id: "p4",
        author: "Rohan D.",
        own: false,
        location: "Goa (Tiswadi)",
        crop: "Chilli",
        type: "Question",
        body: "Spotted flowering on my Goan Tarvoti chilli plants! What natural foliar spray do you recommend to prevent blossom drop during hot afternoon humidity?",
        image: pictures.chilli,
        date: day(-1),
        likes: 31,
        liked: false,
        saved: false,
        comments: [
          {
            id: "c2",
            author: "Prithik F.",
            body: "Diluted sour buttermilk spray (1:10 ratio with water) works wonders for fruit setting and repels mites naturally!",
          },
        ],
      },
      {
        id: "p5",
        author: "Siddharth V.",
        own: false,
        location: "Pune",
        crop: "Tomato",
        type: "Progress update",
        body: "Weekly trellising check. The indeterminate vines are already 5 feet tall in 25-liter grow bags. Swapped bamboo canes for overhead string trellising — superb stability.",
        image: pictures.tomato,
        date: day(-3),
        likes: 45,
        liked: false,
        saved: false,
        comments: [
          {
            id: "c3",
            author: "Nisha R.",
            body: "What material are you using for plant ties?",
          },
          {
            id: "c4",
            author: "Siddharth V.",
            body: "Stretchy cotton cloth strips so they don't cut into the tender stems during wind.",
          },
        ],
      },
    ],
    listings: [
      {
        id: "l1",
        title: "Fresh Vine-Ripened Cherry Tomatoes (Organic)",
        category: "Produce",
        price: 70,
        unit: "kg",
        quantity: "5 kg",
        location: "Pune",
        delivery: "Local pickup / Terrace collection",
        description:
          "Naturally sweet, organic heirloom cherry tomatoes harvested fresh on pickup day. Grown without synthetic sprays or chemical boosters.",
        seller: "Prithik’s Rooftop Garden",
        own: false,
        image: pictures.tomato,
        available: true,
        saved: false,
      },
      {
        id: "l2",
        title: "Genovese Basil Starter Plants",
        category: "Growing supplies",
        price: 80,
        unit: "pot",
        quantity: "8 pots",
        location: "Pune",
        delivery: "Local pickup",
        description:
          "Vigorous sweet basil saplings in 5-inch nursery pots with rich vermicompost. Multi-stemmed, hardened off, and ready for kitchen windowsill harvesting.",
        seller: "Green Corner Nursery",
        own: false,
        image: pictures.basil,
        available: true,
        saved: false,
      },
      {
        id: "l3",
        title: "Hydro-Washed Butterhead Lettuce",
        category: "Produce",
        price: 45,
        unit: "head",
        quantity: "12 heads",
        location: "Nashik",
        delivery: "Morning local pickup",
        description:
          "Crisp, sweet butterhead lettuce harvested early morning from our raised garden beds. Washed and chilled for immediate salad use.",
        seller: "Nisha’s kitchen garden",
        own: false,
        image: pictures.lettuce,
        available: true,
        saved: false,
      },
      {
        id: "l4",
        title: "Weekend Farm-to-Table Veggie Crate",
        category: "Produce",
        price: 250,
        unit: "crate",
        quantity: "4 crates",
        location: "Pune",
        delivery: "Local pickup",
        description:
          "Curated weekend harvest: 500g cherry tomatoes, 2 heads fresh lettuce, bundled sweet basil, and seasonal green chillies.",
        seller: "Neighbourhood Growers Co-op",
        own: false,
        image: pictures.produce,
        available: true,
        saved: false,
      },
      {
        id: "l5",
        title: "Cold-Pressed Organic Neem Seed Cake (5 kg)",
        category: "Growing supplies",
        price: 150,
        unit: "bag",
        quantity: "10 bags",
        location: "Pune",
        delivery: "Local pickup or courier",
        description:
          "100% natural cold-pressed neem cake powder. Enriches soil organic nitrogen while acting as an effective organic root nematode deterrent.",
        seller: "BioEarth Organic Supplies",
        own: false,
        image: pictures.neemCake,
        available: true,
        saved: false,
      },
      {
        id: "l6",
        title: "Fresh Microgreens & Baby Salad Mix (250g)",
        category: "Produce",
        price: 60,
        unit: "pack",
        quantity: "8 packs",
        location: "Goa (Panaji)",
        delivery: "Pickup in Panaji / Miramar",
        description:
          "Nutrient-dense mix of baby arugula, tender amaranth, and sweet microgreens. Harvested fresh on order day from living trays.",
        seller: "Goa Coastal Greens",
        own: false,
        image: pictures.microgreens,
        available: true,
        saved: false,
      },
    ],
    notices: [
      {
        id: "n1",
        title: "Tomato Care: Morning soil moisture check",
        body: "Surface soil looks dry under yesterday's sun. Check moisture 2 inches down before irrigating.",
        category: "Care",
        date: day(),
        read: false,
        plantId: "tomato",
      },
      {
        id: "n2",
        title: "Weather Alert: Afternoon showers forecast",
        body: "65% probability of localized showers after 3 PM. Hold off on scheduled liquid fertilizer feeding.",
        category: "Weather",
        date: day(),
        read: false,
      },
      {
        id: "n3",
        title: "Community: Rohan replied to your chilli question",
        body: "Rohan D.: 'Great tip on string trellising! Trying it with my cherry tomatoes this season.'",
        category: "Community",
        date: day(-2),
        read: true,
      },
      {
        id: "n4",
        title: "Basil Care: Pinch early flower spikes",
        body: "Pinch top flower buds on your sweet basil to extend foliage production and prevent leaf bitterness.",
        category: "Care",
        date: day(),
        read: false,
        plantId: "basil",
      },
      {
        id: "n5",
        title: "Lettuce Check: Lift lower leaves from damp soil",
        body: "After recent precipitation, verify lowest lettuce leaves are lifted off damp soil to deter bottom rot.",
        category: "Care",
        date: day(-1),
        read: false,
        plantId: "lettuce",
      },
      {
        id: "n6",
        title: "Weather Notice: High humidity warning (85%)",
        body: "Warm, humid conditions forecast today. Ensure good spacing between containers for breezy cross-ventilation.",
        category: "Weather",
        date: day(),
        read: false,
      },
      {
        id: "n7",
        title: "Weather Advisory: Peak midday heat (34°C)",
        body: "Solar intensity will peak between 12 PM and 3 PM. Provide light shade cloth or misting for sensitive leafy containers.",
        category: "Weather",
        date: day(-1),
        read: true,
      },
      {
        id: "n8",
        title: "Crop Safety Alert: Early blight observed nearby",
        body: "A nearby grower reported concentric brown rings on tomatoes within 8 km. Inspect lower leaves for yellow halos.",
        category: "Community",
        date: day(),
        read: false,
      },
      {
        id: "n9",
        title: "Marketplace: New enquiry on 'Cherry Tomatoes'",
        body: "Kavita Deshmukh sent an enquiry: 'Are 2 kg still available for pickup this evening?' View in Marketplace enquiries.",
        category: "Community",
        date: day(-1),
        read: true,
      },
    ],
    reports: [
      {
        id: "r1",
        crop: "Tomato",
        body: "Target-like concentric brown spots observed on 3 lower branches of indeterminate tomatoes following 3 days of high humidity. Upper growth remains healthy.",
        location: "Pune",
        date: day(),
        status: "Pending",
      },
      {
        id: "r2",
        crop: "Basil",
        body: "Downward leaf cupping with slight silvering on leaf tops. Suspected thrips activity during hot dry spell.",
        location: "Goa (Tiswadi)",
        date: day(-1),
        status: "Pending",
      },
    ],
    enquiries: [
      {
        id: "enq1",
        direction: "received",
        senderName: "Kavita Deshmukh",
        listingId: "l1",
        listingTitle: "Fresh Vine-Ripened Cherry Tomatoes (Organic)",
        body: "Hi! Are 2 kg still available for pickup this evening around 6:30 PM? Can bring my own cloth bag.",
        date: day(),
      },
      {
        id: "enq2",
        direction: "sent",
        listingId: "l2",
        listingTitle: "Genovese Basil Starter Plants",
        body: "Hello! Are these grown from seed or stem cuttings? Would love to pick up 2 pots for my kitchen windowsill.",
        date: day(-1),
      },
    ],
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
