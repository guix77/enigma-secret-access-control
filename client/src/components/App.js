// Imports - React
import React, { Component, Fragment } from "react";
// Imports - Redux
import connect from "react-redux/es/connect/connect";
// Imports - Frameworks (Semantic-UI and Material-UI)
import { Message } from "semantic-ui-react";
import { Grid, withStyles } from "@material-ui/core";
// Imports - Initialize Enigma
import getEnigmaInit from "../utils/getEnigmaInit.js";
// Imports - Components
import Header from "./Header";
// Imports - Actions (Redux)
import { initializeEnigma, initializeAccounts, deploySecretAccessControl } from '../actions';
// Imports - User names (Alice, Bob...)
import getUsers from "../utils/getUsers";
// Imports - Send secret message component
import SendSecretMessage from "./SendSecretMessage";
// Imports - Read secret messages component
import ReadSecretMessages from "./ReadSecretMessages";

const styles = theme => ({
    main: {
        margin: theme.spacing(4),
        flexGrow: 1
    }
});

class App extends Component {

    async componentDidMount() {
        // Initialize enigma-js client library (including web3)
        const enigma = await getEnigmaInit();
        // Create redux action to initialize set state variable containing enigma-js client library
        this.props.initializeEnigma(enigma);
        // Initialize unlocked accounts
        const accounts = await enigma.web3.eth.getAccounts();
        // Create redux action to initialize set state variable containing unlocked accounts
        this.props.initializeAccounts(accounts);
        // Get deployed "secret access control" secret contract address into Redux.
        const secretContractCount = await enigma.enigmaContract.methods.countSecretContracts().call();
        const deployedSecretAccessControlAddress = (await enigma.enigmaContract.methods
            .getSecretContractAddresses(secretContractCount-1, secretContractCount).call())[0];
        // Create redux action to set state variable containing deployed "secret access control" secret contract address
        this.props.deploySecretAccessControl(deployedSecretAccessControlAddress);
    }

    render() {
        const { classes, accounts, accountId, enigma } = this.props;
        const userName = getUsers.names[accountId];
        // Alice can send messages to Bob, Charles, Dave and Eve.
        // We are not using accounts[0] because it's Alice's account, and accounts[5] to accounts[9] are not used in this demo.
        // @see /client/src/utils/getUsers.js
        const possibleRecipients = [
            {
                address: accounts[1],
                name: getUsers.names[1]
            }, {
                address: accounts[2],
                name: getUsers.names[2]
            }, {
                address: accounts[3],
                name: getUsers.names[3]
            }, {
                address: accounts[4],
                name: getUsers.names[4]
            }
        ];

        return (
            <Fragment>
                <Header />
                <div className={classes.main}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            {
                                (enigma && accounts) ? (
                                    <Message color="green">Welcome {userName}! You address is {accounts[accountId]}</Message>
                                )
                                    : (
                                        <Message color="red">Enigma setup still loading...</Message>
                                    )
                            }
                        </Grid>
                        {
                            (enigma && accounts) && (
                                <Grid item xs={12}>
                                    {
                                        accountId === 0 ? (
                                            <SendSecretMessage
                                                sender={accounts[0]}
                                                possibleRecipients={possibleRecipients}
                                            />
                                        ) : (
                                            <ReadSecretMessages
                                                sender={accounts[accountId]}
                                            />
                                        )
                                    }
                                </Grid>
                            )
                        }
                    </Grid>
                </div>
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        enigma: state.enigma,
        accounts: state.accounts,
        accountId: state.accountId
    }
};

export default connect(
    mapStateToProps,
    { initializeEnigma, initializeAccounts, deploySecretAccessControl }
)(withStyles(styles)(App));
