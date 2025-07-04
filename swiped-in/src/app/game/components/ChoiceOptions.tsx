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
    // Default to "Decline" and "Apply" if options are empty, null, or undefined
    const optionAText = currentScenario.optionA?.text || "Decline";
    const optionBText = currentScenario.optionB?.text || "Apply";

    return (
        <div className="mt-8 flex flex-row gap-6 font-mono px-0 w-full justify-between md:text-xl z-100">
            <motion.h1 style={{ opacity: leftOpacity }}>
                {optionAText}
            </motion.h1>
            <motion.h1 style={{ opacity: rightOpacity }} className="text-right">
                {optionBText}
            </motion.h1>
        </div>
    );
} 