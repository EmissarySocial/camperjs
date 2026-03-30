# CamperJS 🏕️

<img src="https://github.com/EmissarySocial/emissary/raw/main/tools/camper/meta/logo.webp" style="width:100%; display:block; margin-bottom:20px;"  alt="Watercolor painting titled: A Tent in the Rockies (1916) by John Singer Sargent (American, 1856-1925)">

## Activity Intents for the New Social Web

Camper helps you to implement [FEP-3b86: Activity Intents](https://w3id.org/fep/3b86), which publishes the actions that a user can take from their home server and provides a consistent API for calling these intents from an external web page.

## Looking Up Intents

CamperJS is a widget library for discovering and implementing Activity Intents.  It makes it easy to look up the Activity Intent capabilities of a user's home server.  If the target user's server publishes its capabilities via the WebFinger standard, then Camper will use these links directly.

Otherwise, if the user's home server does not publish any activity intent links, then Camper will try to make a best guess based on the kind of Fediverse software they're using (provided by [NodeInfo 2.0](https://github.com/jhass/nodeinfo/blob/main/PROTOCOL.md)) and the template strings published by [Wladimir Palant](https://palant.info/2023/10/19/implementing-a-share-on-mastodon-button-for-a-blog/).


## Usage
TBD

## Installing for Development

To download all of the project dependencies, open your terminal to the camperjs folder and enter `> npm install`