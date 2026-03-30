import { test, expect } from "vitest"
import { guessProtocol, getPlaceholders } from "./utils"

test("guessProtocol should return http:// for local domains", () => {
	expect(guessProtocol("localhost")).toBe("http://")
	expect(guessProtocol("127.0.0.1")).toBe("http://")
})

test("guessProtocol should return https:// for remote domains", () => {
	expect(guessProtocol("mastodon.social")).toBe("https://")
	expect(guessProtocol("misskey.io")).toBe("https://")
})


test("should extract placeholders from templates correctly", () => {
	const template = "https://example.com/{username}/follow?object={object}"
	const placeholders = getPlaceholders(template)
	expect(placeholders).toEqual(["username", "object"])
})