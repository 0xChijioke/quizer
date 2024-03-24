"use client";

import Head from "next/head";
import Portal from "./_components/graphics/portal";
import { usePrivy } from "@privy-io/react-auth";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Login: NextPage = () => {
  const { login } = usePrivy();

  
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) {
      router.push("/quiz");
    }
  }, [ready, authenticated, router]);

  return (
    <>
      <Head>
        <title>Login</title>
      </Head>

      <main className="flex min-h-screen pt-0 p-1 min-w-full">
        <div className="flex flex-1 justify-center items-center">
          <div className="-mt-10 lg:-mt-20">
            <div>
              <Portal style={{ maxWidth: "100%", height: "300px" }} />
            </div>
            <div className="mt-6 flex justify-center text-center">
              <button className="bg-violet-600 hover:bg-violet-700 py-3 px-6 text-white rounded-lg" onClick={login}>
                Log in
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Login;
