import Image from "next/image";

export type StoreThumbnailImage = {
  src: string;
  width: number;
  height: number;
  bounds: { x: number; y: number; width: number; height: number };
};

const CROP_SIZE = 78;

export function StoreThumbnail({ image }: { image: StoreThumbnailImage }) {
  const { bounds } = image;
  // Cover the square using the building bounds, not the original canvas.
  const scale = Math.max(CROP_SIZE / bounds.width, CROP_SIZE / bounds.height);

  return (
    <div style={{ position: "relative", width: CROP_SIZE, height: CROP_SIZE, overflow: "hidden", background: "white" }}>
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
          left: (CROP_SIZE - bounds.width * scale) / 2 - bounds.x * scale,
          top: (CROP_SIZE - bounds.height * scale) / 2 - bounds.y * scale
        }}
      />
    </div>
  );
}

