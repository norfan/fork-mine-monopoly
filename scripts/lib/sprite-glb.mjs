// 2D 贴片 GLB 构建器：带 PNG 纹理的竖直平面（双面）+ 可选纯色小盒（房主染色）
// parts: [{ kind:"sprite", tex:{png,w,h}, c:[x,y,z], s:[w,h], rotY?, rotX?, tint?:[r,g,b] 0..1, alpha? }
//         { kind:"cube",   c:[x,y,z], s:[w,h,d], color:[r,g,b], name? }]
// 几何共享：单位平面 [-0.5,0.5]^2（面朝 +Z）+ 单位立方体；额外部分只有纹理 PNG bufferView
// rotX=-PI/2 时平面躺平（法线朝上），用于俯视 2D 场景的地面贴片

const PPOS = Buffer.from(new Float32Array([
	-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0,
]).buffer);
const PNRM = Buffer.from(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]).buffer);
// glTF UV 原点左上：v=0 对应图片首行（顶部）
const PUV = Buffer.from(new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]).buffer);
const PIDX = Buffer.from(new Uint16Array([0, 1, 2, 0, 2, 3]).buffer);

const CPOS = Buffer.from(new Float32Array([
	0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
	-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
	-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
	-0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
	-0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
	-0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
]).buffer);
const CUV = Buffer.from(new Float32Array([
	0, 1, 0, 0, 1, 0, 1, 1,
	1, 1, 1, 0, 0, 0, 0, 1,
	0, 1, 0, 0, 1, 0, 1, 1,
	1, 1, 1, 0, 0,0, 0, 1,
	0, 1, 0, 0, 1, 0, 1, 1,
	1, 1, 1, 0, 0, 0, 0, 1,
]).buffer);
const CIDX = Buffer.from(new Uint16Array([
	0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11,
	12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
]).buffer);

const P_POS = 0, P_NRM = 1, P_UV = 2, P_IDX = 3;
const C_POS = 4, C_UV = 5, C_IDX = 6;
const O_PLANE_POS = 0;
const O_PLANE_NRM = PPOS.length;
const O_PLANE_UV = O_PLANE_NRM + PNRM.length;
const O_PLANE_IDX = O_PLANE_UV + PUV.length;
const O_CUBE_POS = O_PLANE_IDX + PIDX.length;
const O_CUBE_UV = O_CUBE_POS + CPOS.length;
const O_CUBE_IDX = O_CUBE_UV + CUV.length;
const HEAD = O_CUBE_IDX + CIDX.length;

function pad4(buf, fill) {
	const r = buf.length % 4;
	if (r === 0) return buf;
	const padded = Buffer.alloc(buf.length + (4 - r), fill);
	buf.copy(padded);
	return padded;
}
function quatY(rad) {
	const h = rad / 2;
	return [0, Math.sin(h), 0, Math.cos(h)];
}
function quatX(rad) {
	const h = rad / 2;
	return [Math.sin(h), 0, 0, Math.cos(h)];
}

