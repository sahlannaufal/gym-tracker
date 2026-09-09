import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <section className="mx-auto max-w-md space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Buat Password Baru</h1>
        <p className="mt-2 text-sm leading-6 text-gray-400">Gunakan password yang mudah kamu ingat dan tidak digunakan di layanan lain.</p>
      </div>
      <ResetPasswordForm />
    </section>
  );
}
