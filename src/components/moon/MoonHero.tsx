import { display } from '@/lib/fonts';
import MoonTarget from './MoonTarget';

/**
 * Hero markup: silver headline + the box the moon tracks.
 * Render <MoonCanvasLazy /> (or <MoonScene /> in your global canvas) somewhere on the page as well.
 */
export default function MoonHero() {
  return (
    <section className="relative z-10 overflow-x-clip pt-[clamp(120px,23vh,212px)]">
      <h1
        className={`${display.className} whitespace-pre-line px-4 text-center text-[clamp(36px,6.25vw,96px)] uppercase leading-[0.86] tracking-[-0.02em] text-transparent [text-wrap:balance] bg-clip-text bg-[linear-gradient(180deg,#9a9a99_0%,#f1f0e0_75%,#9a9a99_156%)]`}
      >
        {'Kameron\nBenjamin'}
      </h1>
      <p className="mx-auto mt-[22px] px-4 text-center font-[family-name:var(--font-geist-mono)] text-xs leading-[1.5] uppercase tracking-[0.18em] text-[#9b978e]">
        Full-stack developer &amp; creative technologist
      </p>
      <MoonTarget />
    </section>
  );
}
