import WorkoutForm from "@/components/WorkoutForm";

export default function NewWorkoutPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold">Tambah Latihan</h1>
      <p className="mt-2 mb-6 text-gray-400">
        Catat latihan yang baru saja kamu selesaikan.
      </p>
      <WorkoutForm />
    </section>
  );
}
