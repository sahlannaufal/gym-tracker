import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto max-w-md space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold">Lupa Password</h1>
        <p className="mt-2 text-sm leading-6 text-gray-400">Masukkan email akunmu. Kami akan mengirim link untuk membuat password baru.</p>
      </div>
      <ForgotPasswordForm />
    </section>
  );
}
