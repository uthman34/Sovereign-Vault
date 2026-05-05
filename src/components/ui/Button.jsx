import * as React from "react";
import { motion } from "motion/react";

export const Button = React.forwardRef(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const getVariantClass = () => {
      switch (variant) {
        case "primary": return "btn-primary";
        case "secondary": return "btn-secondary";
        case "outline": return "btn-outline-primary";
        case "ghost": return "btn-link text-decoration-none text-dark";
        case "error": return "btn-danger";
        default: return "btn-primary";
      }
    };

    const getSizeClass = () => {
      switch (size) {
        case "sm": return "btn-sm";
        case "lg": return "btn-lg";
        default: return "";
      }
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={`btn ${getVariantClass()} ${getSizeClass()} ${className}`}
        style={{ borderRadius: '12px' }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
