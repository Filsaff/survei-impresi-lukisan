import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    // Base
    'group/button',
    'inline-flex',
    'shrink-0',
    'items-center',
    'justify-center',
    'rounded-lg',
    'border',
    'border-transparent',
    'bg-clip-padding',
    'text-sm',
    'font-medium',
    'whitespace-nowrap',
    'transition-all',
    'outline-none',
    'select-none',

    // Focus
    'focus-visible:border-ring',
    'focus-visible:ring-3',
    'focus-visible:ring-ring/50',

    // Active
    'active:not-aria-[haspopup]:translate-y-px',

    // Disabled
    'disabled:pointer-events-none',
    'disabled:opacity-50',

    // Invalid
    'aria-invalid:border-destructive',
    'aria-invalid:ring-3',
    'aria-invalid:ring-destructive/20',
    'dark:aria-invalid:border-destructive/50',
    'dark:aria-invalid:ring-destructive/40',

    // SVG / Icon
    '[&_svg]:pointer-events-none',
    '[&_svg]:shrink-0',
    "[&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-primary',
          'text-primary-foreground',
          '[a]:hover:bg-primary/80',
        ],

        outline: [
          'border-border',
          'bg-background',
          'hover:bg-muted',
          'hover:text-foreground',
          'aria-expanded:bg-muted',
          'aria-expanded:text-foreground',
          'dark:border-input',
          'dark:bg-input/30',
          'dark:hover:bg-input/50',
        ],

        glass: [
          'relative',
          'overflow-hidden',
          'rounded-full',
        
          // Responsive size
          'px-4 py-5',
          'sm:px-4 sm:py-6',
          'md:px-16 md:py-8',
          'justify-center',
        
          // Black glass surface
          'border border-white/20',
          'bg-neutral-900/90',
          'text-white',
        
          // Glass depth
          'shadow-[0_8px_30px_rgba(0,0,0,0.18),inset_0_1px_2px_rgba(255,255,255,0.35),inset_0_-1px_2px_rgba(0,0,0,0.15)]',
        
          'transition-all duration-300',
        
          // Hover
          'hover:-translate-y-0.5',
          'hover:bg-neutral-900/95',
          'hover:border-white/30',
          'hover:shadow-[0_14px_35px_rgba(0,0,0,0.25),inset_0_1px_3px_rgba(255,255,255,0.45)]',
        
          // Active
          'active:scale-[0.96]',
          'active:translate-y-0',
        
          // Focus
          'focus-visible:ring-2',
          'focus-visible:ring-white/20',
        ],

        glassRed: [
          'relative',
          'overflow-hidden',
          'rounded-full',

          'border-white/30',
          'bg-red-900/95',
          'text-white',

          'shadow-[0_12px_35px_rgba(127,29,29,0.20),inset_0_1px_2px_rgba(255,255,255,0.35)]',

          'hover:-translate-y-1',
          'hover:bg-red-800/95',

          'hover:shadow-[0_18px_45px_rgba(127,29,29,0.25),inset_0_1px_3px_rgba(255,255,255,0.45)]',

          'active:scale-[0.96]',
          'active:translate-y-0',
        ],

        glassRed2: [
          'relative',
          'overflow-hidden',
          'rounded-full',
        
          'border border-white/30',
          'justify-center',
        
          'bg-red-900/95',
          'text-white',
        
          'px-4 py-5',
          'sm:px-4 sm:py-6',
          'md:px-16 md:py-8',
          
          'shadow-[0_12px_35px_rgba(127,29,29,0.20),inset_0_1px_2px_rgba(255,255,255,0.35)]',
        
          'transition-all duration-300',
        
          'hover:-translate-y-1',
          'hover:bg-red-800/95',
        
          'hover:shadow-[0_18px_45px_rgba(127,29,29,0.25),inset_0_1px_3px_rgba(255,255,255,0.45)]',
        
          'active:scale-[0.96]',
          'active:translate-y-0',
        ],

        secondary: [
          'bg-secondary',
          'text-secondary-foreground',
          'hover:bg-secondary/80',
          'aria-expanded:bg-secondary',
          'aria-expanded:text-secondary-foreground',
        ],

        ghost: [
          'hover:bg-muted',
          'hover:text-foreground',
          'aria-expanded:bg-muted',
          'aria-expanded:text-foreground',
          'dark:hover:bg-muted/50',
        ],

        destructive: [
          'bg-destructive/10',
          'text-destructive',
          'hover:bg-destructive/20',
          'focus-visible:border-destructive/40',
          'focus-visible:ring-destructive/20',
          'dark:bg-destructive/20',
          'dark:hover:bg-destructive/30',
          'dark:focus-visible:ring-destructive/40',
        ],

        link: [
          'text-primary',
          'underline-offset-4',
          'hover:underline',
        ],
      },

      size: {
        default: [
          'h-8',
          'gap-1.5',
          'px-2.5',
          'has-data-[icon=inline-end]:pr-2',
          'has-data-[icon=inline-start]:pl-2',
        ],

        xs: [
          'h-6',
          'gap-1',
          'rounded-[min(var(--radius-md),10px)]',
          'px-2',
          'text-xs',
          'in-data-[slot=button-group]:rounded-lg',
          'has-data-[icon=inline-end]:pr-1.5',
          'has-data-[icon=inline-start]:pl-1.5',
          "[&_svg:not([class*='size-'])]:size-3",
        ],

        sm: [
          'h-7',
          'gap-1',
          'rounded-[min(var(--radius-md),12px)]',
          'px-2.5',
          'text-[0.8rem]',
          'in-data-[slot=button-group]:rounded-lg',
          'has-data-[icon=inline-end]:pr-1.5',
          'has-data-[icon=inline-start]:pl-1.5',
          "[&_svg:not([class*='size-'])]:size-3.5",
        ],

        lg: [
          'h-9',
          'gap-1.5',
          'px-2.5',
          'has-data-[icon=inline-end]:pr-2',
          'has-data-[icon=inline-start]:pl-2',
        ],

        icon: ['size-8'],

        'icon-xs': [
          'size-6',
          'rounded-[min(var(--radius-md),10px)]',
          'in-data-[slot=button-group]:rounded-lg',
          "[&_svg:not([class*='size-'])]:size-3",
        ],

        'icon-sm': [
          'size-7',
          'rounded-[min(var(--radius-md),12px)]',
          'in-data-[slot=button-group]:rounded-lg',
        ],

        'icon-lg': ['size-9'],
      },
    },

    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const isGlass = variant === 'glass' || variant === 'glassRed' || variant === 'glassRed2'

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        }),
        isGlass && 'group/button',
      )}
      {...props}
    >
      {isGlass && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            overflow-hidden
            rounded-[inherit]
          "
        >
          <span
            className="
              absolute
              -inset-y-8
              left-0
              w-full
              rotate-12
              bg-gradient-to-r
              from-transparent
              via-white/30
              to-transparent
              translate-x-[-150%]
              transition-transform
              duration-1000
              ease-out
              group-hover/button:translate-x-[150%]
            "
          />
        </span>
      )}
      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }