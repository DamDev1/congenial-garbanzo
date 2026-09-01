import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={`w-full py-3.5 px-4 bg-[#3B41E3] hover:bg-[#2A2FC3] text-white rounded-xl font-semibold transition-all shadow-[0_8px_16px_-6px_rgba(59,65,227,0.4)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-[15px] ${className}`}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
