import { combineReducers} from 'redux';
import { reducer as formReducer } from 'redux-form';

const initializeEnigmaReducer = (enigma = null, action) => {
    if (action.type === 'ENIGMA_INITIALIZED') {
        return action.payload;
    }

    return enigma;
};

const initializeAccountsReducer = (accounts = [], action) => {
    if (action.type === 'ACCOUNTS_INITIALIZED') {
        return action.payload;
    }

    return accounts;
};

const notifyMessageReducer = (notification = {open: false, message: ''}, action) => {
    if (action.type === 'MESSAGE_NOTIFIED') {
        return action.payload;
    }

    return notification;
};

// Responds to deploySecretAccessControl action to save deployed "secret access control" secret contract address
const deployedSecretAccessControlReducer = (deployedSecretAccessControl = null, action) => {
    if (action.type === 'SECRET_ACCESS_CONTROL_DEPLOYED') {
        return action.payload;
    }

    return deployedSecretAccessControl;
};

// Responds to switchAccountId action to save current account Id
const switchAccountIdReducer = (accountId = 0, action) => {
    if (action.type === 'ACCOUNT_SWITCHED') {
        return action.payload;
    }

    return accountId;
};

// Responds to setRecipients action to save new secret message recipients
const setRecipientsReducer = (recipients = [], action) => {
    if (action.type === 'SET_RECIPIENTS') {
        return action.payload;
    }

    return recipients;
};

// Responds to setContent action to save new secret message content
const setContentReducer = (content = "", action) => {
    if (action.type === 'SET_CONTENT') {
        return action.payload;
    }

    return content;
};

// Responds to setMessages action to save read secret messages
const setMessagesReducer = (messages = [], action) => {
    if (action.type === 'SET_MESSAGES') {
        return action.payload;
    }

    return messages;
};

export default combineReducers({
    enigma: initializeEnigmaReducer,
    accounts: initializeAccountsReducer,
    notification: notifyMessageReducer,
    form: formReducer,
    deployedSecretAccessControl: deployedSecretAccessControlReducer,
    accountId: switchAccountIdReducer,
    recipients: setRecipientsReducer,
    content: setContentReducer,
    messages: setMessagesReducer
});
