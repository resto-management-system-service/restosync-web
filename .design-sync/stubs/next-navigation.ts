// design-sync stub for next/navigation — DS components render outside Next.
const noop = () => {};
export const usePathname = () => '/';
export const useRouter = () => ({
  push: noop,
  replace: noop,
  back: noop,
  forward: noop,
  refresh: noop,
  prefetch: noop
});
export const useSearchParams = () => new URLSearchParams();
export const useParams = () => ({}) as Record<string, string>;
export const useSelectedLayoutSegment = () => null;
export const useSelectedLayoutSegments = () => [] as string[];
export const redirect = noop;
export const permanentRedirect = noop;
export const notFound = noop;
export const RedirectType = { push: 'push', replace: 'replace' } as const;
