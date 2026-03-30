import { type WebFingerResult } from "./types"
import { type IntentsResult } from "./types"
import { WebFinger } from "./webfinger"
import { NodeInfo } from "./nodeinfo"
import { Intents } from "./intents"
import { Actor } from "./as/actor"

type Account = {
	id: string
	name: string
	username: string,
	iconUrl: string,
	intents: IntentsResult,
}

const Camper = {

	// render redraws the UX based on the current account list in localStorage
	render: () => {

		const accounts = Camper.getSavedAccounts()

		// Hide "Loading" indicators
		const loadingIndicators = Array.from(document.getElementsByClassName("camper-loading")) as HTMLElement[]
		loadingIndicators.forEach(element => element.hidden = true);

		// Show/Hide the "Add Account" 
		const addAccountButtons = Array.from(document.getElementsByClassName("camper-add-account")) as HTMLElement[]
		addAccountButtons.forEach(element => {
			element.hidden = (accounts.length >= 3)
			element.blur()
		});

		// Show/Hide the "Add First Account" button
		const addFirstAccountButtons = Array.from(document.getElementsByClassName("camper-add-first-account")) as HTMLElement[]
		addFirstAccountButtons.forEach(element => {
			element.hidden = (accounts.length != 0)
			element.blur()
		});

		// Show/Hide the "Add Another Account" button
		const addAnotherAccountButtons = Array.from(document.getElementsByClassName("camper-add-another-account")) as HTMLElement[]
		addAnotherAccountButtons.forEach(element => {
			element.hidden = (accounts.length == 0)
			element.blur()
		});

		// Show/Hide the "Remove Account" button
		const removeAccountButtons = Array.from(document.getElementsByClassName("camper-remove-accounts")) as HTMLElement[]
		removeAccountButtons.forEach(element => {
			element.hidden = (accounts.length == 0)
		});

		// Enable/Disable the "like" button
		const likeButtons = Array.from(document.getElementsByClassName("camper-btn-like")) as HTMLButtonElement[]
		likeButtons.forEach(element => {
			element.disabled = !(accounts.some(account => account.intents.like != ""))
		});

		// Enable/Disable the "share" button
		const shareButtons = Array.from(document.getElementsByClassName("camper-btn-share")) as HTMLButtonElement[]
		shareButtons.forEach(element => {
			element.disabled = !(accounts.some(account => account.intents.create != ""))
		});

		// Enable/Disable the "announce" button
		const announceButtons = Array.from(document.getElementsByClassName("camper-btn-announce")) as HTMLButtonElement[]
		announceButtons.forEach(element => {
			element.disabled = !(accounts.some(account => account.intents.announce != ""))
		});

		// Draw the account list
		const accountLists = Array.from(document.getElementsByClassName("camper-accounts")) as HTMLElement[]
		accountLists.forEach(element => {

			if (accounts.length == 0) {
				element.innerHTML = ""
				element.hidden = true
				return
			}

			const accountListHTML = accounts.map(account => `
				<div class="camper-account" onclick="Camper.doIntent(this, '${account.username}')">
					<img src="${account.iconUrl}" class="camper-account-icon">
					<div class="camper-account-info">
						<div class="camper-account-name">${account.name}</div>
						<div class="camper-account-username">${account.username}</div>
					</div>
					<button class="camper-account-remove-button" onclick="Camper.removeAccount('${account.username}')">Remove</button>
				</div>
			`).join("")

			element.innerHTML = accountListHTML
			element.hidden = false
		})
	},

	doIntent: (element: HTMLElement, username: string) => {
		const parent = element.parentElement!
		const dataset = parent.dataset

		const intentName = parent.getAttribute("data-intent")

		if (intentName == null) {
			console.error("Unable to determine intent for clicked element. Please ensure the element has a 'data-camper-intent' attribute.")
			return
		}

		const accounts = Camper.getSavedAccounts()
		const account = accounts.find(account => account.username.toLowerCase() == username.toLowerCase())

		if (account == null) {
			return
		}

		var intentTemplate = account.intents[intentName as keyof IntentsResult]
		const matches = intentTemplate.match(/\{[^}]+\}/g) || []
		const placeholders = matches.map(placeholder => placeholder.slice(1, -1))

		for (const placeholder of placeholders) {
			var value = parent.getAttribute("data-" + placeholder) || ""
			value = encodeURIComponent(value)
			intentTemplate = intentTemplate.replaceAll("{" + placeholder + "}", value)
		}

		if (intentTemplate = "") {
			alert("The account you selected does not support this action.")
			return
		}

		window.open(intentTemplate, "_blank", "height=750,width=600")
	},

	// addAccount adds a new account to the list and redraws the UX
	addAccount: async (username: string) => {

		// Show "Loading" indicators
		const loadingIndicators = Array.from(document.getElementsByClassName("camper-loading")) as HTMLElement[]
		loadingIndicators.forEach(element => element.hidden = false);

		// Look up the WebFinger metadata for the provided username
		const webfingerResult = await WebFinger.getMetadata(username)
		if (webfingerResult == null) {
			Camper.render()
			alert("Unable to look up the account you entered.")
			return
		}

		// Load the current account list.
		var accounts = Camper.getSavedAccounts()

		// Exit if the username is already in the list.
		if (accounts.some(account => account.username.toLowerCase() == username.toLowerCase())) {
			Camper.render()
			return
		}

		// Find the actor profile identified by WebFinger.
		const actorId = WebFinger.getActivityPubId(webfingerResult)

		if (actorId == "") {
			Camper.render()
			alert("Unable to retrieve the profile for the account you entered.")
			return
		}

		// Load the actor profile
		const activityPubActor = await new Actor().fromURL(actorId)

		// Add the new account object to localStorage
		accounts.push({
			id: actorId,
			username: username,
			name: activityPubActor.name(),
			iconUrl: activityPubActor.icon(),
			intents: await Intents.getIntentsMap(actorId, webfingerResult),
		})

		// Save the updated account list to localStorage
		localStorage.setItem("camper", JSON.stringify(accounts))

		// Clear input elements
		const shareButtons = Array.from(document.getElementsByClassName("camper-input")) as HTMLInputElement[]
		shareButtons.forEach(element => {
			element.value = ""
		});

		// Redraw the UX
		Camper.render()
	},

	// removeAccount removes an account from the list and redraws the UX
	removeAccount: (username: string) => {

		// Confirm the action before continuing
		if (!confirm('Remove this account from this device?')) {
			return
		}

		// Get all accounts from localStorage
		var accounts = Camper.getSavedAccounts()

		// Remove the named account
		accounts = accounts.filter(account => account.username.toLowerCase() != username.toLowerCase())

		// Save localStorage
		localStorage.setItem("camper", JSON.stringify(accounts))

		// Redraw the UX
		Camper.render()
	},

	// hasSavedAccounts returns TRUE if there is one or more accounts saved in localStorage
	hasSavedAccounts: () => {
		const accounts = Camper.getSavedAccounts()
		return accounts.length > 0
	},

	// getSavedAccounts retrieves the list of accounts from localStorage
	getSavedAccounts: () => {

		const accountsString = localStorage.getItem("camper")
		if (accountsString == null) {
			return []
		}

		return JSON.parse(accountsString) as Account[] || []
	},
}

Camper.render()
