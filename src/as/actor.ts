import { Object } from "./object"

// Actor is a wrapper around a JSON object that provides methods for accessing common ActivityPub properties
export class Actor extends Object {
	//

	///////////////////////////////////
	// Property accessors

	// icon returns the value of the "icon" property
	icon = () => {
		return this.getString("as", "icon")
	}

	// id returns the value of the "id" property
	id = () => {
		return this.getString("as", "id")
	}

	// name returns the value of the "name" property
	name = () => {
		return this.getString("as", "name")
	}

	outbox = () => {
		return this.getString("as", "outbox")
	}

	preferredUsername = () => {
		return this.getString("as", "preferredUsername")
	}

	summary = () => {
		return this.getString("as", "summary")
	}

	type = () => {
		return this.getString("as", "type")
	}
}

export async function loadActor(value: any) {
	switch (typeof value) {
		case "string":
			return await new Actor().fromURL(value)

		case "object":
			if (Array.isArray(value)) {
				if (value.length > 0) {
					return loadActor(value[0])
				}
				return new Actor()
			}

			return new Actor(value)
	}

	return new Actor()
}
