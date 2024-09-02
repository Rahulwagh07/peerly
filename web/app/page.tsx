import Hero from "@/components/landing/Hero";
import BackgroundPlus from "@/components/landing/PlusGrid";

export default function Page() {

	return (
		<>
			<BackgroundPlus />
			<main className="flex overflow-hidden relative flex-col items-center px-2 max-h-screen md:px-0"> 
			  <Hero /> 
			</main>
		</>
	);
}
