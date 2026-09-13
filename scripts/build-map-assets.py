from __future__ import annotations

import math
import shutil
from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = PROJECT_ROOT.parent
PUBLIC_MAPS = PROJECT_ROOT / "public" / "maps"
TILE_ROOT = PUBLIC_MAPS / "tiles" / "oblique-depth"
STORE_ROOT = PUBLIC_MAPS / "stores"

BACKGROUND_SOURCE = WORKSPACE_ROOT / "map-background-8000-oblique-depth.png"
BACKGROUND_DEST = PUBLIC_MAPS / "map-background-8000-oblique-depth.png"
SHOP_SOURCE_ROOT = WORKSPACE_ROOT / "各店舗柔らかめ"

TILE_SIZE = 512
LEVELS = [
    (0, 500),
    (1, 1000),
    (2, 2000),
    (3, 4000),
    (4, 8000),
]

SHOP_IMAGES = {
    "kirinji": "きりん寺.png",
    "kokoro": "こころ.png",
    "kirameki": "キラメキ.png",
    "toriton": "とりとん.png",
    "kandai": "関西大学.png",
    "kenpei": "憲兵屋.png",
    "suzume": "雀.png",
    "semi": "蝉.png",
    "butafuku": "豚福-Photoroom.png",
    "musou": "武双屋-Photoroom.png",
}


def reset_dir(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def build_tiles() -> None:
    if not BACKGROUND_SOURCE.exists():
        raise FileNotFoundError(f"Missing background: {BACKGROUND_SOURCE}")

    PUBLIC_MAPS.mkdir(parents=True, exist_ok=True)
    shutil.copy2(BACKGROUND_SOURCE, BACKGROUND_DEST)

    reset_dir(TILE_ROOT)
    source = Image.open(BACKGROUND_SOURCE).convert("RGB")

    for z, size in LEVELS:
        level_dir = TILE_ROOT / f"z{z}"
        level_dir.mkdir(parents=True, exist_ok=True)
        level = source.resize((size, size), Image.Resampling.LANCZOS)
        cols = math.ceil(size / TILE_SIZE)
        rows = math.ceil(size / TILE_SIZE)

        for y in range(rows):
            for x in range(cols):
                left = x * TILE_SIZE
                top = y * TILE_SIZE
                right = min(left + TILE_SIZE, size)
                bottom = min(top + TILE_SIZE, size)
                tile = level.crop((left, top, right, bottom))
                tile.save(level_dir / f"{x}-{y}.webp", "WEBP", quality=90, method=6)


def build_store_assets() -> None:
    STORE_ROOT.mkdir(parents=True, exist_ok=True)

    for asset_id, filename in SHOP_IMAGES.items():
        source_path = SHOP_SOURCE_ROOT / filename
        if not source_path.exists():
            raise FileNotFoundError(f"Missing shop image: {source_path}")

        image = Image.open(source_path).convert("RGBA")
        image.save(STORE_ROOT / f"{asset_id}-map.webp", "WEBP", quality=92, method=6, lossless=False)


def main() -> None:
    build_tiles()
    build_store_assets()
    print(f"Built map tiles in {TILE_ROOT}")
    print(f"Copied background to {BACKGROUND_DEST}")
    print(f"Built store assets in {STORE_ROOT}")


if __name__ == "__main__":
    main()
