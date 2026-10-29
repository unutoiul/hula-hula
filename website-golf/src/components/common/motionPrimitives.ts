import { Box, Typography } from '@mui/material';
import { motion } from 'motion/react';

// Every animation on this page — hero crossfade/drift, entrance fades, the live
// dot, the carousels — runs through Motion (motion/react) rather than mixed
// CSS keyframes, so timing, easing and reduced-motion handling are consistent.
export const MotionBox = motion.create(Box);
export const MotionTypography = motion.create(Typography);
