export type Category =
  | "Development"
  | "Email"
  | "Entertainment"
  | "Finance"
  | "Social"
  | "Other";

export interface PasswordEntry {
  id: string;
  site: string;
  username: string;
  password: string;
  category: Category;
  url: string;
  createdAt: Date;
  sharedWith?: string[]; // TeamMember['id'][] — เพิ่มสำหรับฟีเจอร์แชร์ภายในทีม
}

export const CATEGORIES: Category[] = [
  "Development",
  "Email",
  "Entertainment",
  "Finance",
  "Social",
  "Other",
];

export const CATEGORY_STYLES: Record<Category, string> = {
  Development: "bg-violet-100 text-violet-700 border-violet-200",
  Email:       "bg-purple-100 text-purple-700 border-purple-200",
  Entertainment:"bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  Finance:     "bg-indigo-100 text-indigo-700 border-indigo-200",
  Social:      "bg-pink-100 text-pink-700 border-pink-200",
  Other:       "bg-gray-100 text-gray-600 border-gray-200",
};

export const SAMPLE_PASSWORDS: PasswordEntry[] = [
  {
    id: "1",
    site: "GitHub",
    username: "dev@example.com",
    password: "Gh#2024Secure!",
    category: "Development",
    url: "github.com",
    createdAt: new Date(),
    sharedWith: ["u1"],
  },
  {
    id: "2",
    site: "Gmail",
    username: "myemail@gmail.com",
    password: "Gm@ilP@ss99",
    category: "Email",
    url: "gmail.com",
    createdAt: new Date(),
  },
  {
    id: "3",
    site: "Netflix",
    username: "user@example.com",
    password: "N3tfl1x$tream",
    category: "Entertainment",
    url: "netflix.com",
    createdAt: new Date(),
  },
  {
    id: "4",
    site: "LINE Bank",
    username: "0812345678",
    password: "L1neBnk#2024",
    category: "Finance",
    url: "linebank.co.th",
    createdAt: new Date(),
    sharedWith: ["u1", "u2"],
  },
  {
    id: "5",
    site: "Instagram",
    username: "my_insta",
    password: "Insta@Secure1",
    category: "Social",
    url: "instagram.com",
    createdAt: new Date(),
  },
];

// ── สมาชิกทีม (สำหรับฟีเจอร์แชร์รหัสผ่านภายในทีม) ──
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  color: string; // tailwind gradient classes เช่น "from-pink-500 to-rose-500"
}

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "u1", name: "Nan", email: "nan@kmitl.ac.th", color: "from-pink-500 to-rose-500" },
  { id: "u2", name: "Ploy", email: "ploy@kmitl.ac.th", color: "from-blue-500 to-cyan-500" },
  { id: "u3", name: "Ken", email: "ken@kmitl.ac.th", color: "from-emerald-500 to-teal-500" },
  { id: "u4", name: "Mind", email: "mind@kmitl.ac.th", color: "from-amber-500 to-orange-500" },
];