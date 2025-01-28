if (!window.xterium) {
  window.xterium = {
    isXterium: true,
    request: async (method, params) => {
      return new Promise((resolve, reject) => {
        window.postMessage(
          { type: "XTERIUM_REQUEST", method, params },
          "*"
        );
        window.addEventListener("message", function handler(event) {
          if (event.data.type === "XTERIUM_RESPONSE") {
            window.removeEventListener("message", handler);
            if (event.data.error) {
              reject(event.data.error);
            } else {
              resolve(event.data.result);
            }
          }
        });
      });
    }
  };
  console.log("Xterium injected:", window.xterium);
}