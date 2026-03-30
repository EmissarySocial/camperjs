export type WebFingerResult = {
	subject: string
	links: Link[]
}

export type NodeInfoLinks = {
	links: {
		rel: string
		href: string
	}[]
}

export type NodeInfoResult = {
	software: {
		name: string
		version: { major: number, minor: number, patch: number }
		homepage: string
	}
	protocols: string[]
	usage: {
		users: { total: number, activeHalfday: number, activeMonth: number }
		localPosts: number
		localComments: number
	}
}

export type IntentsResult = {
	announce: string
	create: string
	follow: string
	like: string
	object: string
}

export type Link = {
	rel: string
	type?: string
	href?: string
	template?: string
}
