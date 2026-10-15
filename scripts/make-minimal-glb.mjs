// 生成一个最小合法 GLB（glTF Binary），供测试地图的 MapItem 模型资源使用
// GLB = 12B header + chunk0(JSON) [+ chunk1(BIN)]
// JSON 仅声明一个空场景与一个节点，GLTFLoader 可正常解析为 scene。
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

// 最小 glTF 2.0 JSON：无 mesh，但含 asset/scene/nodes，loader 解析安全
const json = {
	asset: { version: "2.0", generator: "minimal-map-test" },
	scene: 0,
	scenes: [{ nodes: [0] }],
	nodes: [{ name: "empty-map-item", translation: [0, 0, 0] }],
};

const jsonStr = JSON.stringify(json);
// JSON chunk 需要 4 字节对齐（空格填充）
const jsonBytes = Buffer.from(jsonStr, "utf8");
const jsonPadLen = (4 - (jsonBytes.length % 4)) % 4;
const jsonChunk = Buffer.concat([jsonBytes, Buffer.alloc(jsonPadLen, 0x20)]); // 0x20 = space

const totalLen = 12 + 8 + jsonChunk.length; // header + chunk header + chunk data
const header = Buffer.alloc(12);
header.write("glTF", 0, "ascii"); // magic
header.writeUInt32LE(2, 4); // version
header.writeUInt32LE(totalLen, 8); // length

const chunkHeader = Buffer.alloc(8);
chunkHeader.writeUInt32LE(jsonChunk.length, 0); // chunk length
chunkHeader.write("JSON", 4, "ascii"); // chunk type

const glb = Buffer.concat([header, chunkHeader, jsonChunk]);

const outDir = join(PROJECT_ROOT, "test-assets");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "empty-map-item.glb");
writeFileSync(outPath, glb);
console.log("GLB 字节数:", glb.byteLength);
console.log("输出:", outPath);

// 自检：前 4 字节应为 glTF
console.log("magic:", glb.toString("ascii", 0, 4), "version:", glb.readUInt32LE(4), "total:", glb.readUInt32LE(8));
