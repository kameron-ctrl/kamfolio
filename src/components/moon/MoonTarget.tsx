import type { ReactNode } from 'react';

/**
 * The invisible box the moon tracks. Full width, 1:1.2.
 * On phones it's 115% wide (bleeds 7.5% each side) with more space above, like the reference.
 * Anything you put inside scrolls over the moon.
 */
export default function MoonTarget({ children }: { children?: ReactNode }) {
  return (
    <div className="relative -mx-[7.5%] mt-20 w-[115%] md:mx-0 md:mt-2.5 md:w-full">
      <div data-moon-target aria-hidden={children ? undefined : true} className="relative aspect-[1/1.2] w-full">
        {children}
      </div>
    </div>
  );
}
