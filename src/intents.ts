import { type WebFingerResult } from "./types"
import { type IntentsResult } from "./types"
import { NodeInfo } from "./nodeinfo"

export class Intents {

	// getIntentsMap retrieves the available Activity Intents templates for the provided data
	static getIntentsMap = async (server: string, webfingerResult: WebFingerResult) => {

		var found = false
		var result: IntentsResult = {
			announce: "",
			create: "",
			follow: "",
			like: "",
			object: ""
		}

		// Safely find the array of links
		const links = webfingerResult.links || []

		// Scan each link for known intents
		for (const link of links) {

			var relation = link.rel || ""
			var template = link.template || link.href || ""

			switch (relation.toLowerCase()) {

				case "https://w3id.org/fep/3b86/announce":
					result.announce = template
					found = true;
					continue

				case "https://w3id.org/fep/3b86/create":
					result.create = template
					found = true;
					continue

				case "https://w3id.org/fep/3b86/follow":
					result.follow = template
					found = true;
					continue

				case "https://w3id.org/fep/3b86/like":
					result.like = template
					found = true;
					continue

				case "https://w3id.org/fep/3b86/object":
					result.object = template
					found = true
					continue

				case "http://ostatus.org/schema/1.0/subscribe":
				case "https://ostatus.org/schema/1.0/subscribe":

					// Special case to map OStatus "remote follows" into the `Follow` intent
					if (result.follow == "") {
						result.follow = template.replaceAll("{uri}", "{object}")
					}
					continue
			}
		}

		// If the server returns Activity Intents templates, then use them
		if (found) {

			if (result.follow == "") {
				result.follow = result.object
			}

			if (result.like == "") {
				result.like = result.object
			}

			if (result.announce == "") {
				result.announce = result.object
			}

			return result
		}

		// Otherwise, try to sniff the server for known endpoints
		const softwareName = await NodeInfo.getSoftwareName(server)

		// If we can recognize the software, then fill in known endpoints
		switch (softwareName.toLowerCase()) {

			case "diaspora":
				result.create = server + "/bookmarklet?title={name}&notes={content}&url={inReplyTo}"
				break

			case "friendica":
				result.create = server + "/compose?title={name}&body={content}"
				break

			case "glitchcafe":
				result.create = server + "/share?text={content}"
				break

			case "gnusocial":
				result.create = server + "/notice/new?status_textarea={content}"
				break

				result.create = server + "/share?text={content}"
				break

			case "hubzilla":
				result.create = server + "/rpost?title={name}&body={content}"
				break

			case "mastodon":
			case "hometown":
				result.create = server + "/share?text={content}"
				result.object = server + "/authorize_interaction?uri={object}"
				break

			case "misskey":
			case "calckey":
			case "fedibird":
			case "firefish":
			case "foundkey":
			case "meisskey":
				result.create = server + "/share?text={content}"
				break

			case "microdotblog":
				result.create = server + "/post?text=[{name}]({inReplyTo})%0A%0A{content}"
				break
		}

		return result
	}
}
