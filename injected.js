console.log("[Xterium] Injected script executed");

const hardcodedExtensionId = "jdljmhgiecpgbmellhlpdggmponadiln";

function initXterium() {
  if (!window.xterium) {
    window.xterium = {
      extensionId: hardcodedExtensionId,
      isXterium: true,

      showPopup: function() {
        if (document.getElementById("xterium-popup-overlay")) {
          return;
        }

        document.body.style.overflow = "auto";
        const overlay = document.createElement("div");
        overlay.id = "xterium-popup-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.backgroundColor = "rgba(0,0,0,0.0)"; 
        overlay.style.zIndex = "10000";
        overlay.style.pointerEvents = "none";

        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.width = "450px";
        container.style.height = "600px";
        container.style.bottom = "20px";
        container.style.right = "20px";
        container.style.backgroundColor = "#fff";
        container.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
        container.style.borderRadius = "8px";
        container.style.pointerEvents = "auto"; 
        container.style.overflow = "hidden"; 

        const closeBtn = document.createElement("button");
        closeBtn.innerText = "X";
        closeBtn.style.position = "absolute";
        closeBtn.style.top = "10px";
        closeBtn.style.right = "10px";
        closeBtn.style.zIndex = "10001";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.border = "none";
        closeBtn.style.background = "transparent";
        closeBtn.style.fontSize = "18px";
        closeBtn.style.color = "#333";
        closeBtn.addEventListener("click", () => {
          document.body.removeChild(overlay);
          document.body.style.overflow = "";
        });
        const iframe = document.createElement("iframe");
        iframe.src = `chrome-extension://${hardcodedExtensionId}/popup.html`;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.style.overflow = "hidden"; 

        container.appendChild(closeBtn);
        container.appendChild(iframe);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        console.log("[Xterium] Popup overlay opened.");
      }
    };

    const triggerButton = document.createElement("button");
    triggerButton.innerText = "Open Extension Popup";
    triggerButton.style.position = "fixed";
    triggerButton.style.bottom = "20px";
    triggerButton.style.right = "20px";
    triggerButton.style.padding = "10px 15px";
    triggerButton.style.zIndex = "10000";
    triggerButton.style.cursor = "pointer";
    triggerButton.style.border = "none";
    triggerButton.style.borderRadius = "4px";
    triggerButton.style.backgroundColor = "#007bff";
    triggerButton.style.color = "#fff";
    triggerButton.style.fontSize = "14px";
    triggerButton.addEventListener("click", window.xterium.showPopup);
    document.body.appendChild(triggerButton);

    console.log("[Xterium] Injected Successfully!", window.xterium);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initXterium);
} else {
  initXterium();
}
