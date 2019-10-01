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

// Redux action for when "secret access control" has been deployed to a particular address
export const deploySecretAccessControl = deployedSecretAccessControlAddress => {
    return {
        type: 'SECRET_ACCESS_CONTROL_DEPLOYED',
        payload: deployedSecretAccessControlAddress
    };
};

// Switch current Ethereum account Id (accounts[0], accounts[1], ...)
export const switchAccountId = id => {
    return {
        type: 'ACCOUNT_SWITCHED',
        payload: id
    };
};

// Set secret message recipients
export const setRecipients = recipients => {
    return {
        type: 'SET_RECIPIENTS',
        payload: recipients
    };
};

// Set secret message content
export const setContent = content => {
    return {
        type: 'SET_CONTENT',
        payload: content
    };
};