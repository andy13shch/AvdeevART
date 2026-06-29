import { ArtistInfo } from "@/types";
import { motion } from "motion/react";

interface AboutProps {
  artistInfo: ArtistInfo;
}

export default function About({ artistInfo }: AboutProps) {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-square overflow-hidden rounded-2xl"
        >
          <img
            src={artistInfo.profileImageUrl || "https://picsumhttps://downloader.disk.yandex.ru/preview/bbeb103f3458ece9af24cf9ef7a14314bb9a42fdefacec4dd4f6e7ca7b1aaff8/69d59607/zmcNisZjR6GKifnnbb79M0qLkRVAfA75FQE8KR0Lu4tpz07legKex1_JO6ZG_FTUdA8-7FiOTrVERFTxZD1ZoQ%3D%3D?uid=0&filename=Picture1.png&disposition=inline&hash=&limit=0&content_type=image%2Fpng&owner_uid=0&tknv=v3&size=3430x1302.photos/seed/artist/800/800"}
            alt={artistInfo.name}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-8"
        >
          <h1 className="font-serif text-5xl font-bold tracking-tighter md:text-7xl">
            {artistInfo.name}
          </h1>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p className="whitespace-pre-line">{artistInfo.bio}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
