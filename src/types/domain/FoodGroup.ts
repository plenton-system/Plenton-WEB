export class FoodGroup {
  id: string;

  name: string;

  constructor({ id, name }: { id: string; name: string }) {
    this.id = id;
    this.name = name;
  }

  static fromApi(raw: unknown): FoodGroup {
    const data = raw as { id?: unknown; name?: unknown; Name?: unknown };

    return new FoodGroup({
      id: String(data?.id ?? ''),
      name: String(data?.name ?? data?.Name ?? ''),
    });
  }
}

