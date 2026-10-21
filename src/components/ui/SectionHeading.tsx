import { display } from "@/lib/fonts";
import { MONO_LABEL } from "./classes";

interface SectionHeadingProps {
  id: string;
  kicker: string;
  title: string;
}

/** Mono kicker over a Michroma silver-gradient title (the projects-heading treatment). */
export default function SectionHeading({ id, kicker, title }: SectionHeadingProps): JSX.Element {
  return (
    <div data-reveal>
      <p className={MONO_LABEL}>{kicker}</p>
      <h2
        id={id}
        className={`${display.className} mt-5 bg-[image:var(--gradient-silver)] bg-clip-text text-[clamp(28px,3.4vw,52px)] uppercase leading-[0.95] text-transparent`}
      >
        {title}
      </h2>
    </div>
  );
}
