// 极简 glTF 2.0 (GLB) 构建器：立方体盒组 → GLB Buffer
// 结构仿照官方地图中验证过的最小 GLB：共享一个立方体网格，每个盒是独立 material 节点
// 输入 parts: [{ c:[cx,cy,cz] 中心, s:[sx,sy,sz] 尺寸, color:[r,g,b] 0..1, rotY?: 弧度, alpha?: 0..1 }]
// 坐标约定：单元立方体为 [-0.5,0.5]，盒占据 [c-s/2, c+s/2]

const CUBE_POSITIONS = new Float32Array([
	// +X 面
	0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
	// -X 面
	-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
	// +Y 面
	-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
	// -Y 面
	-0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
	// +Z 面
	-0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
	// -Z 面
	-0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
]);

const CUBE_NORMALS = new Float32Array([
	1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
	-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
	0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
	0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
	0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
	0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
]);

const CUBE_INDICES = new Uint16Array([
	0, 1, 2, 0, 2, 3,
	4, 5, 6, 4, 6, 7,
	8, 9, 10, 8, 10, 11,
	12, 13, 14, 12, 14, 15,
	16, 17, 18, 16, 18, 19,
	20, 21, 22, 20, 22, 23,
]);

const POS_BYTES = CUBE_POSITIONS.byteLength; // 288
const NRM_BYTES = CUBE_NORMALS.byteLength; // 288
const IDX_BYTES = CUBE_INDICES.byteLength; // 72
const BIN_BYTES = POS_BYTES + NRM_BYTES + IDX_BYTES; // 648

function quatFromAxisY(rad) {
	const half = rad / 2;
	return [0, Math.sin(half), 0, Math.cos(half)];
}

function pad4(buf, fill) {
	const remainder = buf.length % 4;
	if (remainder === 0) return buf;
	const padded = Buffer.alloc(buf.length + (4 - remainder), fill);
	buf.copy(padded);
	return padded;
}

/** 由盒组构建 GLB Buffer */
export function buildGlb(parts) {
	if (!Array.isArray(parts) || parts.length === 0) {
		throw new Error("buildGlb: parts 不能为空");
	}

	// ---- BIN chunk：位置 + 法线 + 索引，固定偏移 ----
	const bin = Buffer.alloc(BIN_BYTES);
	Buffer.from(CUBE_POSITIONS.buffer).copy(bin, 0);
	Buffer.from(CUBE_NORMALS.buffer).copy(bin, POS_BYTES);
	Buffer.from(CUBE_INDICES.buffer).copy(bin, POS_BYTES + NRM_BYTES);

	// ---- JSON chunk ----
	const gltf = {
		asset: { version: "2.0", generator: "tang-map-generator" },
		scene: 0,
		scenes: [{ nodes: parts.map((_, i) => i) }],
		nodes: parts.map((p, i) => {
			const node = { mesh: i, translation: p.c, scale: p.s };
			if (p.rotY) node.rotation = quatFromAxisY(p.rotY);
			// 节点名会经 GLTFLoader 写入 userData.name；
			// GameRenderer 对名称含 "color" 的网格做房主染色（buildPropertyModel）
			if (p.name) node.name = p.name;
			return node;
		}),
		meshes: parts.map((_, i) => ({
			primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: i }],
		})),
		materials: parts.map((p) => {
			const alpha = p.alpha ?? 1;
			const material = {
				pbrMetallicRoughness: {
					baseColorFactor: [p.color[0], p.color[1], p.color[2], alpha],
					roughnessFactor: 0.8,
					metallicFactor: 0.05,
				},
				doubleSided: true,
			};
			if (alpha < 1) material.alphaMode = "BLEND";
			return material;
		}),
		accessors: [
			{ bufferView: 0, componentType: 5126, count: 24, type: "VEC3", min: [-0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5] },
			{ bufferView: 1, componentType: 5126, count: 24, type: "VEC3" },
			{ bufferView: 2, componentType: 5123, count: 36, type: "SCALAR" },
		],
		bufferViews: [
			{ buffer: 0, byteOffset: 0, byteLength: POS_BYTES, target: 34962 },
			{ buffer: 0, byteOffset: POS_BYTES, byteLength: NRM_BYTES, target: 34962 },
			{ buffer: 0, byteOffset: POS_BYTES + NRM_BYTES, byteLength: IDX_BYTES, target: 34963 },
		],
		buffers: [{ byteLength: BIN_BYTES }],
	};

	const jsonBuf = pad4(Buffer.from(JSON.stringify(gltf), "utf8"), 0x20);
	const binBuf = pad4(bin, 0x00);

	// ---- GLB 组装 ----
	const totalLength = 12 + 8 + jsonBuf.length + 8 + binBuf.length;
	const glb = Buffer.alloc(totalLength);
	let offset = 0;
	glb.writeUInt32LE(0x46546c67, offset); offset += 4; // "glTF"
	glb.writeUInt32LE(2, offset); offset += 4;
	glb.writeUInt32LE(totalLength, offset); offset += 4;

	glb.writeUInt32LE(jsonBuf.length, offset); offset += 4;
	glb.write("JSON", offset, "ascii"); offset += 4;
	jsonBuf.copy(glb, offset); offset += jsonBuf.length;

	glb.writeUInt32LE(binBuf.length, offset); offset += 4;
	glb.write("BIN\0", offset, "binary"); offset += 4;
	binBuf.copy(glb, offset);

	return glb;
}

/** 解析 GLB 头部与两个 chunk，供自检/调试 */
export function parseGlb(buffer) {
	if (buffer.length < 12 || buffer.toString("ascii", 0, 4) !== "glTF") {
		throw new Error("parseGlb: 不是合法的 GLB（magic 不匹配）");
	}
	const version = buffer.readUInt32LE(4);
	const totalLength = buffer.readUInt32LE(8);
	if (version !== 2) throw new Error(`parseGlb: 不支持的 GLB 版本 ${version}`);
	if (totalLength > buffer.length) throw new Error(`parseGlb: 声明长度 ${totalLength} 超过实际 ${buffer.length}`);

	const jsonLength = buffer.readUInt32LE(12);
	const jsonType = buffer.toString("ascii", 16, 20);
	const json = JSON.parse(buffer.toString("utf8", 20, 20 + jsonLength));

	let offset = 20 + jsonLength;
	const binLength = buffer.readUInt32LE(offset);
	const binType = buffer.toString("binary", offset + 4, offset + 8);

	return {
		version,
		totalLength,
		json,
		binLength,
		binType,
		nodeCount: json.nodes?.length ?? 0,
		meshCount: json.meshes?.length ?? 0,
		materialCount: json.materials?.length ?? 0,
		consistent: totalLength === buffer.length && binType === "BIN\0" && binLength === json.buffers?.[0]?.byteLength,
	};
}
