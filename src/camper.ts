import { type IntentsResult } from "./types"
import { WebFinger } from "./webfinger"
import { Intents } from "./intents"
import { Actor } from "./as/actor"
import { hideElement } from "./utils"

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

		// Find the saved accounts stored for this user
		const accounts = Camper.getSavedAccounts()

		// Hide "Loading" indicators
		const loadingIndicators = Array.from(document.getElementsByClassName("camper-loading")) as HTMLElement[]
		loadingIndicators.forEach(element => element.hidden = true);

		// Show/Hide the "Add Account" 
		const addAccountButtons = Array.from(document.getElementsByClassName("camper-add-account")) as HTMLElement[]
		addAccountButtons.forEach(element => {
			const maxAccounts = parseInt(element.getAttribute("max-accounts") || element.getAttribute("data-max-accounts") || "3")
			hideElement(element, accounts.length >= maxAccounts)
			element.blur()
		});

		// Show/Hide the "Add First Account" button
		const addFirstAccountButtons = Array.from(document.getElementsByClassName("camper-add-first-account")) as HTMLElement[]
		addFirstAccountButtons.forEach(element => {
			hideElement(element, accounts.length != 0)
			element.blur()
		});

		// Show/Hide elements if the user has accounts
		const hasAccountsShow = Array.from(document.getElementsByClassName("camper-show-if-has-accounts")) as HTMLElement[]
		hasAccountsShow.forEach(element => {
			hideElement(element, accounts.length == 0)
			element.blur()
		});

		// Show/Hide elements if the user has no accounts
		const hasAccountsHide = Array.from(document.getElementsByClassName("camper-hide-if-has-accounts")) as HTMLElement[]
		hasAccountsHide.forEach(element => {
			hideElement(element, accounts.length != 0)
			element.blur()
		});

		// Show/Hide the "Add Another Account" button
		const addAnotherAccountButtons = Array.from(document.getElementsByClassName("camper-add-another-account")) as HTMLElement[]
		addAnotherAccountButtons.forEach(element => {
			hideElement(element, accounts.length == 0)
			element.blur()
		});

		// Show/Hide the "Remove Account" button
		const removeAccountButtons = Array.from(document.getElementsByClassName("camper-remove-accounts")) as HTMLElement[]
		removeAccountButtons.forEach(element => {
			hideElement(element, accounts.length == 0)
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

		// Enable/Disable the "reply" buttons
		const replyButtons = Array.from(document.getElementsByClassName("camper-btn-reply")) as HTMLButtonElement[]
		replyButtons.forEach(element => {
			element.disabled = !(accounts.some(account => account.intents.create != ""))
		});

		// Add account names to the UX
		const accountNameElements = Array.from(document.getElementsByClassName("camper-account-name")) as HTMLElement[]
		accountNameElements.forEach(element => {
			const account = accounts[0]
			if (account != undefined) {
				element.innerText = account.name
			}
		});

		// Add account images to the UX
		const accountImageElements = Array.from(document.getElementsByClassName("camper-account-image")) as HTMLImageElement[]
		accountImageElements.forEach(element => {
			const account = accounts[0]
			if (account != undefined) {
				element.src = account.iconUrl
				element.hidden = false
			} else {
				element.src = ""
				element.hidden = true
			}
		});

		// Attach event handlers to all "account" forms
		const accountForms = Array.from(document.querySelectorAll("form.camper-form")) as HTMLFormElement[]
		accountForms.forEach(form => {
			form.onsubmit = (event: SubmitEvent) => {

				// Halt the Event
				event.preventDefault();
				event.cancelBubble = true;

				// Use the provided handle to retrieve the WebFinger and ActivityIntents metadata.
				const fediverseHandle = form.elements.namedItem("username") as HTMLInputElement
				Camper.addAccount(fediverseHandle.value)
			}
		})

		// Draw the account list
		const accountLists = Array.from(document.getElementsByClassName("camper-accounts")) as HTMLElement[]
		accountLists.forEach(element => {

			if (accounts.length == 0) {
				element.innerHTML = ""
				element.hidden = true
				return
			}

			// See if this element has a max-accounts attribute
			const maxAccountsString = element.getAttribute("max-accounts") || element.getAttribute("data-max-accounts") || "3"
			const maxAccounts = parseInt(maxAccountsString)

			const accountListHTML = accounts
				.slice(0, maxAccounts)
				.map(account => `
				<div id="camper-account-${account.id}" class="camper-account" onclick="Camper.doIntent(this, '${account.username}')">
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

		const newElement = document.getElementById("camper-account-" + actorId)
		if (newElement != null) {
			newElement.click()
		}
	},

	// removeAccount removes an account from the list and redraws the UX
	removeAccount: (username: string) => {

		window.event!.stopPropagation()
		window.event!.preventDefault()

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

	// doIntent executes the Activity Intent for a selected account (using the data elements in that node)
	doIntent: (element: HTMLElement, username: string = "") => {

		const parent = element.parentElement!

		// Default intent attribute values
		if (parent.getAttribute("data-intent") == null) {
			parent.setAttribute("data-intent", "follow")
		}

		if (parent.getAttribute("data-on-success") == null) {
			parent.setAttribute("data-on-success", "(close)")
		}

		if (parent.getAttribute("data-on-cancel") == null) {
			parent.setAttribute("data-on-cancel", "(close)")
		}

		// Retrieve intent values from the element's attributes
		const intentName = parent.getAttribute("data-intent")

		if (intentName == null) {
			console.error("Unable to determine intent for clicked element. Please ensure the element has a 'data-camper-intent' attribute.")
			return
		}

		// Find accounts saved for this user
		const accounts = Camper.getSavedAccounts()

		if (accounts.length == 0) {
			alert("No accounts configured. Please add an account to continue.")
			return
		}

		let account = accounts.find(account => account.username.toLowerCase() == username.toLowerCase())

		if (account == undefined) {
			account = accounts[0]!
		}

		// Find the intent template for the selected account and replace placeholders
		var intentTemplate = account.intents[intentName as keyof IntentsResult]
		const matches = intentTemplate.match(/\{[^}]+\}/g) || []
		const placeholders = matches.map(placeholder => placeholder.slice(1, -1))

		console.log("Found intent template: " + intentTemplate)
		console.log("Placeholders:", placeholders)
		console.log("Dataset", parent.dataset)

		for (const placeholder of placeholders) {
			var value = parent.getAttribute("data-" + placeholder) || ""
			value = encodeURIComponent(value)
			intentTemplate = intentTemplate.replaceAll("{" + placeholder + "}", value)
		}

		if (intentTemplate == "") {
			alert("The account you selected does not support this action.")
			return
		}

		console.log("Opening intent URL: " + intentTemplate)

		// If present, trigger the event handler to hide the camper interface
		parent.dispatchEvent(new CustomEvent("camper-hide"))

		// Open the Activity Intent in a pop-up window.
		window.open(intentTemplate, "_blank", "height=750,width=600")
	}
}

// Draw the UX for the first time on page load
Camper.render()

console.log("CamperJS loaded", Camper)