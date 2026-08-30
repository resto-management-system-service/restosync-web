// design-sync stub for next/link — renders a plain <a>.
import * as React from 'react';
type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string | { pathname?: string };
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
};
const NextLink = React.forwardRef<HTMLAnchorElement, Props>(function NextLink(
  { href, prefetch, replace, scroll, children, ...rest },
  ref
) {
  const h = typeof href === 'string' ? href : (href?.pathname ?? '#');
  return (
    <a ref={ref} href={h} {...rest}>
      {children}
    </a>
  );
});
export default NextLink;
