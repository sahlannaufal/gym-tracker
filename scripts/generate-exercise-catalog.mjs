import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error("Usage: node scripts/generate-exercise-catalog.mjs <exercises.json>");

const outputDir = path.resolve("public/data/exercises");
const legacyPath = path.resolve("public/data/exercise-tutorials.json");
const source = JSON.parse(await readFile(sourcePath, "utf8"));
const legacy = JSON.parse(await readFile(legacyPath, "utf8"));
const legacyNames = new Map(legacy.map((item) => [item.id, item.appName]));
const pageSize = 50;

const titleCase = (value) => value.replace(/\b\w/g, (character) => character.toUpperCase());
const mediaUrl = (relativePath) => {
  const filename = path.basename(relativePath);
  const mediaId = filename.replace(/^\d+-/, "");
  return `https://static.exercisedb.dev/media/${mediaId}`;
};
const sourceNameCounts = new Map();
const sourceNameIndexes = new Map();
for (const item of source) sourceNameCounts.set(item.name, (sourceNameCounts.get(item.name) ?? 0) + 1);
const displayNames = new Map(source.map((item) => {
  if (legacyNames.has(item.id)) return [item.id, legacyNames.get(item.id)];
  const nextIndex = (sourceNameIndexes.get(item.name) ?? 0) + 1;
  sourceNameIndexes.set(item.name, nextIndex);
  const suffix = sourceNameCounts.get(item.name) > 1 ? ` (Variant ${nextIndex})` : "";
  return [item.id, `${titleCase(item.name)}${suffix}`];
}));

const sorted = [...source].sort((a, b) => {
  const aPopular = legacyNames.has(a.id) ? 0 : 1;
  const bPopular = legacyNames.has(b.id) ? 0 : 1;
  return aPopular - bPopular || a.name.localeCompare(b.name);
});

const catalog = sorted.map((item, index) => ({
  id: item.id,
  name: displayNames.get(item.id),
  sourceName: item.name,
  category: item.category,
  equipment: item.equipment,
  target: item.target,
  detailPage: Math.floor(index / pageSize) + 1,
  popular: legacyNames.has(item.id),
}));

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "catalog.json"), JSON.stringify(catalog));

for (let offset = 0; offset < sorted.length; offset += pageSize) {
  const page = Math.floor(offset / pageSize) + 1;
  const details = sorted.slice(offset, offset + pageSize).map((item) => ({
    id: item.id,
    name: displayNames.get(item.id),
    bodyPart: item.body_part,
    equipment: item.equipment,
    target: item.target,
    muscleGroup: item.muscle_group,
    secondaryMuscles: item.secondary_muscles,
    instructions: item.instruction_steps?.en ?? [item.instructions?.en].filter(Boolean),
    gifUrl: mediaUrl(item.gif_url),
    attribution: "ExerciseDB / Gym Visual",
  }));
  await writeFile(path.join(outputDir, `details-${page}.json`), JSON.stringify(details));
}

console.log(`Generated ${catalog.length} exercises across ${Math.ceil(catalog.length / pageSize)} detail files.`);
