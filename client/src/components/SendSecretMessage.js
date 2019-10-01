// Imports - React
import React, { Component, Fragment } from "react";
// Imports - Redux
import connect from "react-redux/es/connect/connect";
// Imports - Frameworks (Semantic-UI and Material-UI)
import {
    Button,
    FormControl,
    Grid,
    Input, InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    withStyles
} from "@material-ui/core";
// Imports - enigma-js client library utility packages
import { utils, eeConstants } from 'enigma-js';
// Imports - Notifier component & action
import Notifier, {openSnackbar} from "./Notifier";

// Set secret message recipients action
// Set secret message content action
import { setRecipients, setContent } from "../actions";

const styles = theme => ({
});

class SendMessage extends Component {

    changeRecipients = event => {
        this.props.setRecipients(event.target.value);
    }

    changeContent = event => {
        this.props.setContent(event.target.value);
    }

    sleep = async ms => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    sendMessage = async (sender, recipients, content) => {
        // Create compute task metadata
        // computeTask(
        //      fn - the signature of the function we are calling (Solidity-types, no spaces)
        //      args - the args passed into our method w/ format [[arg_1, type_1], [arg_2, type_2], …, [arg_n, type_n]]
        //      gasLimit - ENG gas units to be used for the computation task
        //      gasPx - ENG gas price to be used for the computation task in grains format (10⁸)
        //      sender - Ethereum address deploying the contract
        //      scAddr - the secret contract address for which this computation task belongs to
        // )
        const taskFn = 'send_secret_message(address,address[],string)';
        const taskArgs = [
            [sender, 'address'],
            [recipients, 'address[]'],
            [content, 'string'],
        ]
        const taskGasLimit = 10000000;
        const taskGasPx = utils.toGrains(1e-7);
        let task = await new Promise((resolve, reject) => {
            this.props.enigma.computeTask(taskFn, taskArgs, taskGasLimit, taskGasPx, sender,
                this.props.deployedSecretAccessControl)
                .on(eeConstants.SEND_TASK_INPUT_RESULT, (result) => resolve(result))
                .on(eeConstants.ERROR, (error) => reject(error));
        });
        openSnackbar({ message: 'Task pending: sending secret message' });
        while (task.ethStatus === 1) {
            // Poll for task record status and finality on Ethereum after worker has finished computation
            task = await this.props.enigma.getTaskRecordStatus(task);
            await this.sleep(1000);
        }
        // ethStatus === 2 means task has successfully been computed and commited on Ethereum
        task.ethStatus === 2 ?
            openSnackbar({ message: 'Task succeeded: sent secret message' })
            :
            openSnackbar({ message: 'Task failed: did not send secret message' })
        ;
        // Reset recipients and content.
        this.props.setRecipients([]);
        this.props.setContent("");
    }

    render() {
        // "sender" is accounts[0] (Alice address) and is passed by the parent component App.js.
        // Ideally we would have an equivalent of Ethereum's msg.sender to detect the address submitting a task but we don't have it for now.
        // "possibleRecipients" props here, also passed by App.js, represents the list of the secret message possible recipients (Bob, Charles, Dave and Eve).
        // "recipients" is the list of chosen recipients
        // "content" is the message content
        const { sender, possibleRecipients, recipients, content } = this.props;
        return (
            <Fragment>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Typography variant="h3" gutterBottom>Send a secret message</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="recipients">Select one or more recipients</InputLabel>
                            <Select
                                multiple
                                value={recipients}
                                onChange={event => this.changeRecipients(event)}
                                input={<Input id="recipients" />}
                            >
                            {
                                possibleRecipients.map((recipient, index) => (
                                    <MenuItem
                                        key={index}
                                        value={recipient.address}
                                    >
                                        {recipient.name}
                                    </MenuItem>
                                ))
                            }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            id="content"
                            label="Write your secret message"
                            multiline
                            rowsMax="3"
                            value={content}
                            onChange={event => this.changeContent(event)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            onClick={() => this.sendMessage(sender, recipients, content)}
                            color="primary"
                            variant="contained"
                            size="large"
                        >
                            Send secret message
                        </Button>
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
        accountId: state.accountId,
        recipients: state.recipients,
        content: state.content,
        deployedSecretAccessControl: state.deployedSecretAccessControl
    }
};

export default connect(mapStateToProps, { setRecipients, setContent })(withStyles(styles)(SendMessage));