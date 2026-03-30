// src/utils.ts
function guessProtocol(server) {
  switch (server) {
    case "localhost":
    case "127.0.0.1":
      return "http://";
  }
  return "https://";
}
function getPlaceholders(template) {
  const matches = template.match(/\{([^}]+)\}/g) || [];
  return matches.map((placeholder) => placeholder.slice(1, -1));
}
export {
  getPlaceholders,
  guessProtocol
};
//# sourceMappingURL=utils.js.map
