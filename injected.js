// Prevent multiple injections
if (!window.myWallets) {
    const myWallets = {
      isMyWallets: true,
      accounts: [],
      // Event listeners for handling events
      _events: {},
      
      // Method to request accounts
      request: async (method, params) => {
        return new Promise((resolve, reject) => {
          switch (method) {
            case 'eth_requestAccounts':
              // Simulate account retrieval
              myWallets.accounts = ['5CGDeeDXj9ZbYqdFK4dDQcYdTPxMAHk9mcjitbkfaF1NRd6x']; // Mock account
              resolve(myWallets.accounts);
              break;
            case 'eth_accounts':
              resolve(myWallets.accounts);
              break;
            case 'eth_chainId':
              resolve('0x1'); // Mainnet chain ID
              break;
            default:
              reject({ error: 'Method not supported' });
          }
        });
      },
  
      // Method to add event listeners
      on: (event, callback) => {
        if (!myWallets._events[event]) {
          myWallets._events[event] = [];
        }
        myWallets._events[event].push(callback);
      },
  
      // Method to emit events
      emit: (event, data) => {
        if (myWallets._events[event]) {
          myWallets._events[event].forEach(callback => callback(data));
        }
      }
    };
  
    // Inject the wallet into the window object
    window.myWallets = new Proxy(myWallets, {
      get(target, prop) {
        if (prop in target) {
          return target[prop];
        }
        return undefined; // Return undefined for unsupported properties
      }
    });
  
    console.log("MyWallet injected:", window.myWallets);
  }