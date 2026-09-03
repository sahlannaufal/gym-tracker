"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadExerciseCatalog, type ExerciseCatalogItem } from "@/lib/exerciseCatalog";

const PAGE_SIZE = 20;

export default function ExerciseCatalogPicker({
  selected,
  onAdd,
  onTutorial,
  onCustom,
}: {
  selected: string[];
  onAdd: (exercise: string) => void;
  onTutorial: (exercise: string) => void;
  onCustom: () => void;
}) {
  const [items, setItems] = useState<ExerciseCatalogItem[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [equipment, setEquipment] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    let active = true;
    loadExerciseCatalog()
      .then((catalog) => {
        if (active) setItems(catalog);
      })
      .catch(() => {
        if (active) setError("Katalog gagal dimuat. Periksa koneksi lalu coba lagi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => [...new Set(items.map((item) => item.category))].sort(), [items]);
  const equipmentOptions = useMemo(() => [...new Set(items.map((item) => item.equipment))].sort(), [items]);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return items.filter((item) =>
      (!category || item.category === category) &&
      (!equipment || item.equipment === equipment) &&
      (!normalizedQuery || `${item.name} ${item.sourceName} ${item.target}`.toLocaleLowerCase().includes(normalizedQuery))
    );
  }, [items, query, category, equipment]);
  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const updateFilter = (update: () => void) => {
    update();
    setVisibleCount(PAGE_SIZE);
    scrollContainerRef.current?.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    const root = scrollContainerRef.current;
    if (!trigger || !root || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, filtered.length));
        }
      },
      { root, threshold: 0.1 },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [filtered.length, hasMore, visibleItems.length]);

  if (loading) return <div className="p-6 text-center text-sm text-gray-400">Memuat katalog latihan...</div>;
  if (error) return <p className="p-4 text-sm text-red-300">{error}</p>;

  return (
    <div ref={scrollContainerRef} className="max-h-80 overflow-y-auto">
      <div className="sticky top-0 z-10 space-y-2 bg-gray-950 pb-3">
        <input
          type="search"
          value={query}
          onChange={(event) => updateFilter(() => setQuery(event.target.value))}
          placeholder="Cari nama atau target otot..."
          aria-label="Cari latihan"
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-lime-400 focus:outline-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <select value={category} onChange={(event) => updateFilter(() => setCategory(event.target.value))} className="min-w-0 rounded-lg border border-gray-700 bg-gray-900 px-2 py-2 text-xs text-gray-200">
            <option value="">Semua bagian tubuh</option>
            {categories.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={equipment} onChange={(event) => updateFilter(() => setEquipment(event.target.value))} className="min-w-0 rounded-lg border border-gray-700 bg-gray-900 px-2 py-2 text-xs text-gray-200">
            <option value="">Semua equipment</option>
            {equipmentOptions.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>
        <p className="text-xs text-gray-500">{filtered.length} latihan ditemukan</p>
      </div>

      {visibleItems.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">Latihan tidak ditemukan.</p>
      ) : (
        <ul className="space-y-1">
          {visibleItems.map((item, index) => {
            const isSelected = selected.includes(item.name);
            return (
              <li
                key={item.id}
                ref={index === visibleItems.length - 6 ? loadMoreTriggerRef : undefined}
                className="flex items-center gap-1 rounded-lg hover:bg-gray-900"
              >
                <button type="button" onClick={() => onAdd(item.name)} disabled={isSelected} className="min-w-0 flex-1 px-2 py-2 text-left disabled:text-gray-600">
                  <span className="block truncate text-sm">{item.name}</span>
                  <span className="block truncate text-[11px] text-gray-500">{item.category} · {item.equipment} · {item.target}</span>
                  {isSelected && <span className="text-[11px] text-lime-500/70">Ditambahkan</span>}
                </button>
                <button type="button" onClick={() => onTutorial(item.name)} aria-label={`Buka tutorial ${item.name}`} className="flex h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-lime-400 hover:bg-lime-400/10">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  Tutorial
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 border-t border-gray-800 pt-3 text-center text-xs text-gray-500" aria-live="polite">
        Menampilkan {visibleItems.length} dari {filtered.length} latihan{hasMore ? " · scroll untuk melihat lainnya" : ""}
      </p>
      <button type="button" onClick={onCustom} className="mt-3 w-full rounded-lg border border-gray-700 px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-900">+ Latihan custom</button>
    </div>
  );
}
