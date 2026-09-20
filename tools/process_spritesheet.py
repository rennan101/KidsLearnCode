#!/usr/bin/env python3
"""
SpriteSheet Background Remover & Frame Extractor
- Uses edge flood-fill to remove solid white background without erasing white details inside the character.
- Generates alpha-transparent PNGs with soft edge defringing (no white halos).
- Slices frames by grid and exports individual animation frames and a master transparent spritesheet.
"""

import sys
import os
import argparse
from PIL import Image, ImageFilter

def remove_white_background_floodfill(image_path, threshold=240, tolerance=25):
    """
    Flood fills from the outer edges to turn background white to transparent.
    Preserves white fur, eyes and clothes inside the character silhouette.
    """
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Create a mask for visited background pixels
    visited = bytearray(width * height)
    queue = []

    def is_bg(r, g, b):
        # Checks if pixel is close to white
        return r >= threshold and g >= threshold and b >= threshold

    # Seed the flood fill from all 4 borders
    for x in range(width):
        for y in (0, height - 1):
            r, g, b, _ = pixels[x, y]
            if is_bg(r, g, b):
                idx = y * width + x
                visited[idx] = 1
                queue.append((x, y))

    for y in range(height):
        for x in (0, width - 1):
            idx = y * width + x
            if not visited[idx]:
                r, g, b, _ = pixels[x, y]
                if is_bg(r, g, b):
                    visited[idx] = 1
                    queue.append((x, y))

    # BFS Flood fill from outer edges
    head = 0
    while head < len(queue):
        cx, cy = queue[head]
        head += 1

        for dx, dy in ((-1,0), (1,0), (0,-1), (0,1)):
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                nidx = ny * width + nx
                if not visited[nidx]:
                    r, g, b, _ = pixels[nx, ny]
                    if is_bg(r, g, b):
                        visited[nidx] = 1
                        queue.append((nx, ny))

    # Apply transparency to background pixels and defringe edges
    for y in range(height):
        for x in range(width):
            idx = y * width + x
            if visited[idx]:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                # Defringe near-white edge pixels
                r, g, b, a = pixels[x, y]
                if r > 230 and g > 230 and b > 230:
                    # Check if neighbor is transparent
                    has_trans_neighbor = False
                    for dx, dy in ((-1,0), (1,0), (0,-1), (0,1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < width and 0 <= ny < height:
                            if visited[ny * width + nx]:
                                has_trans_neighbor = True
                                break
                    if has_trans_neighbor:
                        # Soften edge opacity
                        avg_bg_diff = 255 - max(r, g, b)
                        alpha_val = int(min(255, max(0, avg_bg_diff * 6)))
                        if alpha_val < 30:
                            pixels[x, y] = (0, 0, 0, 0)
                        else:
                            pixels[x, y] = (r, g, b, alpha_val)

    return img

def slice_spritesheet(img, cols, rows, output_dir, prefix="frame"):
    """
    Slices an image into cols x rows and saves each cell as a trimmed transparent PNG.
    """
    os.makedirs(output_dir, exist_ok=True)
    width, height = img.size
    cell_w = width // cols
    cell_h = height // rows

    frames = []
    for r in range(rows):
        row_frames = []
        for c in range(cols):
            box = (c * cell_w, r * cell_h, (c + 1) * cell_w, (r + 1) * cell_h)
            cell = img.crop(box)
            filename = f"{prefix}_r{r}_c{c}.png"
            filepath = os.path.join(output_dir, filename)
            cell.save(filepath, "PNG")
            row_frames.append(filepath)
        frames.append(row_frames)

    return frames

def main():
    parser = argparse.ArgumentParser(description="Clean background and slice spritesheet")
    parser.add_argument("input", help="Input image file")
    parser.add_argument("output", help="Output transparent PNG file")
    parser.add_argument("--cols", type=int, default=4, help="Number of columns for slicing")
    parser.add_argument("--rows", type=int, default=4, help="Number of rows for slicing")
    parser.add_argument("--slice-dir", help="Directory to save sliced frames")
    parser.add_argument("--prefix", default="sprite", help="Prefix for sliced frames")

    args = parser.parse_args()

    print(f"🔄 Processando remoção de fundo para: {args.input}")
    cleaned_img = remove_white_background_floodfill(args.input)
    
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    cleaned_img.save(args.output, "PNG")
    print(f"✅ Spritesheet com fundo transparente salvo em: {args.output}")

    if args.slice_dir:
        print(f"✂️ Fatiando em grade {args.cols}x{args.rows}...")
        slice_spritesheet(cleaned_img, args.cols, args.rows, args.slice_dir, args.prefix)
        print(f"✅ Frames fatiados salvos em: {args.slice_dir}")

if __name__ == "__main__":
    main()
