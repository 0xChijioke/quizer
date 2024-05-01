"use client";

import { usePrivy } from "@privy-io/react-auth";

const Connection = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();

  return (
    <>
      {ready && authenticated && user ? (
        <button className="btn btn-primary hover:bg-red-700 py-2 px-5 rounded-lg" onClick={logout}>
          Sign out
        </button>
      ) : (
        <button className="bg-violet-600 hover:bg-violet-700 py-2 px-5 text-white rounded-lg" onClick={login}>
          Log in
        </button>
      )}
    </>
  );
};

export default Connection;