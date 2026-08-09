import { memo } from 'react';
import { cn } from '@/lib/utils';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'sync';
  fetchPriority?: 'high' | 'low' | 'auto';
  width?: number;
  height?: number;
}

/**
 * Renders the most efficient format the browser supports.
 * Given a `/path/img.jpg` source, prefers `/path/img.avif`, then `/path/img.webp`,
 * falling back to the original. All graphics are pre-converted at build time so
 * this costs zero runtime bytes. Browsers without <picture> simply get the JPG.
 */
export const SmartImage = memo(function SmartImage({
  src,
  alt,
  className,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority,
  width,
  height,
}: SmartImageProps) {
  const base = src.replace(/\.(jpe?g|png)$/i, '');
  const avif = `${base}.avif`;
  const webp = `${base}.webp`;

  return (
    <picture>
      <source srcSet={avif} type="image/avif" />
      <source srcSet={webp} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className={cn('w-full h-auto object-cover', className)}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        width={width}
        height={height}
      />
    </picture>
  );
});
