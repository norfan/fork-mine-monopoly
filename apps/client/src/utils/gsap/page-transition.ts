import gsap from "gsap";

/** 动画完成兜底：gsap 依赖 requestAnimationFrame，页面处于后台时 rAF 被暂停，
 * 动画 onComplete 永不触发会导致 Vue Transition 卡死（新组件不挂载）。
 * 正常前台动画在 0.15~0.2s 内完成，不受兜底影响；异常时 600ms 强制完成。 */
function withFallback(animate: (finish: () => void) => void, done: () => void) {
	let finished = false;
	const finish = () => {
		if (finished) return;
		finished = true;
		done();
	};
	const fallback = window.setTimeout(finish, 600);
	animate(() => {
		window.clearTimeout(fallback);
		finish();
	});
}

export function pageEnter(el: Element, done: () => void) {
	withFallback((finish) => {
		gsap.fromTo(
			el,
			{ opacity: 0 },
			{
				opacity: 1,
				duration: 0.2,
				ease: "power2.out",
				willChange: "opacity",
				onComplete: () => {
					gsap.set(el, { clearProps: "willChange" });
					finish();
				},
			},
		);
	}, done);
}

export function pageLeave(el: Element, done: () => void) {
	withFallback((finish) => {
		gsap.to(el, {
			opacity: 0,
			duration: 0.15,
			ease: "power2.in",
			willChange: "opacity",
			onComplete: () => {
				gsap.set(el, { clearProps: "willChange" });
				finish();
			},
		});
	}, done);
}
