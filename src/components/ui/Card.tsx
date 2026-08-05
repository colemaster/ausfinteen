import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'card-container relative rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-card',
        glass:
          'border-white/10 bg-card/70 backdrop-blur-xl shadow-[0_8px_32px_-12px_rgba(0,0,0,0.18)]',
        elevated:
          'border-border/80 bg-card shadow-[0_10px_30px_-12px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.2)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Add hover lift + shadow micro-interaction (no cursor change). */
  hover?: boolean;
  /** Add clickable micro-interactions: lift, shadow, active scale. */
  interactive?: boolean;
}

export function Card({
  className,
  variant,
  hover,
  interactive,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        cardVariants({ variant }),
        'before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-border before:to-transparent',
        hover &&
          'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg',
        interactive &&
          'cursor-pointer hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg active:scale-[0.98] active:shadow-md',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  );
}
