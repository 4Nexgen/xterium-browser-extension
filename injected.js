window.xterium = {
  isXterium: true,
  request: async (method, params) => {
    return new Promise((resolve, reject) => {
      window.postMessage(
        { type: "XTERIUM_REQUEST", method, params },
        "*"
      );

      function handler(event) {
        if (event.data.type === "XTERIUM_RESPONSE") {
          window.removeEventListener("message", handler);
          if (event.data.error) {
            reject(event.data.error);
          } else {
            resolve(event.data.result);
          }
        }
      }

      window.addEventListener("message", handler);
    });
  }
};

// Make `window.xterium` globally accessible
globalThis.xterium = window.xterium;

console.log("xterium injected:", window.xterium);
