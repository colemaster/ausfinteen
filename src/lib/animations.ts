import type { Variants, Transition } from "motion/react";

/** Standard spring config for UI animations */
export const springConfig: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

/** Gentle spring for larger elements */
export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
};

/** Snappy spring for small interactions */
export const snappySpring: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
};

/** Fade in and slide up — ideal for cards, sections, results */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

/** Fade in and slide from left — ideal for nav items, sidebar */
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

/** Fade in and slide from right — ideal for result panels */
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

/** Scale in — ideal for modals, tooltips, popovers */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

/** Stagger container — wrap children that use fadeInUp/scaleIn */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

/** Fast stagger — for grids with many items */
export const fastStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
};

/** Page enter/exit transitions */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Hover scale effect for interactive cards */
export const hoverScale = {
  whileHover: { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } },
  whileTap: { scale: 0.98 },
};

/** Subtle hover lift for cards */
export const hoverLift = {
  whileHover: {
    y: -4,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};
