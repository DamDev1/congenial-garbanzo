import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, label, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-[13px] font-bold text-slate-900 block" htmlFor={props.id}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={inputType}
            className={`w-full ${isPassword ? 'pl-4 pr-12' : 'px-4'} py-3 bg-white border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-blue-600 focus:border-blue-600'} rounded-xl focus:outline-none focus:ring-1 transition-colors text-slate-800 placeholder-slate-400 ${className}`}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 font-medium mt-1">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
