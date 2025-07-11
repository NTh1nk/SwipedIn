import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useRef } from "react";
import { useRandomRotations } from '../hooks/useRandomRotations';

type CardStackProps = {
    scenarios: number[];
    currentScenarioIndex: number;
    isAnimating: boolean;
    currentScenario: { situation: string; salary?: string; company_rating?: number };
    nextCardContent: string;
    scenariosData: any[]; // Add scenariosData to access actual scenario content
    cardControls: {
        rotate: any;
        x: any;
        y: any;
        mainControls: any;
        handleDragEnd: (event: any, info: any) => void;
    };
};

export function CardStack({
    scenarios,
    currentScenarioIndex,
    isAnimating,
    currentScenario,
    nextCardContent,
    scenariosData,
    cardControls,
}: CardStackProps) {
    const randomRotations = useRandomRotations(scenarios.length + 1);

    // Calculate which cards should be visible
    // Show current card + next 2 cards immediately, even during animation
    const visibleCards = scenarios.filter((_, i) => i >= currentScenarioIndex && i <= currentScenarioIndex + 4);

    return (
        <div className="relative w-full aspect-[6/7]">
            <AnimatePresence>
                {
                    visibleCards.map(
                        (i) => (
                            <motion.div
                                key={`${i}-${scenariosData[i]?.situation || 'loading'}`}
                                animate={{
                                    scale: 0.95 ** (i - currentScenarioIndex),
                                    y: (i - currentScenarioIndex) * 30,
                                    opacity: 1,
                                }}
                                initial={{
                                    y: (i - currentScenarioIndex) * 30,
                                    opacity: 0,
                                    scale: 0.95 ** (i - currentScenarioIndex),
                                }}
                                style={{
                                    zIndex: scenarios.length - i,
                                    rotate: randomRotations[i],
                                    willChange: "transform, opacity",
                                }}
                                whileTap={{ cursor: "grabbing" }}
                                className="absolute inset-0 touch-none"
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                                    <motion.div
                                        className="absolute inset-0 bg-white rounded-2xl shadow-xl"
                                        id={i + ""}
                                        style={i === currentScenarioIndex ? { rotate: cardControls.rotate, x: cardControls.x, y: cardControls.y } : {}}
                                        drag={i === currentScenarioIndex && !isAnimating}
                                        animate={i === currentScenarioIndex && cardControls.mainControls}
                                        dragConstraints={{
                                            top: 0,
                                            bottom: 0,
                                            left: -100,
                                            right: 100,
                                        }}
                                        onDragEnd={i === currentScenarioIndex ? cardControls.handleDragEnd : undefined}
                                    >
                                        <motion.div
                                            className="p-6 h-full flex flex-col bg-white rounded-2xl"
                                            animate={{
                                                opacity: 1 - (i - currentScenarioIndex) * 0.2,
                                            }}
                                            initial={{
                                                opacity: 1 - (i - currentScenarioIndex) * 0.4,
                                            }}
                                        >
                                            <div className="flex-1 flex flex-col text-center items-center justify-around">
                                                <div className="flex-1 flex flex-col justify-center items-center">
                                                    <p className="font-mono text-sm md:text-base mb-10">
                                                        {scenariosData[i]?.situation || "Loading..."}
                                                    </p>
                                                    {scenariosData[i]?.company_rating !== undefined && scenariosData[i]?.company_rating !== null && (
                                                        <div className="flex items-center justify-center mb-5">
                                                            <span className="bg-yellow-100 border  border-yellow-300 rounded-full px-3 py-1 text-yellow-800 font-semibold text-xs flex items-center gap-1">
                                                                ⭐
                                                                <span>{scenariosData[i].company_rating?.toFixed(1) || 'N/A'}</span>
                                                            </span>
                                                        </div>
                                                    )}
                                                    {scenariosData[i]?.salary && (
                                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl px-4 py-3 mb-4 shadow-sm">
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <span className="text-green-600 text-lg">💰</span>
                                                                <p className="text-green-800 font-bold text-sm">
                                                                    {scenariosData[i].salary}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="w-32 h-32 bg-blue-200 rounded-full" />
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            )
                    )}
            </AnimatePresence>
        </div>
    );
} 