/** 由贴片/小盒混合 parts 构建 GLB */
export function buildSpriteGlb(parts) {
	if (!Array.isArray(parts) || parts.length === 0) {
		throw new Error("buildSpriteGlb: parts 不能为空");
	}
	const sprites = parts.map((p, i) => (p.kind === "sprite" ? i : -1)).filter((i) => i >= 0);
	const texPngs = sprites.map((i) => pad4(Buffer.from(parts[i].tex.png), 0));

	const headBuf = Buffer.concat([PPOS, PNRM, PUV, PIDX, CPOS, CUV, CIDX]);
	const binBuf = Buffer.concat([headBuf, ...texPngs]);

	const bufferViews = [
		{ buffer: 0, byteOffset: O_PLANE_POS, byteLength: PPOS.length },
		{ buffer: 0, byteOffset: O_PLANE_NRM, byteLength: PNRM.length },
		{ buffer: 0, byteOffset: O_PLANE_UV, byteLength: PUV.length },
		{ buffer: 0, byteOffset: O_PLANE_IDX, byteLength: PIDX.length, target: 34963 },
		{ buffer: 0, byteOffset: O_CUBE_POS, byteLength: CPOS.length },
		{ buffer: 0, byteOffset: O_CUBE_UV, byteLength: CUV.length },
		{ buffer: 0, byteOffset: O_CUBE_IDX, byteLength: CIDX.length, target: 34963 },
	];
	const accessors = [
		{ bufferView: P_POS, componentType: 5126, count: 4, type: "VEC3", min: [-0.5, -0.5, 0], max: [0.5, 0.5, 0] },
		{ bufferView: P_NRM, componentType: 5126, count: 4, type: "VEC3" },
		{ bufferView: P_UV, componentType: 5126, count: 4, type: "VEC2" },
		{ bufferView: P_IDX, componentType: 5123, count: 6, type: "SCALAR" },
		{ bufferView: C_POS, componentType: 5126, count: 24, type: "VEC3", min: [-0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5] },
		{ bufferView: C_UV, componentType: 5126, count: 24, type: "VEC2" },
		{ bufferView: C_IDX, componentType: 5123, count: 36, type: "SCALAR" },
	];

	// 纹理 bufferView / image / texture 追加
	const images = [];
	const textures = [];
	texPngs.forEach((png, n) => {
		bufferViews.push({ buffer: 0, byteOffset: HEAD + texPngs.slice(0, n).reduce((a, b) => a + b.length, 0), byteLength: png.length });
		images.push({ bufferView: bufferViews.length - 1, mimeType: "image/png" });
		textures.push({ sampler: 0, source: n });
	});

	const nodes = [];
	const meshes = [];
	const materials = [];
	let texCursor = 0;
	parts.forEach((p) => {
		const isCube = p.kind === "cube";
		if (isCube) {
			const a = p.alpha ?? 1;
			const m = {
				pbrMetallicRoughness: {
					baseColorFactor: [p.color[0], p.color[1], p.color[2], a],
					roughnessFactor: 0.8,
					metallicFactor: 0.05,
				},
				doubleSided: true,
			};
			if (a < 1) m.alphaMode = "BLEND";
			materials.push(m);
		} else {
			const tint = p.tint ?? [1, 1, 1];
			const a = p.alpha ?? 1;
			materials.push({
				pbrMetallicRoughness: {
					baseColorFactor: [tint[0], tint[1], tint[2], a],
					roughnessFactor: 0.85,
					metallicFactor: 0.0,
					baseColorTexture: { index: texCursor++, texCoord: 0 },
				},
				doubleSided: true,
			});
		}
		const node = {
			mesh: nodes.length,
			translation: p.c,
			scale: isCube ? p.s : [p.s[0], p.s[1], 1],
		};
		if (p.rotY) node.rotation = quatY(p.rotY);
		if (p.rotX) node.rotation = quatX(p.rotX);
		if (isCube && p.name) node.name = p.name;
		nodes.push(node);
		meshes.push({
			primitives: [{
				attributes: isCube
					? { POSITION: C_POS, TEXCOORD_0: C_UV }
					: { POSITION: P_POS, NORMAL: P_NRM, TEXCOORD_0: P_UV },
				indices: isCube ? C_IDX : P_IDX,
				material: materials.length - 1,
			}],
		});
	});

	const gltf = {
		asset: { version: "2.0", generator: "sprite-2d-generator" },
		scene: 0,
		scenes: [{ nodes: nodes.map((_, i) => i) }],
		nodes,
		meshes,
		materials,
		accessors,
		bufferViews,
		samplers: [{ magFilter: 9729, minFilter: 9729, wrapS: 33071, wrapT: 33071 }],
		images,
		textures,
		buffers: [{ byteLength: binBuf.length }],
	};

	const jsonBuf = pad4(Buffer.from(JSON.stringify(gltf), "utf8"), 0x20);
	const binChunk = pad4(binBuf, 0x00);
	const total = 12 + 8 + jsonBuf.length + 8 + binChunk.length;
	const glb = Buffer.alloc(total);
	let o = 0;
	glb.writeUInt32LE(0x46546c67, o); o += 4;
	glb.writeUInt32LE(2, o); o += 4;
	glb.writeUInt32LE(total, o); o += 4;
	glb.writeUInt32LE(jsonBuf.length, o); o += 4;
	glb.write("JSON", o, "ascii"); o += 4;
	jsonBuf.copy(glb, o); o += jsonBuf.length;
	glb.writeUInt32LE(binChunk.length, o); o += 4;
	glb.write("BIN\0", o, "binary"); o += 4;
	binChunk.copy(glb, o);
	return glb;
}
