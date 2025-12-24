/**
 * @author Shiva Nagendra Babu Kore
 */

import * as React from "react"

import { cn } from "../../lib/utils"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-8 w-full rounded border border-vscode-input-border bg-white px-2.5 py-1.5 text-sm text-vscode-text placeholder:text-vscode-text-muted focus-visible:outline-none focus-visible:border-vscode-focus disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }