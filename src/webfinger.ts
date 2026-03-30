import { guessProtocol } from "./utils"
import { type WebFingerResult } from "./types"

export class WebFinger {

	static getMetadata = async (username: string) => {

		// Figure out the URL to contact
		const url = this.getUrl(username)
		if (url == null) {
			return null
		}

		// Request WebFinger metadata from the server
		const response = await fetch(url)
		if (!response.ok) {
			console.error("WebFinger request failed with status " + response.status)
			return null
		}

		// Parse the JSON response
		const result = await response.json()
		return result
	}

	// getActivityPubId retrieves user's ActivityPub Actor ID from WebFinger metadata
	static getActivityPubId = (webfingerResult: WebFingerResult) => {

		// Safely find the array of links
		const links = webfingerResult.links || []

		// Check each link in the WebFinger result
		for (const link of links) {

			// Check for the correct relation
			const relation = link.rel || ""
			if (relation.toLowerCase() == "self") {

				// Check for the correct type
				const linkType = link.type || ""
				if (linkType.toLowerCase() == "application/activity+json") {

					// Success!
					return link.href || ""
				}
			}
		}

		// Failure.
		return ""
	}

	// getUrl constructs the well-known WebFinger URL to look up the provided username
	static getUrl = (username: string) => {

		// Get the parts of the Username
		const [user, server] = this.splitUsername(username)

		if (user == "" || server == "") {
			console.error("Invalid username: " + username)
			return null
		}

		// Construct the WebFinger URL
		const result = guessProtocol(server) + server + "/.well-known/webfinger?resource=acct:" + user + "@" + server
		return result
	}

	// splitUsername splits a WebFinger username into its "user" and "server" parts
	static splitUsername = (username: string): [string, string] => {

		// Remove "@" prefix, if present
		if (username.startsWith("@")) {
			username = username.substring(1)
		}

		// Split username into username and domain
		var parts = username.split("@")
		if (parts.length != 2) {
			console.error(username + " is not a valid username")
			return ["", ""]
		}

		return [parts[0]!, parts[1]!]
	}
}