import { type NodeInfoLinks } from "./types"
import { type NodeInfoResult } from "./types"
import { guessProtocol } from "./utils"

// NodeInfo retrieves NodeInfo metadata from a provided server
export class NodeInfo {

	static getSoftwareName = async (server: string): Promise<string> => {

		const nodeInfo = await this.getNodeInfo(server)
		if (nodeInfo == null) {
			return ""
		}

		return nodeInfo?.software?.name || ""
	}

	static getNodeInfo = async (server: string): Promise<NodeInfoResult | null> => {

		const url = await this.#getNodeInfoUrl(server)

		if (url == null) {
			return null
		}

		try {
			const response = await fetch(url)
			if (response.ok) {
				return await response.json()
			}
			console.error("NodeInfo request failed with status " + response.status)
		} catch (error: any) {
			console.error("NodeInfo request failed with error: " + error)
		}

		return null

	}

	static #getNodeInfoUrl = async (server: string) => {

		try {
			const url = guessProtocol(server) + server + "/.well-known/nodeinfo"

			const response = await fetch(url)

			if (response.ok) {
				const result: NodeInfoLinks = await response.json()

				return result?.links.at(0)?.href || null
			}

			console.error("NodeInfo request failed with status " + response.status)
			return null

		} catch (error: any) {
			console.error("NodeInfo request failed with error: " + error)
			return null
		}
	}
}
