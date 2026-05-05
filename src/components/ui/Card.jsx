import * as React from "react";

export const Card = React.forwardRef(
  ({ className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`card ${className}`}
      {...props}
    >
      <div className="card-body">
        {children}
      </div>
    </div>
  )
);
Card.displayName = "Card";

export const Badge = React.forwardRef(
  ({ className = "", variant = "primary", children, ...props }, ref) => {
    const getVariantClass = () => {
      switch (variant) {
        case "primary": return "bg-primary";
        case "secondary": return "bg-secondary";
        case "tertiary": return "bg-info";
        case "error": return "bg-danger";
        default: return "bg-primary";
      }
    };
    return (
      <span
        ref={ref}
        className={`badge rounded-pill ${getVariantClass()} ${className}`}
        style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";

export const Input = React.forwardRef(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`form-control ${className}`}
      style={{ 
        borderRadius: '12px', 
        padding: '0.75rem 1rem',
        border: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa'
      }}
      {...props}
    />
  )
);
Input.displayName = "Input";
