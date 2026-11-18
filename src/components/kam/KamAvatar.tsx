/** Monogram avatar: a small silver moon with a "K", lit from the top-left like the hero moon. */
import { MONO } from "@/components/ui/classes";

export default function KamAvatar({ size }: { size: "sm" | "lg" }): JSX.Element {
  return (
    <span aria-hidden="true" className={`${MONO} kam-avatar kam-avatar--${size}`}>
      K
    </span>
  );
}
