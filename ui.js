const bgImageUrl = chrome.runtime.getURL("assets/covers/bg-inside.png")
const logoUrl = chrome.runtime.getURL("assets/app-logo/xterium-logo.png")
export function injectCSS() {
  const style = document.createElement("style")
  style.textContent = `
    .inject-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;    
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }

    .inject-container {
      background: url('${bgImageUrl}') center/cover no-repeat;
      border-radius: 16px;
      padding: 24px;
      width: 400px;
      min-height: 400px;
      
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      animation: fadeIn 0.3s ease-in-out;
      position: relative;
    }
    .inject-label{
      text-align: left;
    }
    .wallet-logo {
        background: url('${logoUrl}') center/cover no-repeat;
        width: 120px;
        height: 120px;
        margin: 0 auto;
        position: relative;
        margin-top: 5%;

    }

    .inject-header {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 12px;
      color: white;
      padding-top: 5%;
      text-align: center;
    }


    .inject-description {
      font-size: 16px;
      color: #666666;
      margin-bottom: 20px;
      text-align: center;
    }
    .inject-input {
    required: true;
    width: 100%;
    margin-bottom: 10px;
    background-color: #111722;
    border: 1px solid transparent; 
    border-radius: 5px;
    outline:none;
}

.inject-input:hover {
    border: 1px solid #0fbab5; 
    outline: none;
}
.inject-select{
    required: true;
    width: 100%;
    margin-bottom: 10px;
    background-color: #111722;
    border: 1px solid transparent; 
    border-radius: 5px;
    outline:none;
}
    .wallet-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .inject-button {
      padding: 12px;
      background: linear-gradient(135deg, #4CAF50, #2E7D32);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s ease;
      width: 100%;
      margin-top: 2%;
    }

    .inject-button:hover {
      background: linear-gradient(135deg, #66BB6A, #388E3C);
    }

.inject-cancel-button {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px; 
  height: 40px;
  color: white; 
  background: transparent; 
  border: none;
  font-size: 30px; 
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.3s ease; 
}

.inject-cancel-button:hover {
  color: red; 
}
  .inject-err{
    color: red;
    text-align: center;
    align-items: center;
  }
.spinner {
      border: 6px solid #444;
      border-top: 6px solid var(--primary-color);
      border-radius: 50%;
      width: 48px;
      height: 48px;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
.transfer-address{
  display = "flex"
          justifyContent = "center"
          alignItems = "center"
          marginBottom = "10px"
  }
  .sender-circle{
    border = "1px solid #ccc"
          borderRadius = "50%"
          width = "50px"
          height = "50px"
          lineHeight = "50px"
          textAlign = "center"
          background = "#fff"
          position = "relative"
          zIndex = "2"
  }
  .recipient-circle{
    border = "1px solid #ccc"
          borderRadius = "50%"
          width = "50px"
          height = "50px"
          lineHeight = "50px"
          textAlign = "center"
          background = "#fff"
          position = "relative"
          left = "-15px" // adjust overlap here
          zIndex = "1"
  }
          .transfer-container {
      background: url('${bgImageUrl}') center/cover no-repeat;
      border-radius: 16px;
      padding: 24px;
      width: 400px;
      min-height: 300px;      
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      animation: fadeIn 0.3s ease-in-out;
      position: relative;
    }
      .details-container {
    text-align: left;
    margin-bottom: 20px;
}

.details-field {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
    background-color: #111722;
    font-family: Arial, sans-serif;
    font-size: 14px;
    color: white;
}
    .button-container {
    width: 50%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
    
}

.approve-button, 
.Reject-button {
    width: 49%;
    padding: 10px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
}

.approve-button {
    background-color: #4CAF50;
    color: white;
}

.Reject-button {
    margin-left: 2%;
    background-color: #f44336;
    color: white;
}


    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

  `

  document.head.appendChild(style)
}

export function injectScript() {
  if (document.getElementById("xterium-injected-script")) return
  const script = document.createElement("script")
  script.id = "xterium-injected-script"
  script.src = chrome.runtime.getURL("injected.js")
  script.onload = function () {
    console.log("[UI.js] Injected script successfully loaded.")
    this.remove()
    injectCSS()
  }
  ;(document.head || document.documentElement).appendChild(script)
}

