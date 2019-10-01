// Imports - React
import React, { Component } from "react";
// Imports - Redux
import connect from "react-redux/es/connect/connect";
// Imports - Frameworks (Semantic-UI and Material-UI)
import { Grid, withStyles } from "@material-ui/core";

const styles = theme => ({
    main: {
        margin: theme.spacing(4),
        flexGrow: 1
    }
});

class ReadMessages extends Component {
    render() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12}>Read messages</Grid>
            </Grid>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        enigma: state.enigma,
        accountId: state.accountId
    }
};

export default connect(mapStateToProps)(withStyles(styles)(ReadMessages));