"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

// 실제 @radix-ui/react-select 대신 간단한 구현으로 대체
const Select = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value?: string; onValueChange?: (value: string) => void }
>((props, ref) => {
    const { children, className, value, onValueChange, ...rest } = props
    return <div ref={ref} className={cn("relative", className)} {...rest}>{children}</div>
})
Select.displayName = "Select"

const SelectGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
    const { children, className, ...rest } = props
    return <div ref={ref} className={cn("", className)} {...rest}>{children}</div>
})
SelectGroup.displayName = "SelectGroup"

const SelectValue = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>((props, ref) => {
    const { children, className, ...rest } = props
    return <span ref={ref} className={cn("", className)} {...rest}>{children}</span>
})
SelectValue.displayName = "SelectValue"

const SelectTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
    const { children, className, ...rest } = props
    return (
        <button
            ref={ref}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm",
                className
            )}
            {...rest}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { position?: string }
>((props, ref) => {
    const { children, className, position, ...rest } = props
    return (
        <div
            ref={ref}
            className={cn(
                "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md",
                className
            )}
            {...rest}
        >
            {children}
        </div>
    )
})
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>((props, ref) => {
    const { children, className, ...rest } = props
    return (
        <label
            ref={ref}
            className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
            {...rest}
        >
            {children}
        </label>
    )
})
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>((props, ref) => {
    const { children, className, value, ...rest } = props
    return (
        <div
            ref={ref}
            className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100",
                className
            )}
            data-value={value}
            {...rest}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <Check className="h-4 w-4" />
            </span>
            {children}
        </div>
    )
})
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
    const { className, ...rest } = props
    return (
        <div
            ref={ref}
            className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
            {...rest}
        />
    )
})
SelectSeparator.displayName = "SelectSeparator"

const SelectScrollUpButton = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
    return <div ref={ref} {...props} />
})
SelectScrollUpButton.displayName = "SelectScrollUpButton"

const SelectScrollDownButton = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
    return <div ref={ref} {...props} />
})
SelectScrollDownButton.displayName = "SelectScrollDownButton"

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
} 