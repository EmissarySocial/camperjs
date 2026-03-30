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
})();
//# sourceMappingURL=nodeinfo.js.map
