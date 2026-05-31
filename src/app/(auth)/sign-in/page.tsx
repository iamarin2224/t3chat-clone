"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import Image from "next/image";

const page = () => {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-16 md:py-32">
      {/* Heading */}
      <div className="flex flex-row items-center justify-center gap-x-2">
        <h1 className="text-3xl font-extrabold text-foreground">Welcome to</h1>
        <Image src="/logo2.svg" alt="Logo" width={142} height={22} priority className="w-[100px] h-auto" />
      </div>

      {/* Subtitle */}
      <p className="mt-2 text-center text-lg font-semibold text-muted-foreground">
        Sign in below
      </p>

      {/* Sign In Buttons Container */}
      <div className="mt-8 flex w-full max-w-sm flex-col gap-4">
        {/* GitHub Sign In */}
        <Button
          variant="outline"
          className="h-14 w-full cursor-pointer"
          onClick={() =>
            signIn.social({
              provider: "github",
              callbackURL: "/",
            })
          }
        >
          <Image src="/github.svg" alt="GitHub" width={24} height={24} />
          <span className="ml-2 font-bold">Sign in with GitHub</span>
        </Button>

        {/* Google Sign In */}
        <Button
          variant="outline"
          className="h-14 w-full cursor-pointer"
          onClick={() =>
            signIn.social({
              provider: "google",
              callbackURL: "/",
            })
          }
        >
          <Image src="/google.svg" alt="Google" width={24} height={24} />
          <span className="ml-2 font-bold">Sign in with Google</span>
        </Button>
      </div>
    </section>
  );
};

export default page;