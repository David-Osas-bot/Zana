// The API client sometimes returns a bare array and sometimes a wrapped
// object ({ projects }, { members }, { data }, { items }). Normalize both.
export function ensureArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray((data as any).projects)) return (data as any).projects;
    if (Array.isArray((data as any).members)) return (data as any).members;
    if (Array.isArray((data as any).data)) return (data as any).data;
    if (Array.isArray((data as any).items)) return (data as any).items;
  }
  return [];
}
