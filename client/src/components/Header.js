// Imports - React
import React, { Component } from "react";
import PropTypes from "prop-types";
// Imports - Redux
import connect from "react-redux/es/connect/connect";
// Imports - Frameworks (Material-UI)
import {
    AppBar,
    IconButton,
    Menu, MenuItem,
    Toolbar,
    Typography,
    withStyles
} from "@material-ui/core";
// Imports - Icons
import { AccountCircle } from "@material-ui/icons";
// User names
import getUsers from "../utils/getUsers";
// Switch account Id action
// Set read secret messages action
import { switchAccountId, setMessages } from "../actions";

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
});


class Header extends Component {

    state = {
        anchorEl: null,
    };

    handleMenu = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    handleSwitchAccountId = id => {
        this.props.switchAccountId(id);
        this.props.setMessages([]);
        this.handleClose();
    }

    render() {
        const { classes } = this.props;
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);
        const users = getUsers.names;
        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" color="inherit" className={classes.grow}>
                            Secret Access-Control demo with Enigma
                        </Typography>
                        <div>
                            Switch to other user
                            <IconButton
                                aria-owns={open ? 'menu-appbar' : undefined}
                                aria-haspopup="true"
                                onClick={this.handleMenu}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={open}
                                onClose={this.handleClose}
                            >
                                {
                                    users.map((name, index) => (
                                        <MenuItem
                                            key={index}
                                            onClick={() => this.handleSwitchAccountId(index)}
                                        >
                                            {name}
                                        </MenuItem>
                                    ))
                                }
                            </Menu>
                        </div>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

Header.propTypes = {
    classes: PropTypes.object.isRequired
};

export default connect(
    null,
    { switchAccountId, setMessages }
)(withStyles(styles)(Header));