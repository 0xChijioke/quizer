"use client";

import Head from "next/head";
import Portal from "./_components/graphics/portal";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

const Login: NextPage = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  if (isConnected && address) router.push("/quiz")


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
             
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Login;
