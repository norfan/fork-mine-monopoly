// 2D 插画绘制基元（256×256 RGBA 透明底，供三大主题建筑贴片共用）
// 约定：统一画布坐标 x:0..255(左→右), y:0..255(上→下)；颜色 [r,g,b,a] 0..255
// 建筑约定：地平线 GROUND=196（地面以上部分画在 y<196，投影在 y>=196）

export const GROUND = 196;

/** 线性插色 */
export function mix(a, b, t) {
	return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, 255];
}
export const dim = (c, k) => [c[0] * k, c[1] * k, c[2] * k, 255];
export const lit = (c, k) => [c[0] + (255 - c[0]) * k, c[1] + (255 - c[1]) * k, c[2] + (255 - c[2]) * k, 255];

/** 地基平台（带厚度感的土台） */
export function foundation(c, cx, halfW, top, wall, side) {
	c.fillRect(cx - halfW, top, cx + halfW, GROUND, wall);
	c.fillRect(cx - halfW + 4, GROUND, cx + halfW - 4, GROUND + 6, side);
	c.strokeRect(cx - halfW, top, cx + halfW, GROUND, 2, dim(wall, 0.55));
}

/** 砖/夯土墙纹理 */
export function brickWall(c, x0, x1, y0, y1, base, line, rows = 10, off = true) {
	c.fillRect(x0, y0, x1, y1, base);
	const h = (y1 - y0) / rows;
	for (let r = 0; r < rows; r++) {
		const y = y0 + r * h;
		c.hLine(x0, x1, Math.round(y), dim(base, 0.75));
		const shift = off && r % 2 ? h * 0.5 : 0;
		for (let x = x0 + shift; x < x1; x += 16) {
			c.vLine(Math.round(x), Math.round(y), Math.round(y + h), line ? line : dim(base, 0.88));
		}
	}
}

/** 玻璃幕墙窗格阵列 */
export function glassGrid(c, x0, x1, y0, y1, cols, rows, glass, frame) {
	for (let r = 0; r < rows; r++) {
		for (let k = 0; k < cols; k++) {
			const w = (x1 - x0) / cols;
			const h = (y1 - y0) / rows;
			const x = x0 + k * w + 2;
			const y = y0 + r * h + 2;
			const t = (r * cols + k) / Math.max(1, cols * rows - 1);
			c.fillRect(x, y, x + w - 4, y + h - 4, mix(glass, lit(glass, 0.35), (k % 2 ? 0.3 : 0) + r * 0.1));
			c.strokeRect(x, y, x + w - 4, y + h - 4, 1, frame);
			c.hLine(x, x + w - 4, Math.round(y + h * 0.25), lit(glass, 0.5)); // 高光
			void t;
		}
	}
}

/** 瓦片屋顶（一排半圆瓦当） */
export function tileRoof(c, x0, x1, y, h, tile, ridge) {
	const cx = (x0 + x1) / 2;
	const halfW = (x1 - x0) / 2;
	for (let i = 0; i < 24; i++) {
		const t = i / 23;
		const x = cx - halfW + t * (x1 - x0);
		c.fillCircle(x, y + h * 0.55, halfW * 0.062, tile);
		c.fillCircle(x, y + h * 0.42, halfW * 0.03, lit(tile, 0.3));
	}
	c.fillRect(cx - halfW, y - 3, cx + halfW, y + 2, ridge); // 檐口
	c.fillRect(cx - halfW + 6, y - 6, cx + halfW - 6, y - 2, lit(ridge, 0.25));
}

/** 马头墙（江南） */
export function horseGable(c, cx, top, w, h, wall, ink) {
	c.fillRect(cx - w / 2, top, cx + w / 2, top + h, wall);
	c.strokeRect(cx - w / 2, top, cx + w / 2, top + h, 2, ink);
	c.fillRect(cx - w / 2 - 2, top - 4, cx + w / 2 + 2, top, ink); // 墙头
	c.fillRect(cx - w / 2 + 2, top + 3, cx + w / 2 - 2, top + 6, dim(ink, 0.7));
}

/** 城垛（齿状雉堞） */
export function crenels(c, x0, x1, y, h, wall) {
	for (let x = x0; x < x1; x += 12) {
		c.fillRect(x, y, Math.min(x + 7, x1), y + h, wall);
	}
	c.fillRect(x0 - 2, y - 2, x1 + 2, y + 2, dim(wall, 0.7));
}

