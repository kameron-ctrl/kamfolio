/** One thought in the kam.md feed: avatar, name, handle, time, text. */
import { formatPostTime, linkify } from "@/lib/kam/format";
import type { KamPost as KamPostData } from "@/lib/kam/types";
import { MONO, SANS } from "@/components/ui/classes";
import KamAvatar from "./KamAvatar";

export default function KamPost({ post }: { post: KamPostData }): JSX.Element {
  return (
    <article className="kam-post">
      <KamAvatar size="sm" />
      <div className="kam-post__body">
        <header className="kam-post__meta">
          <span className={`${SANS} kam-post__name`}>Kameron Benjamin</span>
          <span className={`${MONO} kam-post__handle`}>@kam.md</span>
          <span aria-hidden="true" className="kam-post__dot">
            ·
          </span>
          <time dateTime={post.at} className={`${MONO} kam-post__time`}>
            {formatPostTime(post.at)}
          </time>
        </header>
        <p className={`${SANS} kam-post__text`}>
          {linkify(post.text).map((part, i) =>
            part.kind === "link" ? (
              <a key={i} href={part.href} target="_blank" rel="noopener noreferrer nofollow" className="kam-post__link">
                {part.value}
              </a>
            ) : (
              <span key={i}>{part.value}</span>
            )
          )}
        </p>
      </div>
    </article>
  );
}
