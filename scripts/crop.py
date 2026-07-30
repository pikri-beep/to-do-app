import os
from PIL import Image

def main():
    img_path = 'public/town_map.png'
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found.")
        return

    img = Image.open(img_path)
    img_w, img_h = img.size
    
    MAP_WIDTH = 20
    MAP_HEIGHT = 12
    tile_w = img_w / MAP_WIDTH
    tile_h = img_h / MAP_HEIGHT

    objects = [
        {'id': 'quest_board', 'x': 3, 'y': 3, 'w': 3, 'h': 2},
        {'id': 'time_wizard', 'x': 13, 'y': 1, 'w': 5, 'h': 4},
        {'id': 'calendar_statue', 'x': 4, 'y': 8, 'w': 2, 'h': 2},
        {'id': 'analytics_tent', 'x': 13, 'y': 7, 'w': 3, 'h': 3}
    ]

    for obj in objects:
        # Bounding box: (left, upper, right, lower)
        left = int(obj['x'] * tile_w)
        upper = int(obj['y'] * tile_h)
        right = int((obj['x'] + obj['w']) * tile_w)
        lower = int((obj['y'] + obj['h']) * tile_h)
        
        cropped = img.crop((left, upper, right, lower))
        
        out_path = f"public/{obj['id']}.png"
        cropped.save(out_path)
        print(f"Saved {out_path} (Size: {cropped.size})")

if __name__ == '__main__':
    main()
