import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

let draco: DRACOLoader | undefined = undefined;

export function getDracoLoader() {
	if (!draco) {
		draco = new DRACOLoader();
		// 用 BASE_URL 拼接绝对路径：dev 下 /monopoly/draco/、生产下 ./draco/
		// 相对路径 "./draco/" 在 Capacitor file:// 协议下会解析失败
		const base = import.meta.env.BASE_URL || "./";
		const normalized = base.endsWith("/") ? base : `${base}/`;
		draco.setDecoderPath(`${normalized}draco/`);
	}
	return draco;
}
