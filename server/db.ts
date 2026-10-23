import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Product {
  id: string;
  name: string;
  nameTe: string;
  category: string;
  categoryTe: string;
  price: number;
  unit: string;
  unitTe: string;
  inStock: boolean;
  stockCount: number;
  imageUrl: string;
  description?: string;
  descriptionTe?: string;
}

export interface TankerTier {
  id: string;
  capacityLiters: number;
  title: string;
  titleTe: string;
  basePrice: number;
  deliveryCharge: number;
  isPopular?: boolean;
  description: string;
  descriptionTe: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productNameTe: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  customerName: string;
  mobileNumber: string;
  address: string;
  landmark: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'upi' | 'store_pickup';
  status: 'pending' | 'accepted' | 'packing' | 'out_for_delivery' | 'delivered' | 'rejected';
  specialInstructions?: string;
  ownerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TankerBooking {
  id: string;
  customerName: string;
  mobileNumber: string;
  address: string;
  landmark: string;
  capacityLiters: number;
  waterType: 'drinking_ro' | 'domestic_utility';
  requiredDate: string;
  requiredTimeSlot: string;
  basePrice: number;
  deliveryCharge: number;
  totalAmount: number;
  specialInstructions?: string;
  status: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  ownerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
}

export interface ShopSettings {
  shopName: string;
  shopNameTe: string;
  tankerName: string;
  tankerNameTe: string;
  location: string;
  locationTe: string;
  phone: string;
  whatsappPhone: string;
  upiId: string;
  googleMapsUrl: string;
  minOrderForFreeDelivery: number;
  defaultShopDeliveryCharge: number;
  workingHours: string;
  workingHoursTe: string;
}

export interface DatabaseSchema {
  admin: AdminUser;
  settings: ShopSettings;
  products: Product[];
  tankerTiers: TankerTier[];
  orders: Order[];
  tankerBookings: TankerBooking[];
  activeSessions: Record<string, { adminId: string; expiresAt: number }>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.resolve(DATA_DIR, 'database.json');

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateId(prefix: string): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
}

const initialSettings: ShopSettings = {
  shopName: "Sanganapalli Shop",
  shopNameTe: "సంగనపల్లి షాప్",
  tankerName: "Srujala Water Tanker Service",
  tankerNameTe: "సృజల వాటర్ ట్యాంకర్ సర్వీస్",
  location: "Sanganapalli Village, Near Om Sakthi Temple, Chittoor/Tirupati Border",
  locationTe: "సంగనపల్లి గ్రామం, ఓం శక్తి ఆలయం సమీపంలో",
  phone: "9876543210",
  whatsappPhone: "919876543210",
  upiId: "sanganapalli.shop@upi",
  googleMapsUrl: "https://maps.google.com/?q=Om+Sakthi+Temple+Sanganapalli",
  minOrderForFreeDelivery: 300,
  defaultShopDeliveryCharge: 20,
  workingHours: "6:30 AM - 9:30 PM (Everyday)",
  workingHoursTe: "ఉదయం 6:30 నుండి రాత్రి 9:30 వరకు (ప్రతిరోజూ)",
};

const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "Sona Masoori Raw Rice (25kg Bag)",
    nameTe: "సోనా మసూరి బియ్యం (25 కేజీల బ్యాగ్)",
    category: "Rice & Grains",
    categoryTe: "బియ్యం & ధాన్యాలు",
    price: 1350,
    unit: "25kg Bag",
    unitTe: "25 కేజీ బ్యాగ్",
    inStock: true,
    stockCount: 45,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    description: "Premium aged Sona Masoori raw rice, soft and fragrant for daily home meals.",
    descriptionTe: "నాణ్యమైన పాత సోనా మసూరి బియ్యం, మృదువైన మరియు రుచికరమైన అన్నం."
  },
  {
    id: "prod-2",
    name: "Freedom Refined Sunflower Oil (1 Liter)",
    nameTe: "ఫ్రీడమ్ సన్‌ఫ్లవర్ నూనె (1 లీటర్)",
    category: "Oils & Ghee",
    categoryTe: "నూనెలు & నెయ్యి",
    price: 125,
    unit: "1 Liter Pouch",
    unitTe: "1 లీటర్ ప్యాకెట్",
    inStock: true,
    stockCount: 80,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    description: "Heart friendly refined sunflower cooking oil with Vitamin A & D.",
    descriptionTe: "విటమిన్లు సమృద్ధిగా కలిగిన వంట నూనె."
  },
  {
    id: "prod-3",
    name: "Pure Country Cow Ghee (500g Jar)",
    nameTe: "స్వచ్ఛమైన ఆవు నెయ్యి (500 గ్రాములు)",
    category: "Oils & Ghee",
    categoryTe: "నూనెలు & నెయ్యి",
    price: 340,
    unit: "500g Jar",
    unitTe: "500 గ్రా డబ్బా",
    inStock: true,
    stockCount: 20,
    imageUrl: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=600&q=80",
    description: "Traditional aromatic desi cow ghee, perfect for pooja, sweets, and meals.",
    descriptionTe: "సంప్రదాయబద్ధంగా తయారు చేసిన పరిమళభరిత స్వచ్ఛమైన ఆవు నెయ్యి."
  },
  {
    id: "prod-4",
    name: "Unpolished Toor Dal (1 kg)",
    nameTe: "నాణ్యమైన కందిపప్పు (1 కేజీ)",
    category: "Dals & Pulses",
    categoryTe: "పప్పులు",
    price: 165,
    unit: "1 kg",
    unitTe: "1 కేజీ",
    inStock: true,
    stockCount: 60,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    description: "Natural yellow toor dal for delicious Andhra Pappu and Sambar.",
    descriptionTe: "రుచికరమైన పప్పు మరియు సాంబార్ కోసం నాణ్యమైన కందిపప్పు."
  },
  {
    id: "prod-5",
    name: "Whole Urad Dal / Gundu Minapappu (1 kg)",
    nameTe: "గుండు మినపప్పు (1 కేజీ)",
    category: "Dals & Pulses",
    categoryTe: "పప్పులు",
    price: 145,
    unit: "1 kg",
    unitTe: "1 కేజీ",
    inStock: true,
    stockCount: 50,
    imageUrl: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80",
    description: "High quality white whole urad dal for fluffy Idlis and crisp Dosas.",
    descriptionTe: "మెత్తటి ఇడ్లీలు, క్రిస్పీ దోసెల కోసం శ్రేష్టమైన గుండు మినపప్పు."
  },
  {
    id: "prod-6",
    name: "Aachi Guntur Red Chilli Powder (500g)",
    nameTe: "గుంటూరు కారం పొడి (500 గ్రాములు)",
    category: "Spices & Masalas",
    categoryTe: "మసాలాలు & సుగంధాలు",
    price: 130,
    unit: "500g Packet",
    unitTe: "500 గ్రా ప్యాకెట్",
    inStock: true,
    stockCount: 75,
    imageUrl: "https://images.unsplash.com/photo-1627735489858-6938222a7f0e?auto=format&fit=crop&w=600&q=80",
    description: "Rich red colour and spicy authentic Guntur chilli powder.",
    descriptionTe: "అసలైన ఘాటు మరియు మంచి రంగునిచ్చే గుంటూరు కారం."
  },
  {
    id: "prod-7",
    name: "Pure Haldi / Turmeric Powder (250g)",
    nameTe: "పసుపు పొడి (250 గ్రాములు)",
    category: "Spices & Masalas",
    categoryTe: "మసాలాలు & సుగంధాలు",
    price: 55,
    unit: "250g Packet",
    unitTe: "250 గ్రా ప్యాకెట్",
    inStock: true,
    stockCount: 90,
    imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
    description: "Freshly ground pure golden turmeric powder with high curcumin.",
    descriptionTe: "ఔషధ గుణాలు కలిగిన స్వచ్ఛమైన పసుపు పొడి."
  },
  {
    id: "prod-8",
    name: "Tata Crystal / Iodized Salt (1 kg)",
    nameTe: "టాటా ఉప్పు (1 కేజీ)",
    category: "Spices & Masalas",
    categoryTe: "మసాలాలు & సుగంధాలు",
    price: 28,
    unit: "1 kg Packet",
    unitTe: "1 కేజీ ప్యాకెట్",
    inStock: true,
    stockCount: 120,
    imageUrl: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=600&q=80",
    description: "Desh ka namak - Iodized pure vacuum evaporated salt.",
    descriptionTe: "ఐయోడైజ్డ్ పరిశుభ్రమైన స్వచ్ఛమైన ఉప్పు."
  },
  {
    id: "prod-9",
    name: "Heritage Toned Fresh Milk (500ml)",
    nameTe: "హెరిటేజ్ తాజా పాలు (500 మి.లీ)",
    category: "Dairy & Essentials",
    categoryTe: "పాల ఉత్పత్తులు & నిత్యవసరాలు",
    price: 30,
    unit: "500ml Packet",
    unitTe: "500 మి.లీ ప్యాకెట్",
    inStock: true,
    stockCount: 40,
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
    description: "Fresh daily morning supply pasteurized toned milk.",
    descriptionTe: "ప్రతిరోజూ ఉదయం వచ్చే తాజా పాలు."
  },
  {
    id: "prod-10",
    name: "3 Roses Strong Tea Powder (250g)",
    nameTe: "త్రీ రోజెస్ టీ పొడి (250 గ్రాములు)",
    category: "Dairy & Essentials",
    categoryTe: "పాల ఉత్పత్తులు & నిత్యవసరాలు",
    price: 140,
    unit: "250g Box",
    unitTe: "250 గ్రా బాక్స్",
    inStock: true,
    stockCount: 55,
    imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    description: "Rich colour and refreshing aroma for energy filled tea.",
    descriptionTe: "అద్భుతమైన సువాసన మరియు రంగునిచ్చే టీ పొడి."
  },
  {
    id: "prod-11",
    name: "Refined White Sugar (1 kg)",
    nameTe: "చక్కెర (1 కేజీ)",
    category: "Dairy & Essentials",
    categoryTe: "పాల ఉత్పత్తులు & నిత్యవసరాలు",
    price: 46,
    unit: "1 kg",
    unitTe: "1 కేజీ",
    inStock: true,
    stockCount: 110,
    imageUrl: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=600&q=80",
    description: "Clean sparkling white sugar crystals for tea, coffee, and sweets.",
    descriptionTe: "టీ, కాఫీ, పిండివంటలకు స్వచ్ఛమైన చక్కెర."
  },
  {
    id: "prod-12",
    name: "Cycle Pure Agarbathies (Pooja Incense)",
    nameTe: "సైకిల్ ప్యూర్ అగరబత్తులు (పూజా ధూపం)",
    category: "Household & Pooja",
    categoryTe: "గృహ & పూజా సామగ్రి",
    price: 60,
    unit: "Pack of 120 sticks",
    unitTe: "120 పుల్లల ప్యాక్",
    inStock: true,
    stockCount: 65,
    imageUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
    description: "Divinely fragrant incense sticks for Om Sakthi Temple and home pooja.",
    descriptionTe: "ఓం శక్తి ఆలయం మరియు నిత్య పూజకు దివ్యమైన సుగంధ అగరబత్తులు."
  },
  {
    id: "prod-13",
    name: "Surf Excel Easy Wash Detergent Powder (1 kg)",
    nameTe: "సర్ఫ్ ఎక్సెల్ డిటర్జెంట్ పౌడర్ (1 కేజీ)",
    category: "Household & Pooja",
    categoryTe: "గృహ & పూజా సామగ్రి",
    price: 135,
    unit: "1 kg Packet",
    unitTe: "1 కేజీ ప్యాకెట్",
    inStock: true,
    stockCount: 40,
    imageUrl: "https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?auto=format&fit=crop&w=600&q=80",
    description: "Tough stain removal with pleasant fragrance for clothes.",
    descriptionTe: "దుస్తులపై మురికిని సులభంగా తొలగించే డిటర్జెంట్ పౌడర్."
  },
  {
    id: "prod-14",
    name: "Dettol Original Germ Protection Soap (Pack of 3)",
    nameTe: "డెట్టాల్ సబ్బు (3 ప్యాక్)",
    category: "Household & Pooja",
    categoryTe: "గృహ & పూజా సామగ్రి",
    price: 115,
    unit: "3 x 75g Bars",
    unitTe: "3 సబ్బుల ప్యాక్",
    inStock: true,
    stockCount: 35,
    imageUrl: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=600&q=80",
    description: "Trusted 99.9% protection from illness causing germs.",
    descriptionTe: "క్రిముల నుండి సంపూర్ణ రక్షణనిచ్చే బాతింగ్ సబ్బు."
  }
];

