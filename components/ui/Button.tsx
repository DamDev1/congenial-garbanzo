import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "default" | "outline";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "w-full py-3.5 px-4 rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-[15px]";
    
    const variants = {
      default: "bg-[#3B41E3] hover:bg-[#2A2FC3] text-white shadow-[0_8px_16px_-6px_rgba(59,65,227,0.4)]",
      outline: "bg-transparent text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${className}`}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
