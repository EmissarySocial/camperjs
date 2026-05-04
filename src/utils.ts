// guessProtocol is a helper function to guess the correct protocol 
// to use (http or https) based on the server name
export function guessProtocol(server: string) {

	switch (server) {
		case "localhost":
		case "127.0.0.1":
			return "http://"
	}

	return "https://"
}

export function getPlaceholders(template: string) {
	const matches = template.match(/\{([^}]+)\}/g) || []
	return matches.map(placeholder => placeholder.slice(1, -1))
}


export function hideElement(element: HTMLElement, hide: boolean) {
	if (hide) {
		element.hidden = true
		element.style.display = "none"
	} else {
		element.hidden = false
		element.style.display = ""
	}
}