const initialTankerTiers: TankerTier[] = [
  {
    id: "tier-1000",
    capacityLiters: 1000,
    title: "1,000 Liters Mini Tanker",
    titleTe: "1,000 లీటర్ల మినీ ట్యాంకర్",
    basePrice: 450,
    deliveryCharge: 0,
    isPopular: false,
    description: "Ideal for small households, overhead Sintex tank top-up, or small requirements.",
    descriptionTe: "చిన్న కుటుంబాలకు, సింటెక్స్ ట్యాంక్ నింపడానికి అనుకూలం."
  },
  {
    id: "tier-2000",
    capacityLiters: 2000,
    title: "2,000 Liters Household Tanker",
    titleTe: "2,000 లీటర్ల కుటుంబ ట్యాంకర్",
    basePrice: 750,
    deliveryCharge: 0,
    isPopular: true,
    description: "Most popular size for family homes, fills standard underground sumps.",
    descriptionTe: "సాధారణ ఇళ్లకు మరియు భూగర్భ సంపులకు అత్యంత అనువైనది."
  },
  {
    id: "tier-3000",
    capacityLiters: 3000,
    title: "3,000 Liters Medium Tanker",
    titleTe: "3,000 లీటర్ల మీడియం ట్యాంకర్",
    basePrice: 1050,
    deliveryCharge: 0,
    isPopular: false,
    description: "Perfect for large joint families, cattle sheds, and farm gardens.",
    descriptionTe: "పెద్ద కుటుంబాలు, పశువుల కొట్టాలు మరియు తోటలకు తగినది."
  },
  {
    id: "tier-5000",
    capacityLiters: 5000,
    title: "5,000 Liters Jumbo Tanker",
    titleTe: "5,000 లీటర్ల జంబో ట్యాంకర్",
    basePrice: 1550,
    deliveryCharge: 50,
    isPopular: false,
    description: "High capacity tanker for village functions, marriages, farm borewell dry spells.",
    descriptionTe: "గ్రామ శుభకార్యాలు, వివాహాలు మరియు వ్యవసాయ అవసరాలకు శ్రేష్టం."
  },
  {
    id: "tier-10000",
    capacityLiters: 10000,
    title: "10,000 Liters Heavy Commercial Tanker",
    titleTe: "10,000 లీటర్ల భారీ ట్యాంకర్",
    basePrice: 2800,
    deliveryCharge: 100,
    isPopular: false,
    description: "Massive capacity for construction sites, community festivals, and agricultural lands.",
    descriptionTe: "భవన నిర్మాణాలు, ఊరి పండుగలు, పంట పొలాల కోసం."
  }
];

