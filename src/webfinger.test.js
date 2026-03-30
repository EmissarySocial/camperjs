import { test, expect } from "vitest"
import { WebFinger } from "./webfinger"

test("WebFinger should construct the correct WebFinger URL for a given user and server", () => {
	const result = WebFinger.getUrl("benpate@benpate.dev")
	expect(result).toBe("https://benpate.dev/.well-known/webfinger?resource=acct:benpate@benpate.dev")
})

test("WebFinger should construct the correct WebFinger URL for a given Fediverse handle", () => {
	const result = WebFinger.getUrl("@benpate@benpate.dev")
	expect(result).toBe("https://benpate.dev/.well-known/webfinger?resource=acct:benpate@benpate.dev")
})

test("WebFinger should return null for an invalid username", () => {
	const result = WebFinger.getUrl("invalidusername")
	expect(result).toBeNull()
})

test("WebFinger should return null for a username with too many @ symbols", () => {
	const result = WebFinger.getUrl("@too@many@ats")
	expect(result).toBeNull()
})

test ("WebFinger should retrieve correct metadata for a valid user", async () => {
	const result = await WebFinger.getMetadata("benpate@mastodon.social")
	expect(result).not.toBeNull()
	console.log(result)
})