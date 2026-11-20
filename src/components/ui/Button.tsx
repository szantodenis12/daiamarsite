import Link from "next/link";
import styles from "./ui.module.css";

type Props = {
  href: string;
  variant?: "dark" | "light" | "line";
  className?: string;
  children: React.ReactNode;
};

export default function Button({ href, variant = "dark", className = "", children }: Props) {
  return (
    <Link href={href} className={`${styles.btn} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  );
}
