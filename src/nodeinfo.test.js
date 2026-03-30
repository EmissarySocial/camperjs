import { test, expect } from "vitest"
import { NodeInfo } from "./nodeinfo"

test("NodeInfo should find the correct software name for Mastodon", async () => {
	const result = await NodeInfo.getNodeInfo("mastodon.social")
	expect(result?.software?.name).toBe("mastodon")
})

test("NodeInfo should find the correct software name for PixelFed", async () => {
	const result = await NodeInfo.getNodeInfo("pixelfed.social")
	expect(result?.software?.name).toBe("pixelfed")
})

test("NodeInfo should return null for an invalid server", async () => {
	const result = await NodeInfo.getNodeInfo("invalid.server")
	expect(result).toBeNull()
})

test("NodeInfo should return null for a server that doesn't support NodeInfo", async () => {
	const result = await NodeInfo.getNodeInfo("example.com")
	expect(result).toBeNull()
})