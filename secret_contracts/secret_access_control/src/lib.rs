// Built-In Attributes.
#![no_std]

// Imports.
extern crate eng_wasm;
extern crate eng_wasm_derive;
extern crate serde;

// Uses.
use eng_wasm::*;
use eng_wasm_derive::pub_interface;
use serde::{Serialize, Deserialize};

// Encrypted state keys.
static OWNER: &str = "owner";
static SECRET_MESSAGES: &str = "secretMessages";

// Structs.
#[derive(Serialize, Deserialize)]
pub struct SecretMessage {
    whitelist: Vec<H160>,
    secret_message: String,
}

// Public struct Contract which will consist of private and public-facing secret contract functions.
pub struct Contract;

// Private functions accessible only by the secret contract.
impl Contract {
    // Get all secret messages.
    fn get_all_secret_messages() -> Vec<SecretMessage> {
        read_state!(SECRET_MESSAGES).unwrap_or_default()
    }
}

// Public trait defining public-facing secret contract functions.
#[pub_interface]
pub trait ContractInterface {
    // Custom construct to initialize the owner of the ESC.
    fn construct(owner: H160);

    // Send a secret messages to recipients.
    fn send_secret_message(sender: H160, addresses: Vec<H160>, message: String);

    // Read messages for a user (sender).
    fn read_messages(sender: H160) -> String;
}

// Implementation of the public-facing secret contract functions defined in the ContractInterface
// trait implementation for the Contract struct above.
impl ContractInterface for Contract {
    fn construct(owner: H160) {
        write_state!(OWNER => owner);
    }

    #[no_mangle]
    fn send_secret_message(sender: H160, addresses: Vec<H160>, message: String) {
        // Restrict to contract owner.
        let owner: H160 = read_state!(OWNER).unwrap();
        assert_eq!(sender, owner);
        // Get all secret messages.
        let mut secret_messages = Self::get_all_secret_messages();

        // Push new secret message.
        secret_messages.push(SecretMessage {
            whitelist: addresses,
            secret_message: message,
        });
        // Write state.
        write_state!(SECRET_MESSAGES => secret_messages);
    }

    #[no_mangle]
    fn read_messages(sender: H160) -> String {
        // We can not return an array of strings, so we'll return a concatenated string of results.
        let mut my_concatenated_secret_messages: String = String::new();
        // Separator between strings.
        let separator = String::from("|");
        // Get all secret messages.
        let all_secret_messages = Self::get_all_secret_messages();
        // Loop through them.
        for one_secret_message in all_secret_messages {
            // For a given message, is the user (sender) in the whitelist?
            for recipient in one_secret_message.whitelist {
                // Yes, so add the message.
                if recipient == sender {
                    // Concatenate the message with the others.
                    my_concatenated_secret_messages.push_str(&one_secret_message.secret_message);
                    // Add the separator.
                    my_concatenated_secret_messages.push_str(&separator);
                }
            }
        }
        // Remove last separator & return messages.
        my_concatenated_secret_messages.pop();
        // Return secret messages for sender.
        return my_concatenated_secret_messages;
    }
}