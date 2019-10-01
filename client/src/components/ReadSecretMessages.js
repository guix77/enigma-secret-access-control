// Imports - React
import React, { Component, Fragment } from "react";
// Imports - Redux
import connect from "react-redux/es/connect/connect";
// Imports - Frameworks (Semantic-UI and Material-UI)
import {
    Button,
    Card, CardHeader, CardContent,
    Grid,
    Typography,
    withStyles
} from "@material-ui/core";

// Imports - enigma-js client library utility packages
import { utils, eeConstants } from 'enigma-js';
// Imports - Notifier component & action
import Notifier, {openSnackbar} from "./Notifier";

// Set read secret messages action
import { setMessages } from "../actions";

const styles = theme => ({
});

class ReadMessages extends Component {

    sleep = ms => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    splitMessages = decryptedOutput => {
        const decodedParameters = this.props.web3.eth.abi.decodeParameters(
            [
                {
                    type: 'string',
                    name: 'concatenatedMessages',
                },
            ],
            decryptedOutput
        )
        const concatenatedMessages = decodedParameters.concatenatedMessages
        // Return empty array of messages if decrypted output string is empty.
        if (concatenatedMessages === '') {
            return []
        }
        // Otherwise return messages.
        const separator = '|'
        return decodedParameters.concatenatedMessages.split(separator)
    }

    readMessages = async () => {
        // Address of the ESC
        const { deployedSecretAccessControl } = this.props;
        // Address of current active user. It's the sender in the ESC task sense, not in the "message author" sense.
        const sender = this.props.accounts[this.props.accountId];
        // Reset read messages if they were already read.
        this.props.setMessages([]);
        // Create compute task metadata
        // computeTask(
        //      fn - the signature of the function we are calling (Solidity-types, no spaces)
        //      args - the args passed into our method w/ format [[arg_1, type_1], [arg_2, type_2], …, [arg_n, type_n]]
        //      gasLimit - ENG gas units to be used for the computation task
        //      gasPx - ENG gas price to be used for the computation task in grains format (10⁸)
        //      sender - Ethereum address deploying the contract
        //      scAddr - the secret contract address for which this computation task belongs to
        // )
        const taskFn = 'read_messages(address)';
        const taskArgs = [
            [sender, 'address']
        ];
        const taskGasLimit = 10000000;
        const taskGasPx = utils.toGrains(1e-7);
        let task = await new Promise((resolve, reject) => {
            this.props.enigma.computeTask(taskFn, taskArgs, taskGasLimit, taskGasPx, sender, deployedSecretAccessControl)
                .on(eeConstants.SEND_TASK_INPUT_RESULT, (result) => resolve(result))
                .on(eeConstants.ERROR, (error) => reject(error));
        });
        openSnackbar({ message: 'Task pending: reading secret messages' });
        while (task.ethStatus === 1) {
            // Poll for task record status and finality on Ethereum after worker has finished computation
            task = await this.props.enigma.getTaskRecordStatus(task);
            await this.sleep(1000);
        }
        if (task.ethStatus === 2) {
            openSnackbar({ message: 'Task succeeded: read secret messages' })
            console.log(task)
            // Decrypt messages
            task = await this.props.enigma.decryptTaskResult(task);
            // // Rebuild messages from concatenated string of task decrypted output.
            // const messages = this.splitMessages(task.decryptedOutput);
            const messages = ["yo", "yo2"]
            // Set read messages.
            this.props.setMessages(messages)
        } else {
            openSnackbar({ message: 'Task failed: did not read secret messages' })
        }
    }

    render() {
        const { messages } = this.props;
        return (
            <Fragment>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Typography variant="h3">My secret messages</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            onClick={() => this.readMessages()}
                            variant="contained"
                            size="large"
                            color="primary"
                        >
                            Read my secret messages
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        {
                            messages.length > 0 ? (
                                <Grid container spacing={1}>
                                    {
                                        messages.map((message, index) => (
                                            <Grid item xs={12} key={index}>
                                                <Card>
                                                    <CardHeader title="From: Alice" />
                                                    <CardContent>{message}</CardContent>
                                                </Card>
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            ) : (
                                <Typography>You have no secret messages for now.</Typography>
                            )
                        }
                    </Grid>
                </Grid>
                <Notifier />
            </Fragment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        enigma: state.enigma,
        accounts: state.accounts,
        accountId: state.accountId,
        deployedSecretAccessControl: state.deployedSecretAccessControl,
        messages: state.messages
    }
};

export default connect(mapStateToProps, { setMessages })(withStyles(styles)(ReadMessages));