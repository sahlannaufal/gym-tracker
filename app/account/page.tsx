import AccountPanel from "@/components/AccountPanel";

export default function AccountPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="mt-2 text-gray-400">
          Akun dan status sinkronisasi data.
        </p>
      </div>
      <AccountPanel />
    </section>
  );
}
