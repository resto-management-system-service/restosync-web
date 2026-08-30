// design-sync stub for next/image — renders a plain <img>.
import * as React from 'react';
type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string | { src: string };
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  loader?: unknown;
  placeholder?: string;
  blurDataURL?: string;
};
const NextImage = React.forwardRef<HTMLImageElement, Props>(function NextImage(
  { src, fill, priority, quality, loader, placeholder, blurDataURL, style, ...rest },
  ref
) {
  const resolved = typeof src === 'string' ? src : src?.src;
  return (
    <img
      ref={ref}
      src={resolved}
      style={
        fill
          ? {
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              ...style
            }
          : style
      }
      {...rest}
    />
  );
});
export default NextImage;
