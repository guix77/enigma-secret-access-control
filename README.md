# Enigma demo: secret access control

This repository is my take on this Enigma GitCoin bounty: https://gitcoin.co/issue/enigmampc/EnigmaBounties/1/3256

## Status : broken

Problems:

+ When trying to read messages, I'm encountering this bug : https://github.com/enigmampc/enigma-contract/issues/154#issuecomment-537087156

## Install

### Rust

If you do not have Rust, you can follow the installation here : https://doc.rust-lang.org/book/ch01-01-installation.html

### Enigma blockchain stack

Be sure to use a version < 12 of Node.js, because there are dependencies on Nativescript which is not yet compatible with Node 12. I recommend Node 11.

Install the project dependencies:

    npm install

One of those dependencies is Enigma's *discovery-cli*. It allows to manage a whole local Enigma blockchain stack with Docker. Before this, you want to check :
+ that you [manage Docker as a non-root user](https://docs.docker.com/install/linux/linux-postinstall/), because discovery-cli will instantiate some Docker containers
+ that you have a lot of space on the partition Docker is storing the images, because Enigma's Docker images are pretty beefy (15 GB in total)

You can now init Enigma's blockchain stack:

    discovery init

Then start the stack:

    discovery start

Open a new bash shell while leaving this one running.

### "Secret access control" secret contracts

Deploy the "Secret access control" secret contract:

    discovery migrate

You can launch the Mocha tests if you want:

    discovery test

### This demo frontend

Go to ./client, install the dependencies and launch the frontend:

    cd client
    npm install
    npm start

## How does it work?

Like Truffle, Discovery creates 10 accounts (accounts[0] to [9]). The Enigma secret contract "secret access control" is deployed with the first account, account[0]. We call this user Alice. It is her secret contract, so only her can send secret messages to the other accounts (Bob, Charles, Dave and Eve. We did not use the last 5 available accounts).

When the frontend starts, you are by default using Alice's account. Therefore you see the SendSecretMessage React component. You can select multiple recipients between her friends, write a secret message and send it to them.

Now if you use the account switcher on the top-right corner, you can impersonate any of her friends. They will all see the ReadSecretMessages component. By clicking on the button, you read and decrypt the secret messages Alice sent you(1)

(1) right now reading does not work, see the Status section above