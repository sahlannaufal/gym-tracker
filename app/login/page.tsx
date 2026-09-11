import AuthForm from "@/components/AuthForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md">
      <div className="mb-6 flex flex-col items-center text-center">
        <Image
          src="/icons/icon.svg"
          alt="Logo Abadikan Gym"
          width={64}
          height={64}
          priority
          className="rounded-2xl"
        />
        <p className="mt-3 text-xl font-bold text-gray-100">Abadikan Gym</p>
      </div>
      <AuthForm />
    </section>
  );
}