/** 圆灯笼（骨架+穗） */
export function lantern(c, cx, cy, r, body, tassel) {
	c.strokeRect(cx - 1, cy - r - 6, cx + 1, cy - r, 1, [60, 40, 20, 255]);
	c.fillCircle(cx, cy, r, body);
	c.fillCircle(cx, cy, r + 2, body); // 简化为厚实球体
	c.fillCircle(cx - r * 0.3, cy - r * 0.3, Math.max(1, r * 0.28), lit(body, 0.5));
	c.strokeRect(cx - r - 1, cy, cx + r + 1, cy + 1, 1, dim(body, 0.5));
	c.fillRect(cx - r + 2, cy + r, cx + r - 2, cy + r + 2, dim(body, 0.6));
	c.fillRect(cx - 1, cy + r, cx + 1, cy + r + 5, tassel);
}

/** 竖旗（旗杆+三角旗面） */
export function banner(c, x, y0, y1, flag, pole) {
	c.vLine(x, y0, y1, pole);
	for (let i = 0; i < 3; i++) {
		c.fillTrapezoid(x + 2, x + 16 - i * 2, x + 4, x + 14, y1 - 26 + i * 3, y1 - 20 + i * 3, flag);
	}
	c.fillCircle(x, y0, 3, lit(pole, 0.4));
}

/** 云朵剪影 */
export function cloud(c, cx, cy, s, tint) {
	for (const [dx, dy, r] of [[-14, 4, 10], [0, -2, 12], [14, 4, 9], [0, 8, 11]]) {
		c.fillEllipse(cx + dx * s, cy + dy * s, r * s, r * 0.72 * s, tint);
	}
}

/** 地面投影（实心深色椭圆带，Canvas 无 alpha 混合，直接用地面色系深色） */
export function shadow(c, cx, halfW, base = [140, 138, 132]) {
	const dark = dim(base, 0.72);
	for (let y = GROUND - 2; y < GROUND + 8; y++) {
		const t = (y - (GROUND - 2)) / 10;
		const w = halfW * (1 - t * 0.35);
		c.hLine(cx - w, cx + w, y, mix(dark, base, t * 0.4));
	}
}

/** 星星/窗火点 */
export function windowLights(c, x0, x1, y0, y1, cols, rows, warm) {
	for (let r = 0; r < rows; r++) {
		for (let k = 0; k < cols; k++) {
			const w = (x1 - x0) / cols;
			const h = (y1 - y0) / rows;
			const x = x0 + k * w + w * 0.3;
			const y = y0 + r * h + h * 0.3;
			if ((r * 7 + k * 3) % 3 === 0) continue;
			c.fillRect(x, y, x + w * 0.34, y + h * 0.36, warm);
		}
	}
}

/** 册页式小招牌（无字，以色带表示） */
export function signStrip(c, x0, x1, y, h, bg, fg, n = 3) {
	c.fillRect(x0, y, x1, y + h, bg);
	c.strokeRect(x0, y, x1, y + h, 1, dim(bg, 0.5));
	for (let i = 0; i < n; i++) {
		const w = (x1 - x0 - 8) / n;
		c.fillRect(x0 + 4 + i * w, y + 3, x0 + 4 + (i + 1) * w - 2, y + h - 3, i % 2 ? fg : lit(fg, 0.25));
	}
}

/** 俯视院落：地面 + 围墙 + 南侧院门（俯视 2D 建筑插画共用） */
export function courtyard(c, x0, x1, y0, y1, ground, wall) {
	c.fillRect(x0, y0, x1, y1, ground);
	const t = 6;
	c.strokeRect(x0, y0, x1, y1, t, wall);
	c.strokeRect(x0 + t, y0 + t, x1 - t, y1 - t, 1, dim(wall, 0.55));
	// 院门（南侧中间开口）
	const gx = Math.round((x0 + x1) / 2);
	c.fillRect(gx - 16, y1 - t, gx + 16, y1, ground);
	c.fillRect(gx - 18, y1 - t - 3, gx - 15, y1, dim(wall, 0.65));
	c.fillRect(gx + 15, y1 - t - 3, gx + 18, y1, dim(wall, 0.65));
	c.fillRect(gx - 15, y1 - t - 3, gx + 15, y1 - t - 1, lit(wall, 0.35)); // 门楣
	return gx;
}

/** 俯视树（树冠圆 + 中心阴） */
export function topTree(c, cx, cy, r, leaf) {
	c.fillCircle(cx, cy, r, leaf);
	c.fillCircle(cx - r * 0.25, cy - r * 0.25, r * 0.55, lit(leaf, 0.2));
	c.fillCircle(cx + r * 0.3, cy + r * 0.3, r * 0.35, dim(leaf, 0.75));
}

/** 俯视旗杆（底座圆 + 杆影） */
export function topPole(c, cx, cy, r, flag, pole) {
	c.fillCircle(cx, cy, r + 2, dim(pole, 0.5));
	c.fillCircle(cx, cy, r, lit(flag, 0.3));
	c.fillCircle(cx, cy, r * 0.5, dim(flag, 0.6));
}
