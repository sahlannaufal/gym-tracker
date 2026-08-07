import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Masuk / Daftar</h1>
        <p className="mt-2 text-gray-400">
          Sinkronkan data latihanmu lintas perangkat.
        </p>
      </div>
      <AuthForm />
    </section>
  );
}
