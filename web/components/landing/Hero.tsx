"use client"

import { Button } from "@peerly/ui-components";
import Link from "next/link";
import { motion } from "framer-motion";
import { GithubBorder } from "./GithubBorder";

export default function Hero() {
  const baseAnimation = {
    initial: { opacity: 0, scale: 1.1 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeInOut" },
    viewport: { once: true },
  };

  const githubBorderDelay = 0.1;
  const headingDelay = githubBorderDelay + baseAnimation.transition.duration;
  const textAnimationDelay = headingDelay + baseAnimation.transition.duration;

  return (
    <div className="">
      <div className="flex flex-col gap-8 justify-center items-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ ...baseAnimation.transition, delay: githubBorderDelay }}
          viewport={{ once: true }}
        >
          <GithubBorder />
        </motion.div>

        <div className="max-w-4xl text-center">
          <motion.h1
            {...baseAnimation}
            transition={{ ...baseAnimation.transition, delay: headingDelay }}
            className="text-center  mx-auto bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.00)_202.08%)]
             bg-clip-text text-4xl tracking-tighter sm:text-5xl text-transparent md:text-6xl lg:text-8xl"
          >
           Unlock the Future{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r to-blue-200 from-zinc-300">
            of Loans
            </span>{" "}
            with Peerly
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: textAnimationDelay, ease: "easeInOut" }}
            viewport={{ once: true }}
            className="flex flex-col justify-center items-center"
          >
            <div className="mt-12 max-w-[47rem]">
              <p className="text-xl text-muted-foreground text-center">
                Join our decentralized peer-to-peer network for a new era of Decentralized Finance. 
                Borrow and lend with confidence, powered by the Solana blockchain.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: textAnimationDelay + 0.3, ease: "easeInOut" }}
              viewport={{ once: true }}
              className="mt-10 gap-3 flex justify-center"
            >
              <Link href={"/request"}>
                <Button size={"lg"}> Request for Loan</Button>
              </Link>
              <Link href={"/explore"}>
                <Button size={"lg"} variant={"outline"}> Explore</Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
