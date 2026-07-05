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


// safeText strips all HTML markup from an untrusted string, returning only its
// plain text. Safe for HTML element-text contexts only -- not attributes or JS.
export function safeText(value: string) {

	// Parse with the browser's own HTML parser rather than a regex, which avoids
	// the well-known tag-matching bypasses, then read back the plain text.
	const parser = new DOMParser()
	const parsed = parser.parseFromString(value, "text/html")
	return parsed.body.textContent || ""
}

// safeURL returns an untrusted URL only if it uses an http(s) scheme, else "".
// Blocks "javascript:"/"data:" sinks; the result is also attribute-safe.
export function safeURL(value: string) {

	if (value == "") {
		return ""
	}

	// Scheme-check via the URL parser (not a regex). The returned URL.href is
	// percent-encoded, so it is also safe inside a double-quoted HTML attribute.
	let parsed: URL
	try {
		parsed = new URL(value, document.baseURI)
	} catch {
		return ""
	}

	switch (parsed.protocol) {
		case "http:":
		case "https:":
			return parsed.href
	}

	return ""
}

// safeAttr entity-encodes an untrusted string for an HTML attribute value, so
// it cannot break out of a quoted attribute. Not a URL (use safeURL) or JS guard.
export function safeAttr(value: string) {

	// Encode the characters significant inside a double- or single-quoted
	// attribute: & opens an entity, < > close the tag, and " ' close the value.
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll("\"", "&quot;")
		.replaceAll("'", "&#39;")
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
