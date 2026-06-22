const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export type Business = {
  id: string;
  name: string;
  owner_name: string;
  mobile: string;
  whatsapp?: string | null;
  address: string;
  district: string;
  category: string;
  latitude?: number | null;
  longitude?: number | null;
  description?: string;
  rating?: number;
  image_url?: string | null;
  created_at?: string;
};

export type Category = {
  key: string;
  label: string;
  icon: string;
  image_url: string;
};

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

export async function createBusiness(
  payload: Omit<Business, "id" | "created_at">
): Promise<Business> {
  const res = await fetch(`${BASE_URL}/api/businesses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to create business");
  }
  return res.json();
}
