import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        default:
          'border-primary/20 bg-gradient-to-b from-primary/20 to-primary/5 text-primary shadow-sm',
        success:
          'border-success/20 bg-gradient-to-b from-success/20 to-success/5 text-success shadow-sm',
        warning:
          'border-warning/25 bg-gradient-to-b from-warning/20 to-warning/5 text-warning shadow-sm',
        danger:
          'border-danger/20 bg-gradient-to-b from-danger/20 to-danger/5 text-danger shadow-sm',
        info: 'border-info/20 bg-gradient-to-b from-info/20 to-info/5 text-info shadow-sm',
        outline: 'border-border bg-card text-foreground shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
