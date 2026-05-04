import { motion, Variants } from 'framer-motion';

interface TextRevealProps {
  text: string;
  className?: string;
  once?: boolean;
}

/**
 * Advanced Text Reveal component that animates text character by character.
 */
export default function TextReveal({ text, className, once = true }: TextRevealProps) {
  const characters = text.split("");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.02, delayChildren: 0.04 * i },
    }),
  };

  const childVariants: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  return (
    <motion.h1
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap" }}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      className={className}
    >
      {characters.map((char, index) => (
        <motion.span key={index} variants={childVariants} style={{ display: "inline-block", whiteSpace: "pre" }}>
          {char}
        </motion.span>
      ))}
    </motion.h1>
  );
}
