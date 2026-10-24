import React, { useEffect, useState, useCallback } from 'react';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  href?: string;
  replace?: boolean;
}

export function Link({ to, href, children, className, onClick, ...props }: LinkProps) {
  const target = to || href || '#';

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
  };

  return (
    <a
      href={target}
      className={className}
      onClick={handleClick}
      data-astro-prefetch="hover"
      {...props}
    >
      {children}
    </a>
  );
}

export interface NavLinkProps extends Omit<LinkProps, 'className'> {
  className?: string | ((props: { isActive: boolean }) => string);
}

export function NavLink({ to, href, children, className, ...props }: NavLinkProps) {
  const target = to || href || '#';
  const location = useLocation();
  const isActive = location.pathname === target || (target !== '/' && location.pathname.startsWith(target));

  const computedClassName = typeof className === 'function' ? className({ isActive }) : className;

  return (
    <Link to={target} className={computedClassName} {...props}>
      {children}
    </Link>
  );
}

export function useNavigate() {
  return useCallback((to: string | number, options?: { replace?: boolean }) => {
    if (typeof window === 'undefined') return;
    if (typeof to === 'number') {
      window.history.go(to);
      return;
    }
    if (options?.replace) {
      window.location.replace(to);
    } else {
      window.location.href = to;
    }
  }, []);
}

export function useLocation() {
  const [location, setLocation] = useState(() => ({
    pathname: typeof window !== 'undefined' ? window.location.pathname : '/',
    search: typeof window !== 'undefined' ? window.location.search : '',
    hash: typeof window !== 'undefined' ? window.location.hash : '',
  }));

  useEffect(() => {
    const update = () => {
      setLocation({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      });
    };

    window.addEventListener('popstate', update);
    document.addEventListener('astro:page-load', update);
    return () => {
      window.removeEventListener('popstate', update);
      document.removeEventListener('astro:page-load', update);
    };
  }, []);

  return location;
}

type SearchParamsValue = string | number | boolean;

function toSearchParams(record: Record<string, SearchParamsValue>): URLSearchParams {
  const sp = new URLSearchParams();
  Object.entries(record).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      sp.set(k, String(v));
    }
  });
  return sp;
}

export type SearchParamsSetter = (
  next: URLSearchParams | Record<string, string | number | boolean> | ((prev: URLSearchParams) => URLSearchParams | Record<string, string | number | boolean>),
  options?: { replace?: boolean }
) => void;

/**
 * Internal notification for query-string updates made by `setSearchParams`.
 * A synthetic `popstate` used to be dispatched here, but that event is owned
 * by the browser (and Astro's ClientRouter expects `event.state.index`), so a
 * bare Event crashed the router. A private event keeps hook instances in sync
 * without touching navigation state.
 */
const URL_PARAMS_EVENT = 'urlparamschange';

export function useSearchParams(): [URLSearchParams, SearchParamsSetter] {
  // Start empty on both server and client so hydration matches the prerendered
  // HTML. The effect below immediately adopts the real query string, which
  // keeps deep links (`?tab=roadmap`, `?cat=investing`) working without a
  // hydration mismatch.
  const [searchParams, setSearchParamsState] = useState(
    () => new URLSearchParams()
  );

  useEffect(() => {
    const update = () => {
      setSearchParamsState(new URLSearchParams(window.location.search));
    };

    update();
    window.addEventListener('popstate', update);
    window.addEventListener(URL_PARAMS_EVENT, update);
    document.addEventListener('astro:page-load', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener(URL_PARAMS_EVENT, update);
      document.removeEventListener('astro:page-load', update);
    };
  }, []);

  const setSearchParams = useCallback(
    (
      next: URLSearchParams | Record<string, string | number | boolean> | ((prev: URLSearchParams) => URLSearchParams | Record<string, string | number | boolean>),
      options?: { replace?: boolean }
    ) => {
      if (typeof window === 'undefined') return;

      let sp: URLSearchParams;
      if (typeof next === 'function') {
        const result = next(new URLSearchParams(window.location.search));
        sp = result instanceof URLSearchParams ? result : toSearchParams(result);
      } else if (next instanceof URLSearchParams) {
        sp = next;
      } else {
        sp = toSearchParams(next);
      }

      const queryString = sp.toString();
      const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}${window.location.hash}`;

      // Preserve Astro's history state (scroll index) on query-only updates.
      const historyState = window.history.state;
      if (options?.replace) {
        window.history.replaceState(historyState, '', newUrl);
      } else {
        window.history.pushState(historyState, '', newUrl);
      }

      setSearchParamsState(new URLSearchParams(queryString));
      window.dispatchEvent(new CustomEvent(URL_PARAMS_EVENT));
    },
    []
  );

  return [searchParams, setSearchParams];
}

export function useNavigationType() {
  return 'PUSH';
}
