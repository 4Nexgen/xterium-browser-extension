document.getElementById("connect").addEventListener("click", async () => {
    const username = document.getElementById("username").value;
  
    if (!username) {
      alert("Please enter a username.");
      return;
    }
  
    try {
      const response = await chrome.runtime.sendMessage({
        type: "XTREIUM_REQUEST",
        method: "getWalletAddress",
        username: username
      });
  
      if (response && response.result) {
        document.getElementById("status").textContent = `Connected: ${response.result}`;
      } else {
        document.getElementById("status").textContent = "Connection failed";
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("status").textContent = "Error connecting";
    }
  });