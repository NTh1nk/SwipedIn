import { motion } from "framer-motion";

type ChoiceOptionsProps = {
    currentScenario: {
        optionA: { text: string };
        optionB: { text: string };
    };
    leftOpacity: any;
    rightOpacity: any;
};

export function ChoiceOptions({ currentScenario, leftOpacity, rightOpacity }: ChoiceOptionsProps) {
    return (
        <div className="mt-8 flex flex-row gap-6 font-mono px-0 w-full justify-between md:text-xl z-10">
            <motion.h1 style={{ opacity: leftOpacity }}>
                {currentScenario.optionA.text}
            </motion.h1>
            <motion.h1 style={{ opacity: rightOpacity }} className="text-right">
                {currentScenario.optionB.text}
            </motion.h1>
        </div>
    );
} 