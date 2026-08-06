import WorkoutForm from "@/components/WorkoutForm";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialExercise =
    typeof params.exercise === "string" ? params.exercise : undefined;

  return (
    <section>
      <h1 className="text-2xl font-bold">Tambah Latihan</h1>
      <p className="mt-2 mb-6 text-gray-400">
        Catat latihan yang baru saja kamu selesaikan.
      </p>
      <WorkoutForm initialExercise={initialExercise} />
    </section>
  );
}
