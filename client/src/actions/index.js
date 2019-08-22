export const initializeEnigma = (enigma) => {
    return {
        type: 'ENIGMA_INITIALIZED',
        payload: enigma
    };
};

export const initializeAccounts = (accounts) => {
    return {
        type: 'ACCOUNTS_INITIALIZED',
        payload: accounts
    };
};

export const notifyMessage = (notification) => {
    return {
        type: 'MESSAGE_NOTIFIED',
        payload: notification
    };
};

// Switch current Ethereum account Id (accounts[0], accounts[1], ...)
export const switchAccountId = id => {
    return {
        type: 'ACCOUNT_SWITCHED',
        payload: id
    };
};