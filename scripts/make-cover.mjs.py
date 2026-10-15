# 生成离线内置地图封面 PNG（640x360，带标题文字）
# 输出: apps/client/public/offline-maps/cover-minimal-8.png
import io, base64
from PIL import Image, ImageDraw, ImageFont

W, H = 640, 360
img = Image.new("RGB", (W, H), "#2b3a55")
d = ImageDraw.Draw(img)

# 渐变背景
for y in range(H):
    t = y / H
    r = int(43 + (139 - 43) * t)
    g = int(58 + (90 - 58) * t)
    b = int(85 + (43 - 85) * t)
    d.line([(0, y), (W, y)], fill=(r, g, b))

# 顶部色条
d.rectangle([0, 0, W, 8], fill="#e8b04b")

# 找可用字体
def load_font(size):
    for path in [
        "C:/Windows/Fonts/msyh.ttc", "C:/Windows/Fonts/msyhbd.ttc",
        "C:/Windows/Fonts/simhei.ttf", "C:/Windows/Fonts/simsun.ttc",
    ]:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()

f_title = load_font(56)
f_sub = load_font(28)

# 标题文字
title = "离线测试地图"
d.text((W//2, 150), title, font=f_title, fill="#ffffff", anchor="mm")
sub = "8 格闭环 · 单角色 · 离线桌游"
d.text((W//2, 230), sub, font=f_sub, fill="#ffd98a", anchor="mm")

# 底部作者
d.text((W//2, 320), "MineMonopoly Offline Builtin", font=f_sub, fill="#9fb2d0", anchor="mm")

buf = io.BytesIO()
img.save(buf, format="PNG")
b64 = base64.b64encode(buf.getvalue()).decode()
print("PNG bytes:", len(buf.getvalue()))
print("BASE64_LEN:", len(b64))

import os
out_dir = r"F:\Workspace\Trea\fork-project\fork-mine-monopoly\apps\client\public\offline-maps"
os.makedirs(out_dir, exist_ok=True)
with open(os.path.join(out_dir, "cover-minimal-8.png"), "wb") as f:
    f.write(buf.getvalue())
print("written:", os.path.join(out_dir, "cover-minimal-8.png"))

# 输出 base64 供脚本嵌入
with open(r"F:\Workspace\Trea\fork-project\fork-mine-monopoly\scripts\cover-b64.txt", "w") as f:
    f.write(b64)
print("base64 saved")
