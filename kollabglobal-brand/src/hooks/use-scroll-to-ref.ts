import { useEffect, useRef, type RefObject } from "react";

/**
 * Scrolls the referenced element into view (centered, smooth) whenever
 * `condition` becomes true.
 *
 * @param ref       - ref attached to the element to scroll to
 * @param condition - when this flips to true the scroll fires
 * @param once      - if true (default), only scrolls the first time condition becomes true
 */
export function useScrollToRef(
  ref: RefObject<HTMLElement | null>,
  condition: boolean,
  once = true
) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!condition) return;
    if (once && firedRef.current) return;

    if (once) {
      firedRef.current = true;
    }

    const timeout = setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);

    return () => clearTimeout(timeout);
  }, [condition, once, ref]);
}
