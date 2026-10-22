/** Rocket silhouette, nose up, 24-unit grid. Decorative: the button carries the label. */
export default function RocketIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      <path fill="currentColor" d="M12 2c3.4 2.6 5 6.4 5 10.6V16H7v-3.4C7 8.4 8.6 4.6 12 2Z" />
      <path fill="currentColor" d="M7 11.5 4 14.5V18l3-1.5ZM17 11.5l3 3V18l-3-1.5Z" />
      <path fill="currentColor" opacity={0.7} d="M9.5 16.6h5l-.8 2.2h-3.4Z" />
      <circle cx="12" cy="9.6" r="1.9" fill="#141416" />
    </svg>
  );
}
