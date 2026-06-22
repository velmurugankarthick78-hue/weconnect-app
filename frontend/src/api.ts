import { storage } from "@/src/utils/storage";

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
export const TOKEN_KEY = "we_connect_admin_token";

export type Business = {
  id: string;
  businessName: string;
  category: string;
  ownerName: string;
  mobileNumber: string;
  whatsappNumber?: string | null;
  address: string;
  city?: string;
  district: string;
  googleMapsLink?: string | null;
  imageUrl?: string | null;
  description?: string;
  rating?: number;
  createdAt?: string;
};

export type Category = {
  key: string;
  label: string;
  icon: string;
  imageUrl: string;
};

export type BusinessPayload = {
  businessName: string;
  category: string;
  ownerName: string;
  mobileNumber: string;
  whatsappNumber?: string | null;
  address: string;
  city?: string;
  district: string;
  googleMapsLink?: string | null;
  imageUrl?: string | null;
  description?: string;
};

async function authHeaders(): Promise<Record<string, string>> {
  const token = await storage.secureGet<string>(TOKEN_KEY, "");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/api/categories`);
  return res.json();
}

export async function listBusinesses(params: {
  district?: string;
  category?: string;
  search?: string;
}): Promise<Business[]> {
  const q = new URLSearchParams();
  if (params.district) q.set("district", params.district);
  if (params.category) q.set("category", params.category);
  if (params.search) q.set("search", params.search);
  const res = await fetch(`${BASE_URL}/api/businesses?${q.toString()}`);
  return res.json();
}

export async function getBusiness(id: string): Promise<Business> {
  const res = await fetch(`${BASE_URL}/api/businesses/${id}`);
  return res.json();
}

export async function createBusinessPublic(
  payload: BusinessPayload
): Promise<Business> {
  const res = await fetch(`${BASE_URL}/api/businesses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ===== Admin =====

export async function adminLogin(
  email: string,
  password: string
): Promise<{ token: string; email: string }> {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = "Login failed";
    try {
      msg = JSON.parse(text).detail || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function adminMe(): Promise<{ email: string }> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/admin/me`, { headers });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function adminListBusinesses(
  search?: string
): Promise<Business[]> {
  const headers = await authHeaders();
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${BASE_URL}/api/admin/businesses${q}`, { headers });
  if (!res.ok) throw new Error("Failed to load businesses");
  return res.json();
}

export async function adminCreateBusiness(
  payload: BusinessPayload
): Promise<Business> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/admin/businesses`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function adminUpdateBusiness(
  id: string,
  payload: Partial<BusinessPayload>
): Promise<Business> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/admin/businesses/${id}`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function adminDeleteBusiness(id: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}/api/admin/businesses/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Delete failed");
}

export type ImportResult = {
  inserted: number;
  skipped: number;
  errors: string[];
};

export async function adminImport(
  uri: string,
  name: string,
  mime: string
): Promise<ImportResult> {
  const headers = await authHeaders();
  const form = new FormData();
  // React Native FormData file shape
  form.append("file", {
    // @ts-expect-error RN FormData accepts {uri,name,type}
    uri,
    name,
    type: mime,
  });
  const res = await fetch(`${BASE_URL}/api/admin/import`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
