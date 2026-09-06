import Image from "next/image";

export type StoreThumbnailImage = {
  src: string;
  width: number;
  height: number;
  bounds: { x: number; y: number; width: number; height: number };
};

export const THUMBNAIL_FRAME = { width: 122, height: 86 };
const CONTENT_WIDTH = THUMBNAIL_FRAME.width - 8;
const CONTENT_HEIGHT = THUMBNAIL_FRAME.height - 8;

export function StoreThumbnail({ image }: { image: StoreThumbnailImage }) {
  const { bounds } = image;
  // Fit the entire artwork. Never enlarge beyond either available dimension.
  const scale = Math.min(CONTENT_WIDTH / bounds.width, CONTENT_HEIGHT / bounds.height);

  return (
    <div style={{ position: "relative", width: CONTENT_WIDTH, height: CONTENT_HEIGHT, flexShrink: 0, overflow: "hidden", background: "white" }}>
      <Image
        src={image.src}
        alt=""
        width={image.width}
        height={image.height}
        sizes="128px"
        style={{
          position: "absolute",
          maxWidth: "none",
          width: image.width * scale,
          height: image.height * scale,
          left: (CONTENT_WIDTH - bounds.width * scale) / 2 - bounds.x * scale,
          top: (CONTENT_HEIGHT - bounds.height * scale) / 2 - bounds.y * scale
        }}
      />
    </div>
  );
}

