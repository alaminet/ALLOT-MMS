import React from "react";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import PricePlan from "@/components/sections/PricePlan";
import GetStarted from "@/components/sections/GetStarted";
import FAQ from "@/components/sections/FAQ";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <PricePlan />
      <GetStarted />
      <FAQ />
    </>
  );
}
