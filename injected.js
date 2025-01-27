if (!window.xtreium) {
  window.xtreium = {
    isXtreium: true,
    request: async (method, params) => {
      return new Promise((resolve, reject) => {
        window.postMessage(
          { type: "XTREIUM_REQUEST", method, params },
          "*"
        );
        window.addEventListener("message", function handler(event) {
          if (event.data.type === "XTREIUM_RESPONSE") {
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
  console.log("Xtreium injected:", window.xtreium);
}