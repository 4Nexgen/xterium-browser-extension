const bgImageUrl = chrome.runtime.getURL("assets/covers/bg-inside.png")
const logoUrl = chrome.runtime.getURL("assets/app-logo/xterium-logo.png")
const iconUrl = chrome.runtime.getURL("assets/app-logo/xterium-icon.png")
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
      .wallet-connect-container{
  background: url('${bgImageUrl}') center/cover no-repeat;
      border-radius: 0 0 16px 16px;
      padding: 24px;
      width: 400px;
      min-height: 400px;
      
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      animation: fadeIn 0.3s ease-in-out;
      position: relative;
}
    .inject-label{
      text-align: left;
      color: white;
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
      color: white;
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
      color: white;
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
    .cancel-button,
    .transfer-approve-button,
    .transfer-reject-button{
      margin-top: 60%;
    }
   .cancel-button {
      margin-right: 6%;
      width: 47%;
      border: 1px solid white;
      color: white;
      padding: 9.1px;
      font-size: 16px;
      font-weight: bold;
      border-radius: 5px;
    }
        .approve-button, 
    .reject-button,
    .transfer-approve-button,
    .transfer-reject-button {
      width: 47%;
      padding: 10px;
      font-size: 16px;
      font-weight: bold;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      text-align: center;
    }
    .approve-button,
    .transfer-approve-button {
      background-color: #4CAF50;
      color: white;
    }

  .transfer-reject-button {
      margin-right: 6%;
      background-color: #f44336;
      color: white;
    }
    .transfer-animation-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5); /* Transparent dark background */
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999; /* Make sure it's on top of other elements */
    }

    .transfer-animation-container {
        background: url('${bgImageUrl}') center/cover no-repeat;
      border-radius: 16px;
      padding: 24px;
      width: 400px;
      min-height: 400px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      animation: fadeIn 0.3s ease-in-out;
      position: relative;
    }
    .updatetransfer-animation-container{
      background: url('${bgImageUrl}') center/cover no-repeat;
      border-radius: 16px;
      padding: 24px;
      width: 400px;
      min-height: 200px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      animation: fadeIn 0.3s ease-in-out;
      position: relative;
    }
    .check-container{
      align-items: center;
      font-size: 40px;
      text-align: center;
    }
    .check-mark{
      color: green;
    }
    .success-text{
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      margin-top: 20px;
    }

    .spinner {
      border: 6px solid #444;
      border-top: 6px solid #3498db; /* Spinner color */
      border-radius: 50%;
      width: 48px;
      height: 48px;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }
    .xterium-logo {
      background: url('${iconUrl}') center/cover no-repeat;
      width: 35px;
      height: 35px;
      left: 0;
    }
    .styled-text {
      display: block; 
      text-align: center; 
      font-size: 16px;
      font-weight: bold;
      color: white;
    }

    .confirm-wallet-container {
      background: url('${bgImageUrl}') center/cover no-repeat;
      border-radius: 0 0 16px 16px;
      padding: 24px;
      width: 400px;
      min-height: 550px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      animation: fadeIn 0.3s ease-in-out;
      position: relative;
    }
    .header-container {
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      background: #111722;
      border-radius: 16px 16px 0 0;
      padding: 0.1px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      animation: fadeIn 0.3s ease-in-out;
    }

    .header-title {
      margin-left: 42%;
      font-size: 18px;
      flex: 1; 
      margin-top: 12px; 
      color: white;
    }

    .close-button {
      background: transparent; 
      border: none; 
      font-size: 30px; 
      cursor: pointer; 
      color: white; 
      margin-right: 10px;
      background-color: transparent;
    }

    .close-button:hover {
      color: #ff0000; 
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
