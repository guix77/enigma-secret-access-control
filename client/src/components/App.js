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
import { initializeEnigma, initializeAccounts } from '../actions';
// Imports - User names (Alice, Bob...)
import getUsers from "../utils/getUsers";

const styles = theme => ({
    main: {
        margin: theme.spacing.unit * 4,
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
    }

    render() {
        const { classes, accountId, enigma } = this.props;
        const userName = getUsers.names[accountId];

        return (
            <Fragment>
                <Header />
                <div className={classes.main}>
                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            {
                                enigma ? (
                                    <Message color="green">Welcome {userName}!</Message>
                                )
                                    : (
                                        <Message color="red">Enigma setup still loading...</Message>
                                    )
                            }
                        </Grid>
                    </Grid>
                </div>
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        enigma: state.enigma,
        accountId: state.accountId
    }
};

export default connect(
    mapStateToProps,
    { initializeEnigma, initializeAccounts }
)(withStyles(styles)(App));
