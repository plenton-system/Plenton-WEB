import type { FoodItem, FoodListFilters } from 'src/types';

const MOCK_FOODS: FoodItem[] = [
  { id: 'f1', description: 'Arroz integral cozido', group: 'Cereais', calories: 124, protein: 2.6, carbs: 25.8, fat: 1.0, source: 'taco' },
  { id: 'f2', description: 'Feijão carioca cozido', group: 'Leguminosas', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, source: 'taco' },
  { id: 'f3', description: 'Frango grelhado', group: 'Carnes', calories: 165, protein: 31, carbs: 0, fat: 3.6, source: 'custom' },
];

export const foodTemplateService = {
  getAll: async (query: FoodListFilters = {}): Promise<{ items: FoodItem[]; total: number; totalPages: number; currentPage: number }> => {
    await new Promise((r) => setTimeout(r, 120));
    const term = (query.value ?? '').toLowerCase();
    const filtered = MOCK_FOODS.filter((f) => {
      const matchesTerm = !term || f.description.toLowerCase().includes(term);
      const matchesSource = !query.source || f.source === query.source;
      return matchesTerm && matchesSource;
    });
    const sorted = [...filtered].sort((a, b) => {
      const dir = (query.order ?? 'asc') === 'asc' ? 1 : -1;
      switch (query.orderBy) {
        case 'group':
          return dir * String(a.group || '').localeCompare(String(b.group || ''));
        case 'calories':
          return dir * ((a.calories || 0) - (b.calories || 0));
        case 'protein':
          return dir * ((a.protein || 0) - (b.protein || 0));
        case 'carbs':
          return dir * ((a.carbs || 0) - (b.carbs || 0));
        case 'fat':
          return dir * ((a.fat || 0) - (b.fat || 0));
        case 'description':
        default:
          return dir * a.description.localeCompare(b.description);
      }
    });

    const pageSize = query.pageSize ?? 10;
    const pageIndex = query.pageIndex ?? 0;
    const start = pageIndex * pageSize;
    const items = sorted.slice(start, start + pageSize);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return { items, total, totalPages, currentPage: pageIndex };
  },
};
