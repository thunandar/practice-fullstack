"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { getAccessToken } from "../utils/utils";

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/dashboard");
    getAccessToken();
  }, []);
  return <div>Home</div>;
};

export default Home;
