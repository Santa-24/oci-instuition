import * as React from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-sans font-semibold transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shrink-0 gap-2 cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-[#1D4ED8] text-white hover:bg-[#1E40AF] active:scale-[0.98] shadow-sm',
        amber:
          'bg-[#D97706] text-white hover:bg-[#B45309] active:scale-[0.98] shadow-sm',
        secondary:
          'bg-[#F3F0EA] text-[#0F172A] hover:bg-[#E6E2D8] border border-[#E6E2D8] active:scale-[0.98]',
        dark:
          'bg-[#0C192E] text-white hover:bg-[#15253F] active:scale-[0.98] shadow-sm',
        outline:
          'border border-[#CBD5E1] text-[#0F172A] bg-transparent hover:bg-[#F3F0EA] hover:border-[#0F172A]',
        ghost:
          'text-[#0F172A] hover:bg-[#F3F0EA]',
        link:
          'text-[#1D4ED8] underline-offset-4 hover:underline p-0 h-auto font-medium',
      },
      size: {
        default: 'min-h-[44px] px-5 py-2.5 text-sm rounded-xl',
        sm: 'min-h-[36px] px-3.5 py-1.5 text-xs rounded-lg',
        lg: 'min-h-[52px] px-7 py-3.5 text-base rounded-xl',
        icon: 'w-11 h-11 p-0 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  href?: string
  target?: string
  rel?: string
  download?: boolean | string
}

const Button = React.forwardRef<any, ButtonProps>(
  ({ className, variant, size, href, children, ...props }, ref) => {
    const combinedClassName = cn(buttonVariants({ variant, size, className }))

    if (href) {
      // External link
      if (href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
        return (
          <a
            ref={ref}
            href={href}
            className={combinedClassName}
            target={props.target}
            rel={props.rel || (props.target === '_blank' ? 'noopener noreferrer' : undefined)}
            download={props.download}
          >
            {children}
          </a>
        )
      }

      // Next.js Internal Link
      return (
        <Link
          ref={ref}
          href={href}
          className={combinedClassName}
          download={props.download}
        >
          {children}
        </Link>
      )
    }

    return (
      <button
        ref={ref}
        type={props.type || 'button'}
        className={combinedClassName}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