const initialOrders: Order[] = [
  {
    id: "ORD-SANGA-1021",
    customerName: "Ramesh Reddy",
    mobileNumber: "9440123456",
    address: "House #2-45, Main Road",
    landmark: "Behind Om Sakthi Temple",
    items: [
      {
        productId: "prod-1",
        productName: "Sona Masoori Raw Rice (25kg Bag)",
        productNameTe: "సోనా మసూరి బియ్యం (25 కేజీల బ్యాగ్)",
        price: 1350,
        quantity: 1,
        unit: "25kg Bag"
      },
      {
        productId: "prod-2",
        productName: "Freedom Refined Sunflower Oil (1 Liter)",
        productNameTe: "ఫ్రీడమ్ సన్‌ఫ్లవర్ నూనె (1 లీటర్)",
        price: 125,
        quantity: 2,
        unit: "1 Liter Pouch"
      }
    ],
    subtotal: 1600,
    deliveryCharge: 0,
    totalAmount: 1600,
    paymentMethod: "cod",
    status: "delivered",
    specialInstructions: "Please deliver before 6 PM.",
    ownerNotes: "Delivered promptly at house.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString()
  },
  {
    id: "ORD-SANGA-1022",
    customerName: "Sujatha Venkatesh",
    mobileNumber: "9848765432",
    address: "Plot 12, South Street",
    landmark: "Near Panchayat Office",
    items: [
      {
        productId: "prod-4",
        productName: "Unpolished Toor Dal (1 kg)",
        productNameTe: "నాణ్యమైన కందిపప్పు (1 కేజీ)",
        price: 165,
        quantity: 2,
        unit: "1 kg"
      },
      {
        productId: "prod-6",
        productName: "Aachi Guntur Red Chilli Powder (500g)",
        productNameTe: "గుంటూరు కారం పొడి (500 గ్రాములు)",
        price: 130,
        quantity: 1,
        unit: "500g Packet"
      },
      {
        productId: "prod-10",
        productName: "3 Roses Strong Tea Powder (250g)",
        productNameTe: "త్రీ రోజెస్ టీ పొడి (250 గ్రాములు)",
        price: 140,
        quantity: 1,
        unit: "250g Box"
      }
    ],
    subtotal: 600,
    deliveryCharge: 0,
    totalAmount: 600,
    paymentMethod: "upi",
    status: "packing",
    specialInstructions: "Call when reaching Panchayat office.",
    ownerNotes: "Packing ready, delivery boy heading out.",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  }
];

