
import { Button } from "@peerly/ui-components";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="relative overflow-hidden py-16  -mt-24 sm:-mt-24 lg:py-12">
      <div
        aria-hidden="true"
        className="flex absolute -top-[600px] start-1/2 transform -translate-x-1/2"
      >
        <div className="bg-gradient-to-r from-background/50 to-background blur-3xl w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]" />
        <div className="bg-gradient-to-tl blur-3xl w-[90rem] h-[50rem] rounded-full origin-top-left -rotate-12 -translate-x-[15rem] from-primary-foreground via-primary-foreground to-background" />
      </div>
      <div className="relative z-10">
        <div className="container py-10 lg:py-16 mt-12 sm:mt-20">
          <div className="max-w-2xl text-center mx-auto">
            <p className="text-2xl font-bold">Peerly</p>
            <div className="mt-5 max-w-2xl">
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Peer To Peer Lending Network
              </h1>
            </div>
            <div className="mt-5 max-w-3xl">
              <p className="text-xl text-muted-foreground">
                Join complete peer-to-peer
                decentralized network for a new era of secure, transparent, and efficient financial Loans.
              </p>
            </div>
            <div className="mt-8 gap-3 flex justify-center">
            <Link href={"/request"}>
                <Button size={"lg"}> Request for Loan</Button>
            </Link>
            <Link href={"/explore"}>
              <Button size={"lg"} variant={"outline"} > Explore</Button>
            </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}