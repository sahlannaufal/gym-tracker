export interface ExerciseCatalogItem {
  id: string;
  name: string;
  sourceName: string;
  category: string;
  equipment: string;
  target: string;
  detailPage: number;
  popular: boolean;
}

export interface ExerciseTutorial {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  instructions: string[];
  gifUrl: string;
  attribution: string;
}

let catalogCache: ExerciseCatalogItem[] | null = null;
let catalogRequest: Promise<ExerciseCatalogItem[]> | null = null;
const detailCache = new Map<number, ExerciseTutorial[]>();
const detailRequests = new Map<number, Promise<ExerciseTutorial[]>>();

export function loadExerciseCatalog(): Promise<ExerciseCatalogItem[]> {
  if (catalogCache) return Promise.resolve(catalogCache);
  if (catalogRequest) return catalogRequest;

  catalogRequest = fetch("/data/exercises/catalog.json")
    .then((response) => {
      if (!response.ok) throw new Error("Katalog latihan tidak dapat dimuat.");
      return response.json() as Promise<ExerciseCatalogItem[]>;
    })
    .then((catalog) => {
      catalogCache = catalog;
      return catalog;
    })
    .finally(() => {
      catalogRequest = null;
    });

  return catalogRequest;
}

function loadDetails(page: number): Promise<ExerciseTutorial[]> {
  const cached = detailCache.get(page);
  if (cached) return Promise.resolve(cached);
  const pending = detailRequests.get(page);
  if (pending) return pending;

  const request = fetch(`/data/exercises/details-${page}.json`)
    .then((response) => {
      if (!response.ok) throw new Error("Detail latihan tidak dapat dimuat.");
      return response.json() as Promise<ExerciseTutorial[]>;
    })
    .then((details) => {
      detailCache.set(page, details);
      return details;
    })
    .finally(() => detailRequests.delete(page));

  detailRequests.set(page, request);
  return request;
}

export async function loadExerciseTutorial(exercise: string): Promise<ExerciseTutorial | undefined> {
  const catalog = await loadExerciseCatalog();
  const item = catalog.find((candidate) => candidate.name === exercise);
  if (!item) return undefined;
  const details = await loadDetails(item.detailPage);
  return details.find((detail) => detail.id === item.id);
}
