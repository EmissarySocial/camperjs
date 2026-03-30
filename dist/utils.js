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
})();
//# sourceMappingURL=utils.js.map
