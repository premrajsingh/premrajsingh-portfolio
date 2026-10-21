export const ease = [0.22, 1, 0.36, 1]

export const duration = {
  fast: 0.25,
  base: 0.45,
  slow: 0.7,
}

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease },
  },
}

export const stagger = {
  show: {
    transition: { staggerChildren: 0.08 },
  },
}
