import { Children, cloneElement, isValidElement } from "react";
import InView, { type InViewTag } from "./InView";
import styles from "./motion.module.css";

type Props = {
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span";
  /** "load": CSS keyframes right away (hero). "inView": plays once when scrolled into view. */
  mode?: "load" | "inView";
  /** Extra delay before the first word, in ms. */
  delay?: number;
  className?: string;
  /** Text, or a mix of text and inline elements (e.g. <br />, <em>). */
  children: React.ReactNode;
};

const MAX_STAGGER = 8;

/** Word-by-word mask reveal. The real text stays in the DOM (selectable, readable by screen readers), spaces and wrapping are native. */
export default function TextReveal({ as: Tag = "h2", mode = "inView", delay = 0, className = "", children }: Props) {
  let n = 0;
  const wordStyle = () => ({ "--i": Math.min(n++, MAX_STAGGER) }) as React.CSSProperties;

  const split = (node: React.ReactNode): React.ReactNode =>
    Children.map(node, (child) => {
      if (typeof child === "number") child = String(child);
      if (typeof child === "string") {
        // Split on regular whitespace only: U+00A0 (noOrphan) must keep words glued. Keep the whitespace between words as real text nodes so lines wrap and copy/paste normally.
        return child.split(/([ \t\r\n\f]+)/).map((part, k) =>
          part === "" ? null : /^[ \t\r\n\f]+$/.test(part) ? (
            part
          ) : (
            <span key={k} className={styles.word}>
              <span className={styles.inner} style={wordStyle()}>
                {part}
              </span>
            </span>
          ),
        );
      }
      if (isValidElement<{ children?: React.ReactNode }>(child) && child.type !== "br" && child.props.children != null) {
        return cloneElement(child, undefined, split(child.props.children));
      }
      return child;
    });

  const words = split(children);
  const cls = `${styles.tr} ${className}`;
  const style = { "--td": `${delay}ms` } as React.CSSProperties;

  if (mode === "load") {
    return (
      <Tag className={cls} data-mode="load" style={style}>
        {words}
      </Tag>
    );
  }
  return (
    <InView as={Tag as InViewTag} className={cls} style={style} data-mode="inView">
      {words}
    </InView>
  );
}
