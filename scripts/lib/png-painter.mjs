// 纯 Node PNG 编码器与绘图基元（无第三方依赖）
// 真彩色 RGB（color type 2），每行 filter 0，zlib 压缩
// 画布坐标原点在左上，y 向下；颜色统一用 [r,g,b] 0..255

import zlib from "node:zlib";

const CRC_TABLE = (() => {
	const table = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		table[n] = c >>> 0;
	}
	return table;
})();

function crc32(buf) {
	let crc = 0xffffffff;
	for (let i = 0; i < buf.length; i++) {
		crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
	}
	return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
	const length = Buffer.alloc(4);
	length.writeUInt32BE(data.length, 0);
	const typeBuf = Buffer.from(type, "ascii");
	const crcBuf = Buffer.alloc(4);
	crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
	return Buffer.concat([length, typeBuf, data, crcBuf]);
}

/** RGBA 像素缓冲 → PNG Buffer */
export function encodePng(width, height, rgba) {
	const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(width, 0);
	ihdr.writeUInt32BE(height, 4);
	ihdr[8] = 8; // bit depth
	ihdr[9] = 6; // color type: RGBA
	ihdr[10] = 0; // compression
	ihdr[11] = 0; // filter
	ihdr[12] = 0; // interlace

	const stride = width * 4;
	const raw = Buffer.alloc((stride + 1) * height);
	for (let y = 0; y < height; y++) {
		const rowStart = y * (stride + 1);
		raw[rowStart] = 0; // filter: none
		rgba.copy(raw, rowStart + 1, y * stride, (y + 1) * stride);
	}

	const idat = zlib.deflateSync(raw, { level: 9 });
	return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

/** 带绘图基元的画布 */
export class Canvas {
	constructor(width, height, bg = [0, 0, 0, 255]) {
		this.width = width;
		this.height = height;
		this.data = Buffer.alloc(width * height * 4);
		if (bg) this.fillAll(bg);
	}

	fillAll(color) {
		const [r, g, b, a] = color;
		for (let i = 0; i < this.data.length; i += 4) {
			this.data[i] = r;
			this.data[i + 1] = g;
			this.data[i + 2] = b;
			this.data[i + 3] = a;
		}
	}

	setPx(x, y, color) {
		x = Math.round(x);
		y = Math.round(y);
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
		const i = (y * this.width + x) * 4;
		this.data[i] = color[0];
		this.data[i + 1] = color[1];
		this.data[i + 2] = color[2];
		this.data[i + 3] = color[3] ?? 255;
	}

	fillRect(x0, y0, x1, y1, color) {
		const left = Math.min(x0, x1);
		const right = Math.max(x0, x1);
		const top = Math.min(y0, y1);
		const bottom = Math.max(y0, y1);
		for (let y = Math.max(0, Math.floor(top)); y <= Math.min(this.height - 1, Math.ceil(bottom)); y++) {
			for (let x = Math.max(0, Math.floor(left)); x <= Math.min(this.width - 1, Math.ceil(right)); x++) {
				this.setPx(x, y, color);
			}
		}
	}

	strokeRect(x0, y0, x1, y1, thickness, color) {
		for (let t = 0; t < thickness; t++) {
			const xa = x0 + t;
			const xb = x1 - t;
			const ya = y0 + t;
			const yb = y1 - t;
			if (xb < xa || yb < ya) break;
			for (let x = xa; x <= xb; x++) {
				this.setPx(x, ya, color);
				this.setPx(x, yb, color);
			}
			for (let y = ya; y <= yb; y++) {
				this.setPx(xa, y, color);
				this.setPx(xb, y, color);
			}
		}
	}

	fillCircle(cx, cy, r, color) {
		const r2 = r * r;
		for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
			for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
				const dx = x - cx;
				const dy = y - cy;
				if (dx * dx + dy * dy <= r2) this.setPx(x, y, color);
			}
		}
	}

	strokeCircle(cx, cy, r, thickness, color) {
		for (let t = 0; t < thickness; t++) {
			const rr = r - t;
			const r2 = rr * rr;
			for (let y = Math.floor(cy - rr - 1); y <= Math.ceil(cy + rr + 1); y++) {
				for (let x = Math.floor(cx - rr - 1); x <= Math.ceil(cx + rr + 1); x++) {
					const dx = x - cx;
					const dy = y - cy;
					const d2 = dx * dx + dy * dy;
					if (d2 <= r2 && d2 > (rr - 1.2) * (rr - 1.2)) this.setPx(x, y, color);
				}
			}
		}
	}

	/** 三角形填充（扫描线，顶点任意顺序） */
	fillTriangle(x1, y1, x2, y2, x3, y3, color) {
		const minX = Math.max(0, Math.floor(Math.min(x1, x2, x3)));
		const maxX = Math.min(this.width - 1, Math.ceil(Math.max(x1, x2, x3)));
		const minY = Math.max(0, Math.floor(Math.min(y1, y2, y3)));
		const maxY = Math.min(this.height - 1, Math.ceil(Math.max(y1, y2, y3)));
		const den = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
		if (Math.abs(den) < 1e-9) return;
		for (let y = minY; y <= maxY; y++) {
			const py = y + 0.5;
			for (let x = minX; x <= maxX; x++) {
				const px = x + 0.5;
				const a = ((y2 - y3) * (px - x3) + (x3 - x2) * (py - y3)) / den;
				const b = ((y3 - y1) * (px - x3) + (x1 - x3) * (py - y3)) / den;
				const g = 1 - a - b;
				if (a >= 0 && b >= 0 && g >= 0) this.setPx(x, y, color);
			}
		}
	}

	/** 等腰三角形（顶点在顶部，底边两点在下方） */
	fillTriangleLike(cx, topY, xl, yBase, xr, yb2, color) {
		this.fillTriangle(cx, topY, xl, yBase, xr, yb2, color);
	}

	/** 椭圆描边 */
	strokeEllipse(cx, cy, rx, ry, thickness, color) {
		for (let t = 0; t < thickness; t++) {
			const rrx = Math.max(0, rx - t);
			const rry = Math.max(0, ry - t);
			const inner = Math.max(0, (rrx - 1.4) / Math.max(0.001, rrx)) ** 2;
			const innery = Math.max(0, (rry - 1.4) / Math.max(0.001, rry)) ** 2;
			for (let y = Math.floor(cy - rry - 1); y <= Math.ceil(cy + rry + 1); y++) {
				for (let x = Math.floor(cx - rrx - 1); x <= Math.ceil(cx + rrx + 1); x++) {
					const dx = (x - cx) / Math.max(0.001, rrx);
					const dy = (y - cy) / Math.max(0.001, rry);
					const d2 = dx * dx + dy * dy;
					if (d2 <= 1 && d2 > Math.min(inner, innery) * 0.85) this.setPx(x, y, color);
				}
			}
		}
	}

	fillEllipse(cx, cy, rx, ry, color) {
		for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
			for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
				const dx = (x - cx) / rx;
				const dy = (y - cy) / ry;
				if (dx * dx + dy * dy <= 1) this.setPx(x, y, color);
			}
		}
	}

	/** 竖直渐变：从 y0 的 top 色到 y1 的 bottom 色 */
	vGradient(x0, x1, y0, y1, top, bottom) {
		for (let y = Math.round(y0); y <= Math.round(y1); y++) {
			const t = y1 === y0 ? 0 : (y - y0) / (y1 - y0);
			const color = [
				Math.round(top[0] + (bottom[0] - top[0]) * t),
				Math.round(top[1] + (bottom[1] - top[1]) * t),
				Math.round(top[2] + (bottom[2] - top[2]) * t),
			];
			for (let x = Math.round(x0); x <= Math.round(x1); x++) {
				this.setPx(x, y, color);
			}
		}
	}

	/** 等腰梯形（水平方向）：顶边在 y0 从 [x0a,x0b]，底边在 y1 从 [x1a,x1b] */
	fillTrapezoid(x0a, x0b, x1a, x1b, y0, y1, color) {
		for (let y = Math.round(y0); y <= Math.round(y1); y++) {
			const t = y1 === y0 ? 0 : (y - y0) / (y1 - y0);
			const xa = x0a + (x1a - x0a) * t;
			const xb = x0b + (x1b - x0b) * t;
			for (let x = Math.round(Math.min(xa, xb)); x <= Math.round(Math.max(xa, xb)); x++) {
				this.setPx(x, y, color);
			}
		}
	}

	/** 水平线段 */
	hLine(x0, x1, y, color) {
		for (let x = Math.round(Math.min(x0, x1)); x <= Math.round(Math.max(x0, x1)); x++) {
			this.setPx(x, y, color);
		}
	}

	vLine(x, y0, y1, color) {
		for (let y = Math.round(Math.min(y0, y1)); y <= Math.round(Math.max(y0, y1)); y++) {
			this.setPx(x, y, color);
		}
	}

	toPng() {
		return encodePng(this.width, this.height, this.data);
	}
}
