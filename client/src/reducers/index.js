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

// Responds to switchAccountId action to save current account Id
const switchAccountIdReducer = (accountId = 0, action) => {
    if (action.type === 'ACCOUNT_SWITCHED') {
        return action.payload;
    }

    return accountId;
};

export default combineReducers({
    enigma: initializeEnigmaReducer,
    accounts: initializeAccountsReducer,
    notification: notifyMessageReducer,
    form: formReducer,
    accountId: switchAccountIdReducer
});
