import Image from "next/image";
import type { Media } from "@/payload-types";
type Props = { media: number | Media | null | undefined; sizes: string; className?: string; priority?: boolean };
/** Shows an uploaded photo (uses the 800px version when available). Parent must be `relative` with a size. */
export default function CmsImage({ media, sizes, className = "object-cover", priority }: Props) {
  if (!media || typeof media !== "object" || !media.url) return null;
  return <Image src={media.sizes?.card?.url || media.url} alt={media.alt} fill unoptimized sizes={sizes} className={className} priority={priority} loading={priority ? undefined : "lazy"} />;
}
