"use strict";
(() => {
  // src/utils.ts
  function guessProtocol(server) {
    switch (server) {
      case "localhost":
      case "127.0.0.1":
        return "http://";
    }
    return "https://";
  }

  // src/webfinger.ts
  var WebFinger = class {
    static getMetadata = async (username) => {
      const url = this.getUrl(username);
      if (url == null) {
        return null;
      }
      const response = await fetch(url);
      if (!response.ok) {
        console.error("WebFinger request failed with status " + response.status);
        return null;
      }
      const result = await response.json();
      console.log("getMetadata:", result);
      return result;
    };
    static getUrl = (username) => {
      const [user, server] = this.splitUsername(username);
      if (user == "" || server == "") {
        console.error("Invalid username: " + username);
        return null;
      }
      const result = guessProtocol(server) + server + "/.well-known/webfinger?resource=acct:" + user + "@" + server;
      return result;
    };
    static splitUsername = (username) => {
      if (username.startsWith("@")) {
        username = username.substring(1);
      }
      var parts = username.split("@");
      console.log("splitUsername:", username, parts);
      if (parts.length != 2) {
        console.error(username + " is not a valid username");
        return ["", ""];
      }
      return [parts[0], parts[1]];
    };
  };
})();
//# sourceMappingURL=webfinger.js.map
