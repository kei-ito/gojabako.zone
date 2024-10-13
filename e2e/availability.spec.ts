import { expect, test } from "@playwright/test";
import { pageList } from "../src/util/pageList.ts";
import { site } from "../src/util/site.ts";

const baseUrl = new URL("http://127.0.0.1:3000");

for (const pageData of pageList) {
	test(pageData.path, async ({ page }, testInfo) => {
		const pageUrl = new URL(pageData.path, baseUrl);
		await page.goto(pageUrl.href);
		let title = `${pageData.title.join("")} | ${site.name}`;
		if (pageData.path === "/") {
			title = site.name;
		}
		await Promise.all([
			expect(page).toHaveTitle(title),
			page.waitForSelector("body>header"),
			page.waitForSelector("body>footer"),
		]);
		const screenshot = await page.screenshot({ fullPage: true });
		await testInfo.attach("screenshot", {
			body: screenshot,
			contentType: "image/png",
		});
	});
}