const initialTankerBookings: TankerBooking[] = [
  {
    id: "TNK-SRU-2041",
    customerName: "Venkat Rao",
    mobileNumber: "9123456789",
    address: "Sri Venkateswara Nilayam, East Mada Street",
    landmark: "200 meters from Om Sakthi Temple",
    capacityLiters: 2000,
    waterType: "drinking_ro",
    requiredDate: new Date().toISOString().split('T')[0],
    requiredTimeSlot: "Morning (07:00 AM - 10:00 AM)",
    basePrice: 750,
    deliveryCharge: 0,
    totalAmount: 750,
    specialInstructions: "Long pipe needed (around 40 feet) to reach backyard sump.",
    status: "confirmed",
    ownerNotes: "Driver Shankar assigned with Tanker AP03-T-4411.",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "TNK-SRU-2042",
    customerName: "Anji Kumar",
    mobileNumber: "9701234567",
    address: "Mango Orchard & Farm",
    landmark: "Near Sanganapalli Checkpost",
    capacityLiters: 5000,
    waterType: "domestic_utility",
    requiredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    requiredTimeSlot: "Evening (04:00 PM - 07:00 PM)",
    basePrice: 1550,
    deliveryCharge: 50,
    totalAmount: 1600,
    specialInstructions: "For drip irrigation sump and workers quarters.",
    status: "pending",
    ownerNotes: "Checked water tanker availability.",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  }
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrInit();
  }

  private loadOrInit(): DatabaseSchema {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      try {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        return {
          admin: parsed.admin || this.createDefaultAdmin(),
          settings: { ...initialSettings, ...parsed.settings },
          products: parsed.products && parsed.products.length ? parsed.products : initialProducts,
          tankerTiers: parsed.tankerTiers && parsed.tankerTiers.length ? parsed.tankerTiers : initialTankerTiers,
          orders: parsed.orders || initialOrders,
          tankerBookings: parsed.tankerBookings || initialTankerBookings,
          activeSessions: parsed.activeSessions || {},
        };
      } catch (e) {
        console.error('Failed to parse existing database.json, resetting to defaults', e);
      }
    }

    const initialDb: DatabaseSchema = {
      admin: this.createDefaultAdmin(),
      settings: initialSettings,
      products: initialProducts,
      tankerTiers: initialTankerTiers,
      orders: initialOrders,
      tankerBookings: initialTankerBookings,
      activeSessions: {},
    };

    this.saveDirect(initialDb);
    return initialDb;
  }

  private createDefaultAdmin(): AdminUser {
    const salt = crypto.randomBytes(16).toString('hex');
    const defaultPassword = 'admin'; // Owner default credentials: admin / admin
    return {
      id: 'admin-owner-sanganapalli',
      email: 'owner@sanganapallishop.com',
      passwordHash: hashPassword(defaultPassword, salt),
      salt,
      name: 'Sanganapalli Store Owner'
    };
  }

  private saveDirect(dbData: DatabaseSchema) {
    try {
      const tempPath = `${DB_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dbData, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_PATH);
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  private persist() {
    this.saveDirect(this.data);
  }

  // --- Auth methods ---
  verifyAdminPassword(password: string): boolean {
    const calculatedHash = hashPassword(password, this.data.admin.salt);
    return calculatedHash === this.data.admin.passwordHash;
  }

  changeAdminPassword(newPassword: string): void {
    const newSalt = crypto.randomBytes(16).toString('hex');
    this.data.admin.salt = newSalt;
    this.data.admin.passwordHash = hashPassword(newPassword, newSalt);
    this.data.activeSessions = {}; // invalidate all sessions
    this.persist();
  }

  createSession(): string {
    const token = generateToken();
    const expiresAt = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days
    this.data.activeSessions[token] = {
      adminId: this.data.admin.id,
      expiresAt,
    };
    this.persist();
    return token;
  }

  isValidSession(token: string | undefined): boolean {
    if (!token) return false;
    const session = this.data.activeSessions[token];
    if (!session) return false;
    if (session.expiresAt < Date.now()) {
      delete this.data.activeSessions[token];
      this.persist();
      return false;
    }
    return true;
  }

  revokeSession(token: string): void {
    if (token && this.data.activeSessions[token]) {
      delete this.data.activeSessions[token];
      this.persist();
    }
  }

  getAdminProfile() {
    return {
      id: this.data.admin.id,
      email: this.data.admin.email,
      name: this.data.admin.name,
    };
  }

  // --- Settings ---
  getSettings(): ShopSettings {
    return this.data.settings;
  }

  updateSettings(updates: Partial<ShopSettings>): ShopSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist();
    return this.data.settings;
  }

  // --- Products ---
  getProducts(): Product[] {
    return this.data.products;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  addProduct(productData: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    this.data.products.unshift(newProduct);
    this.persist();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.products[index] = { ...this.data.products[index], ...updates };
    this.persist();
    return this.data.products[index];
  }

  deleteProduct(id: string): boolean {
    const lenBefore = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    if (this.data.products.length !== lenBefore) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Tanker Tiers ---
  getTankerTiers(): TankerTier[] {
    return this.data.tankerTiers;
  }

  updateTankerTiers(tiers: TankerTier[]): TankerTier[] {
    this.data.tankerTiers = tiers;
    this.persist();
    return this.data.tankerTiers;
  }

  // --- Orders ---
  getOrders(): Order[] {
    return this.data.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id.toLowerCase() === id.toLowerCase());
  }

  createOrder(orderInput: {
    customerName: string;
    mobileNumber: string;
    address: string;
    landmark: string;
    items: OrderItem[];
    paymentMethod: 'cod' | 'upi' | 'store_pickup';
    specialInstructions?: string;
  }): Order {
    const subtotal = orderInput.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const settings = this.getSettings();
    const deliveryCharge = (subtotal >= settings.minOrderForFreeDelivery || orderInput.paymentMethod === 'store_pickup')
      ? 0
      : settings.defaultShopDeliveryCharge;
    const totalAmount = subtotal + deliveryCharge;

    const newOrder: Order = {
      id: generateId('ORD-SANGA'),
      customerName: orderInput.customerName.trim(),
      mobileNumber: orderInput.mobileNumber.trim(),
      address: orderInput.address.trim(),
      landmark: orderInput.landmark.trim(),
      items: orderInput.items,
      subtotal,
      deliveryCharge,
      totalAmount,
      paymentMethod: orderInput.paymentMethod,
      status: 'pending',
      specialInstructions: orderInput.specialInstructions?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Decrement stock if available
    for (const item of orderInput.items) {
      const prod = this.getProductById(item.productId);
      if (prod && prod.stockCount >= item.quantity) {
        prod.stockCount -= item.quantity;
        if (prod.stockCount <= 0) {
          prod.inStock = false;
        }
      }
    }

    this.data.orders.unshift(newOrder);
    this.persist();
    return newOrder;
  }

  updateOrderStatus(id: string, status: Order['status'], ownerNotes?: string): Order | null {
    const order = this.data.orders.find(o => o.id.toLowerCase() === id.toLowerCase());
    if (!order) return null;
    order.status = status;
    if (ownerNotes !== undefined) {
      order.ownerNotes = ownerNotes;
    }
    order.updatedAt = new Date().toISOString();
    this.persist();
    return order;
  }

  deleteOrder(id: string): boolean {
    const lenBefore = this.data.orders.length;
    this.data.orders = this.data.orders.filter(o => o.id.toLowerCase() !== id.toLowerCase());
    if (this.data.orders.length !== lenBefore) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Tanker Bookings ---
  getTankerBookings(): TankerBooking[] {
    return this.data.tankerBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getTankerBookingById(id: string): TankerBooking | undefined {
    return this.data.tankerBookings.find(b => b.id.toLowerCase() === id.toLowerCase());
  }

  createTankerBooking(bookingInput: {
    customerName: string;
    mobileNumber: string;
    address: string;
    landmark: string;
    capacityLiters: number;
    waterType: 'drinking_ro' | 'domestic_utility';
    requiredDate: string;
    requiredTimeSlot: string;
    specialInstructions?: string;
  }): TankerBooking {
    const tier = this.data.tankerTiers.find(t => t.capacityLiters === bookingInput.capacityLiters) || this.data.tankerTiers[0];
    const waterTypePremium = bookingInput.waterType === 'drinking_ro' ? 100 : 0;
    const basePrice = tier.basePrice + waterTypePremium;
    const deliveryCharge = tier.deliveryCharge;
    const totalAmount = basePrice + deliveryCharge;

    const newBooking: TankerBooking = {
      id: generateId('TNK-SRU'),
      customerName: bookingInput.customerName.trim(),
      mobileNumber: bookingInput.mobileNumber.trim(),
      address: bookingInput.address.trim(),
      landmark: bookingInput.landmark.trim(),
      capacityLiters: bookingInput.capacityLiters,
      waterType: bookingInput.waterType,
      requiredDate: bookingInput.requiredDate,
      requiredTimeSlot: bookingInput.requiredTimeSlot,
      basePrice,
      deliveryCharge,
      totalAmount,
      specialInstructions: bookingInput.specialInstructions?.trim() || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.tankerBookings.unshift(newBooking);
    this.persist();
    return newBooking;
  }

  updateTankerBookingStatus(id: string, status: TankerBooking['status'], ownerNotes?: string): TankerBooking | null {
    const booking = this.data.tankerBookings.find(b => b.id.toLowerCase() === id.toLowerCase());
    if (!booking) return null;
    booking.status = status;
    if (ownerNotes !== undefined) {
      booking.ownerNotes = ownerNotes;
    }
    booking.updatedAt = new Date().toISOString();
    this.persist();
    return booking;
  }

  deleteTankerBooking(id: string): boolean {
    const lenBefore = this.data.tankerBookings.length;
    this.data.tankerBookings = this.data.tankerBookings.filter(b => b.id.toLowerCase() !== id.toLowerCase());
    if (this.data.tankerBookings.length !== lenBefore) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Analytics ---
  getAnalytics() {
    const orders = this.data.orders;
    const bookings = this.data.tankerBookings;

    const shopRevenue = orders
      .filter(o => o.status !== 'rejected')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const tankerRevenue = bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const totalRevenue = shopRevenue + tankerRevenue;

    // Today's metrics
    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr) && o.status !== 'rejected');
    const todayBookings = bookings.filter(b => b.createdAt.startsWith(todayStr) && b.status !== 'cancelled');
    const todayShopSales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const todayTankerSales = todayBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    // This month metrics
    const currentMonthPrefix = todayStr.substring(0, 7);
    const monthOrders = orders.filter(o => o.createdAt.startsWith(currentMonthPrefix) && o.status !== 'rejected');
    const monthBookings = bookings.filter(b => b.createdAt.startsWith(currentMonthPrefix) && b.status !== 'cancelled');
    const monthShopSales = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const monthTankerSales = monthBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    // Unique customers aggregated
    const customerMap: Record<string, { name: string; phone: string; address: string; shopOrders: number; tankerBookings: number; totalSpent: number; lastActivity: string }> = {};

    for (const ord of orders) {
      if (!customerMap[ord.mobileNumber]) {
        customerMap[ord.mobileNumber] = {
          name: ord.customerName,
          phone: ord.mobileNumber,
          address: `${ord.address}, ${ord.landmark}`,
          shopOrders: 0,
          tankerBookings: 0,
          totalSpent: 0,
          lastActivity: ord.createdAt
        };
      }
      customerMap[ord.mobileNumber].shopOrders += 1;
      if (ord.status !== 'rejected') {
        customerMap[ord.mobileNumber].totalSpent += ord.totalAmount;
      }
      if (ord.createdAt > customerMap[ord.mobileNumber].lastActivity) {
        customerMap[ord.mobileNumber].lastActivity = ord.createdAt;
      }
    }

    for (const bkg of bookings) {
      if (!customerMap[bkg.mobileNumber]) {
        customerMap[bkg.mobileNumber] = {
          name: bkg.customerName,
          phone: bkg.mobileNumber,
          address: `${bkg.address}, ${bkg.landmark}`,
          shopOrders: 0,
          tankerBookings: 0,
          totalSpent: 0,
          lastActivity: bkg.createdAt
        };
      }
      customerMap[bkg.mobileNumber].tankerBookings += 1;
      if (bkg.status !== 'cancelled') {
        customerMap[bkg.mobileNumber].totalSpent += bkg.totalAmount;
      }
      if (bkg.createdAt > customerMap[bkg.mobileNumber].lastActivity) {
        customerMap[bkg.mobileNumber].lastActivity = bkg.createdAt;
      }
    }

    const customersList = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);

    return {
      summary: {
        totalRevenue,
        shopRevenue,
        tankerRevenue,
        totalShopOrders: orders.length,
        totalTankerBookings: bookings.length,
        pendingShopOrders: orders.filter(o => o.status === 'pending').length,
        pendingTankerBookings: bookings.filter(b => b.status === 'pending').length,
        todaySales: todayShopSales + todayTankerSales,
        todayShopSales,
        todayTankerSales,
        todayOrdersCount: todayOrders.length,
        todayBookingsCount: todayBookings.length,
        monthSales: monthShopSales + monthTankerSales,
        monthShopSales,
        monthTankerSales,
        monthOrdersCount: monthOrders.length,
        monthBookingsCount: monthBookings.length,
        totalCustomersCount: customersList.length,
      },
      customers: customersList,
    };
  }
}

export const dbManager = new DatabaseManager();
