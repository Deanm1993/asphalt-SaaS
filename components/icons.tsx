import {
  AlertTriangle,
  ArrowRight,
  BarChart,
  Building,
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileCheck,
  FilePlus,
  FileText,
  HardHat,
  HelpCircle,
  Info,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Package,
  Pencil,
  Phone,
  PieChart,
  PlusCircle,
  Printer,
  Search,
  Settings,
  Sliders,
  Sun,
  Thermometer,
  Trash2,
  Truck,
  Upload,
  User,
  Users,
  X,
  type LucideIcon,
  type LucideProps,
  Calculator,
  AlertCircle,
  Clipboard,
  FileUp,
  Image,
  CloudRain,
  Wind,
  ThermometerSnowflake,
  ThermometerSun,
  type Icon as LucideIconType,
  Umbrella,
  Calendar as CalendarIcon,
  BarChart as BarChartIcon,
  Ruler,
  Shovel,
  Wrench,
  Hammer,
  Forklift,
  Tractor,
  Cone,
  Gauge,
  Layers,
  Lightbulb,
  Landmark,
  CircleDollarSign,
  Receipt,
  FileBarChart,
  FileCog,
  FileImage,
  FileWarning,
  FileCheck2,
  Banknote,
  BadgeCheck,
  BadgeAlert,
  BadgePlus,
  Percent,
  Wallet,
  Scale,
  Truck as TruckIcon,
  Clipboard as ClipboardIcon,
  Warehouse,
  Leaf,
  Recycle,
  Droplets,
  Flame,
} from "lucide-react";

export type Icon = LucideIconType;

export const Icons = {
  logo: Package,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  trash: Trash2,
  sun: Sun,
  moon: Moon,
  laptop: Laptop,
  settings: Settings,
  user: User,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  twitter: Twitter,
  check: Check,
  add: PlusCircle,
  warning: AlertTriangle,
  search: Search,
  more: MoreHorizontal,
  moreVertical: MoreVertical,
  edit: Edit,
  pencil: Pencil,
  download: Download,
  upload: Upload,
  view: Eye,
  hide: EyeOff,
  mail: Mail,
  phone: Phone,
  building: Building,
  users: Users,
  dollar: DollarSign,
  calendar: Calendar,
  calendarDays: CalendarDays,
  fileText: FileText,
  fileCheck: FileCheck,
  filePlus: FilePlus,
  clock: Clock,
  mapPin: MapPin,
  truck: Truck,
  hardHat: HardHat,
  barChart: BarChart,
  pieChart: PieChart,
  info: Info,
  logout: LogOut,
  menu: Menu,
  printer: Printer,
  sliders: Sliders,
  "layout-dashboard": LayoutDashboard,
  "clipboard-list": ClipboardList,
  "map-pin": MapPin,
  "credit-card": CreditCard,
  "log-out": LogOut,
  calculator: Calculator,
  alertCircle: AlertCircle,
  alertTriangle: AlertTriangle,
  clipboard: Clipboard,
  fileUp: FileUp,
  image: Image,
  cloudRain: CloudRain,
  wind: Wind,
  thermometerSnowflake: ThermometerSnowflake,
  thermometerSun: ThermometerSun,
  umbrella: Umbrella,
  calendarIcon: CalendarIcon,
  barChartIcon: BarChartIcon,
  ruler: Ruler,
  shovel: Shovel,
  wrench: Wrench,
  hammer: Hammer,
  forklift: Forklift,
  tractor: Tractor,
  cone: Cone,
  gauge: Gauge,
  layers: Layers,
  lightbulb: Lightbulb,
  landmark: Landmark,
  circleDollarSign: CircleDollarSign,
  receipt: Receipt,
  fileBarChart: FileBarChart,
  fileCog: FileCog,
  fileImage: FileImage,
  fileWarning: FileWarning,
  fileCheck2: FileCheck2,
  banknote: Banknote,
  badgeCheck: BadgeCheck,
  badgeAlert: BadgeAlert,
  badgePlus: BadgePlus,
  percent: Percent,
  wallet: Wallet,
  scale: Scale,
  truckIcon: TruckIcon,
  clipboardIcon: ClipboardIcon,
  warehouse: Warehouse,
  leaf: Leaf,
  recycle: Recycle,
  droplets: Droplets,
  flame: Flame,
  thermometer: Thermometer,
  
  // Placeholder for any missing icons
  placeholder: (props: LucideProps) => (
    <div {...props} className="w-4 h-4 text-muted-foreground" />
  ),
};

// Fix missing imports that were referenced
function Laptop(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="4" width="18" height="12" rx="2" ry="2" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function Pizza(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
      <path d="M12 16l-5-8h10l-5 8z" />
    </svg>
  );
}

function Twitter(props: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}
