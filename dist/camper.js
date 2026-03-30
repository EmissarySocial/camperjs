"use strict";
(() => {
  // src/nodeinfo.ts
  var NodeInfo = class {
    static getSoftwareName = async (server) => {
      const nodeInfo = await this.getNodeInfo(server);
      if (nodeInfo == null) {
        return "";
      }
      return nodeInfo?.software?.name || "";
    };
    static getNodeInfo = async (server) => {
      const url = await this.#getNodeInfoUrl(server);
      if (url == null) {
        return null;
      }
      console.log("NodeInfo getNodeInfo:", url);
      try {
        const response = await fetch(url);
        if (response.ok) {
          return await response.json();
        }
        console.log("NodeInfo request failed with status " + response.status);
      } catch (error) {
        console.error("NodeInfo request failed with error: " + error);
      }
      return null;
    };
    static #getNodeInfoUrl = async (server) => {
      try {
        const url = this.#protocol(server) + server + "/.well-known/nodeinfo";
        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          console.log("getNodeInfoUrl:", result);
          return result?.links.at(0)?.href || null;
        }
        console.error("NodeInfo request failed with status " + response.status);
        return null;
      } catch (error) {
        console.error("NodeInfo request failed with error: " + error);
        return null;
      }
    };
    static #protocol(server) {
      switch (server) {
        case "localhost":
        case "127.0.0.1":
          return "http://";
      }
      return "https://";
    }
  };

  // src/camper.ts
  var Camper = class {
    static render = (domNode) => {
    };
    // getIntentsMap retrieves the available Activity Intents templates for the provided data
    static getIntentsMap = async (server, webfingerResult) => {
      var found = false;
      var result = {
        announce: "",
        create: "",
        follow: "",
        like: "",
        object: ""
      };
      const links = webfingerResult.links || [];
      for (const link of links) {
        var relation = link.rel || "";
        var template = link.template || link.href || "";
        switch (relation.toLowerCase()) {
          case "https://w3id.org/fep/3b86/announce":
            result.announce = template;
            found = true;
            continue;
          case "https://w3id.org/fep/3b86/create":
            result.create = template;
            found = true;
            continue;
          case "https://w3id.org/fep/3b86/follow":
            result.follow = template;
            found = true;
            continue;
          case "https://w3id.org/fep/3b86/like":
            result.like = template;
            found = true;
            continue;
          case "https://w3id.org/fep/3b86/object":
            result.object = template;
            found = true;
            continue;
          case "https://ostatus.org/schema/1.0/subscribe":
            if (result.follow == "") {
              result.follow = template.replaceAll("{uri}", "{object}");
            }
            continue;
        }
      }
      if (found) {
        return result;
      }
      const softwareName = await NodeInfo.getSoftwareName(server);
      switch (softwareName.toLowerCase()) {
        case "diaspora":
          result.create = server + "/bookmarklet?title={name}&notes={content}&url={inReplyTo}";
          break;
        case "friendica":
          result.create = server + "/compose?title={name}&body={content}";
          break;
        case "glitchcafe":
          result.create = server + "/share?text={content}";
          break;
        case "gnusocial":
          result.create = server + "/notice/new?status_textarea={content}";
          break;
          result.create = server + "/share?text={content}";
          break;
        case "hubzilla":
          result.create = server + "/rpost?title={name}&body={content}";
          break;
        case "mastodon":
        case "hometown":
          result.create = server + "/share?text={content}";
          result.object = server + "/authorize_interaction?uri={object}";
          break;
        case "misskey":
        case "calckey":
        case "fedibird":
        case "firefish":
        case "foundkey":
        case "meisskey":
          result.create = server + "/share?text={content}";
          break;
        case "microdotblog":
          result.create = server + "/post?text=[{name}]({inReplyTo})%0A%0A{content}";
          break;
      }
      return result;
    };
    // getProfileUrl retrieves user's Profile URL from WebFinger metadata
    static getProfileUrl = (webfingerResult) => {
      const links = webfingerResult.links || [];
      for (const link of links) {
        const relation = link.rel || "";
        const linkType = link.type || "";
        if (relation.toLowerCase() == "self") {
          if (linkType.toLowerCase() == "application/activity+json") {
            return link.href || "";
          }
        }
      }
      return "";
    };
    // getAccounts retrieves the list of accounts from local storage
    static getSavedAccounts = () => {
      const accountsString = localStorage.getItem("accounts") || "[]";
      return JSON.parse(accountsString) || [];
    };
  };
})();
//# sourceMappingURL=camper.js.map
