"use client";

import { useEffect, useRef, useState } from "react";
import {
	useMotionValue,
	useTransform,
	useAnimation,
	useMotionValueEvent,
} from "framer-motion";
import { StatusBar } from "./components/StatusBar";
import { CardStack } from "./components/CardStack";
import { ChoiceOptions } from "./components/ChoiceOptions";
import { loadGameScenarios, type ClientScenario, ensureDefaultOptions, loadMoreScenarios } from "@/lib/supabase/cardUtils";
import { createClient } from '@supabase/supabase-js';
import { getJobs } from "@/lib/supabase/jobUtils";


const DRAG_THRESHOLD = 200;
const THROW_VELOCITY = 750;


/*
const clientScenario = (
	situation: string,
	optionRows: { leading_choice: string | null; id: number }[]
) => ({
	situation,
	optionA: { text: optionRows[0].leading_choice, id: optionRows[0].id },
	optionB: { text: optionRows[1].leading_choice, id: optionRows[1].id },
});
*/
const testData: ClientScenario[] = [
	{
		situation: "Software Developer at Tech Corp (Remote)",
		optionA: { text: "Decline", id: 1 },
		optionB: { text: "Apply", id: 2 },
	},
];

const STARTING_SCENARIO_ID = 5;

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GameInterface() {
	const [dayCount, setDayCount] = useState(0);
	const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [stats] = useState({
		nature: 50,
		social: 50,
		military: 50,
		economy: 50,
	});
	// const [scenarios] = useState<Database["public"]["Tables"]["games"]["Row"][]>(
	// 	[]
	// );
	const [scenarios, setScenarios] = useState<number[]>([]);
	const [scenariosData, setScenariosData] = useState<ClientScenario[]>([]);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	
	const [currentScenario, setCurrentScenario] = useState<ClientScenario | null>(
		null
	);
	const [isLoading, setIsLoading] = useState(true);
	const choiseScenarios = useRef<{
		optionA: ClientScenario | null;
		optionB: ClientScenario | null;
	}>({
		optionA: null,
		optionB: null,
	});

	// Load more scenarios when needed
	const loadMoreScenariosIfNeeded = async () => {
		// If we're within 2 cards of the end, load more
		if (currentScenarioIndex >= scenariosData.length - 2 && !isLoadingMore) {
			setIsLoadingMore(true);
			try {
				const newScenarios = await loadMoreScenarios(scenariosData.length);
				if (newScenarios.length > 0) {
					setScenariosData(prev => [...prev, ...newScenarios]);
					setScenarios(prev => [...prev, ...newScenarios.map((_: any, index: number) => prev.length + index)]);
				}
			} catch (error) {
				console.error("Failed to load more scenarios:", error);
			} finally {
				setIsLoadingMore(false);
			}
		}
	};

	useEffect(() => {
		loadGameScenarios()
			.then((scenarios) => {
				console.log("Loaded scenarios:", scenarios);
				setScenariosData(scenarios);
				// Create array of indices for CardStack
				setScenarios(scenarios.map((_: any, index: number) => index));
				// Set the first scenario as current
				if (scenarios.length > 0) {
					const firstScenario = ensureDefaultOptions(scenarios[0]);
					setCurrentScenario(firstScenario);
					// Set up choice scenarios
					choiseScenarios.current = {
						optionA: firstScenario,
						optionB: firstScenario,
					};
				} else {
					// Fallback: create a default scenario if no jobs are found
					console.log("No scenarios found, creating fallback scenario");
					const fallbackScenario = ensureDefaultOptions({
						situation: "No jobs available at the moment. Check back later!",
						salary: undefined,
						optionA: { text: "Decline", id: 0 },
						optionB: { text: "Apply", id: 0 }
					});
					setCurrentScenario(fallbackScenario);
					choiseScenarios.current = {
						optionA: fallbackScenario,
						optionB: fallbackScenario,
					};
				}
				setIsLoading(false);
			})
			.catch((error) => {
				console.error("Failed to load scenarios from database:", error);
				// Fallback: create a default scenario on error
				const fallbackScenario = ensureDefaultOptions({
					situation: "Unable to load jobs. Please try again later.",
					salary: undefined,
					optionA: { text: "Decline", id: 0 },
					optionB: { text: "Apply", id: 0 }
				});
				setCurrentScenario(fallbackScenario);
				choiseScenarios.current = {
					optionA: fallbackScenario,
					optionB: fallbackScenario,
				};
				setIsLoading(false);
			});
	}, []);

	// Check if we need to load more scenarios when currentScenarioIndex changes
	useEffect(() => {
		loadMoreScenariosIfNeeded();
	}, [currentScenarioIndex, scenariosData.length]);

	useEffect(() => {
		console.log(choiseScenarios);
	}, [choiseScenarios]);

	const mainControls = useAnimation();
	const SecondControls = useAnimation();

	// Card motion values
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotate = useTransform(
		[x, y],
		([latestX, latestY]) => Number(latestX) * 0.05 + Number(latestY) * 0.05
	);

	const leftOpacity = useTransform(x, [200, 30, -30, -200], [0, 0.7, 0.7, 1]);
	const rightOpacity = useTransform(x, [-200, -30, 30, 200], [0, 0.7, 0.7, 1]);

	const [nextCardContent, setNextCardContent] = useState<string>("");

	useMotionValueEvent(x, "change", (latestX) => {
		// console.log(latestX);

		if (latestX < 0) {
			setNextCardContent(choiseScenarios.current.optionA?.situation || "");
		} else {
			setNextCardContent(choiseScenarios.current.optionB?.situation || "");
		}
	});

	// const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

	// Add a useEffect to update currentScenario when currentScenarioIndex changes
	useEffect(() => {
		if (scenariosData.length > 0 && currentScenarioIndex < scenariosData.length) {
			const scenario = ensureDefaultOptions(scenariosData[currentScenarioIndex]);
			setCurrentScenario(scenario);
			// Update choice scenarios for the current job
			choiseScenarios.current = {
				optionA: scenario,
				optionB: scenario,
			};
		}
	}, [currentScenarioIndex, scenariosData]);

	const handleDragEnd = async (
		event: MouseEvent | TouchEvent | PointerEvent,
		info: {
			offset: { x: number; y: number };
			velocity: { x: number; y: number };
		}
	) => {
		console.log("offset: ", info.offset.x);
		console.log("velocity: ", info.velocity.x);
		const predictedX = info.offset.x + info.velocity.x;
		const predictedY = info.offset.y + info.velocity.y;

		const offset = Math.sqrt(predictedX ** 2 + (predictedY / 10) ** 2);

		console.log("offset: ", offset);
		const velocity = Math.sqrt(
			info.velocity.x ** 2 + (info.velocity.y / 2) ** 2
		);
		console.log("fetchNextScenario");

		if (offset > 300 && velocity > 40 && !isAnimating) {
			setIsAnimating(true);
			const angle = Math.atan2(predictedY, predictedX);
			const throwX = Math.cos(angle) * window.innerWidth * 1.5;
			const throwY = Math.sin(angle) * window.innerHeight * 1.5;

			await mainControls.start({
				x: throwX,
				y: throwY,
				opacity: 0,
				transition: { duration: 1 },
			});

			const isSwipingLeft = predictedX < 0;
			const isSwipingRight = !isSwipingLeft;
			const selectedScenario = isSwipingLeft
				? choiseScenarios.current.optionA
				: choiseScenarios.current.optionB;

			if (selectedScenario) {
				setCurrentScenario(selectedScenario);
			}
			setDayCount((prev) => prev + 1); //day count increment

			// Move to next scenario
			setCurrentScenarioIndex((prevIndex) => prevIndex + 1);
			x.set(0);
			y.set(0);

			// Reset card position for next scenario
			setIsAnimating(false);

			if (isSwipingRight && selectedScenario) {
				const appliedJobs = JSON.parse(localStorage.getItem("appliedJobs") || "[]");
				if (!appliedJobs.some((j: any) => j.optionA.id === selectedScenario.optionA.id && j.situation === selectedScenario.situation)) {
					appliedJobs.push(selectedScenario);
					localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs));
				}
			}
		} else {
			// Snap back to center
			mainControls.start({
				x: 0,
				y: 0,
				transition: { type: "spring", stiffness: 300, damping: 20 },
			});
		}
	};

	const getRandomRotation = () => (Math.random() - 0.5) * 5;

	// useEffect(() => {
	// 	mainControls.set({ x: 0, y: 0, opacity: 1 });
	// }, [currentScenario]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!currentScenario) {
		return <div>Error loading scenario</div>;
	}

	return (
		<div className="min-h-screen bg-blue-100 text-black flex flex-col overflow-hidden">
			<div className="mt-8 text-center font-mono">
				<p className="text-2xl">SwipedIn</p>
			</div>
			<div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full text-black">
				<CardStack
					scenarios={scenarios}
					currentScenarioIndex={currentScenarioIndex}
					isAnimating={isAnimating}
					currentScenario={currentScenario}
					nextCardContent={nextCardContent}
					cardControls={{
						rotate,
						x,
						y,
						mainControls,
						handleDragEnd,
					}}
				/>

				<ChoiceOptions
					currentScenario={currentScenario}
					leftOpacity={leftOpacity}
					rightOpacity={rightOpacity}
				/>

				<div className="mt-8 text-center font-mono">
					
					<p className="text-neutral-400">{dayCount} jobs looked through</p>
				</div>
			</div>
		</div>
	);
}
