// We need chars() which is in str::str
#![no_std]

// Imports
extern crate eng_wasm;
extern crate eng_wasm_derive;
extern crate serde;

use eng_wasm::*;
use eng_wasm_derive::pub_interface;
use serde::{Serialize, Deserialize};

// Encrypted state keys
static SECRET_MESSAGES: &str = "secretMessages";

// Structs
#[derive(Serialize, Deserialize)]
pub struct SecretMessage {
    whitelist: Vec<H160>,
    secret_message: String,
}

// Public struct Contract which will consist of private and public-facing secret contract functions
pub struct Contract;

// Private functions accessible only by the secret contract
impl Contract {
    fn get_secret_messages() -> Vec<SecretMessage> {
        read_state!(SECRET_MESSAGES).unwrap_or_default()
    }
}

// Public trait defining public-facing secret contract functions
#[pub_interface]
pub trait ContractInterface {
    fn send_secret_message(addresses: Vec<H160>, message: String);
    fn read_messages() -> (String, Vec<u8>);
}

// Implementation of the public-facing secret contract functions defined in the ContractInterface
// trait implementation for the Contract struct above
impl ContractInterface for Contract {
    #[no_mangle]
    fn send_secret_message(addresses: Vec<H160>, message: String) {
        let mut secret_messages = Self::get_secret_messages();
        secret_messages.push(SecretMessage {
            whitelist: addresses,
            secret_message: message,
        });
        write_state!(SECRET_MESSAGES => secret_messages);
    }

    #[no_mangle]
    fn read_messages() -> (String, Vec<u8>) {
        // We can not return an array of strings, so we'll return a concatenated string of results.
        let mut my_concatenated_secret_messages: String = String::new();
        // Also, we will return an array of integers, giving the string length for each message, so we can reconstruct the array of messages in the UI.
        let mut my_concatenated_secret_messages_lengths: Vec<u8> = Vec::new();
        // Get all secret messages.
        let all_secret_messages = Self::get_secret_messages();
        // Loop through them.
        for x in all_secret_messages {
            // We would need Solidity's msg.sender to filter for whitelisted senders.
            // Externally it's called with computeTask(fn, args, gasLimit, gasPx, sender, scAddr)
            // Is there a way to get sender here?

            // Concatenate the message with the others.
            my_concatenated_secret_messages.push_str(&x.secret_message);
            // Add the message length.
            // String::chars().count() returns an usize but we want to return uint8.
            my_concatenated_secret_messages_lengths.push(x.secret_message.chars().count() as u8);
        }
        return (my_concatenated_secret_messages, my_concatenated_secret_messages_lengths);
    }
}