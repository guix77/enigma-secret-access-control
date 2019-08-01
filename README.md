## 1. Rust

+ https://blog.enigma.co/getting-started-with-discovery-the-rust-programming-language-4d1e0b06de15

## 1.2. Rust install

+ https://doc.rust-lang.org/book/ch01-01-installation.html

    curl https://sh.rustup.rs -sSf | sh

    rustc --version
    rustc 1.36.0 (a53f9df32 2019-07-03)

## 1.3. PLay with Rust

Coming from Solidity, we find again structs

Small error in the end of the tutorial: https://medium.com/@guillaume.duveau/great-tutorial-732ee1c1ae5e

## 2. Enigma secrets contracts

https://blog.enigma.co/getting-started-with-enigma-an-intro-to-secret-contracts-cdba4fe501c2

### 2.1. Setup

discovery-cli depends on Nativescript which is not yet compatible with latest Node, so we'll use Node 11:

    nvm use 11

Then install discovery-cli with yarn:

    yarn global add @enigmampc/discovery-cli

Yarn 1.16.0

When running:

    discovery init

I had a problem with Docker. It's beacause on my dev machine, I manage Docker with sudo. To avoid wasting too much time, I temporarily followed [Manage Docker a non-root user](https://docs.docker.com/install/linux/linux-postinstall/)

The Docker images are pretty beefy (15 GB) so be sure to have enough disk space... unlike me https://forum.enigma.co/t/help-with-init-moved/1020/13 ;)

/home/guix/.config/yarn/global/node_modules/clui/node_modules/cli-color/trim.js:8
module.exports = function (str) { return str.replace(r, ''); };
                                             ^

    TypeError: Cannot read property 'replace' of undefined
        at module.exports (/home/guix/.config/yarn/global/node_modules/clui/node_modules/cli-color/trim.js:8:46)
        at Line.column (/home/guix/.config/yarn/global/node_modules/clui/lib/clui.js:293:23)
        at /home/guix/.config/yarn/global/node_modules/@enigmampc/discovery-cli/src/docker.js:45:14
        at Array.forEach (<anonymous>)
        at IncomingMessage.stream.on (/home/guix/.config/yarn/global/node_modules/@enigmampc/discovery-cli/src/docker.js:10:30)
        at IncomingMessage.emit (events.js:193:13)
        at IncomingMessage.EventEmitter.emit (domain.js:481:20)
        at addChunk (_stream_readable.js:295:12)
        at readableAddChunk (_stream_readable.js:276:11)
        at IncomingMessage.Readable.push (_stream_readable.js:231:10)
        at HTTPParser.parserOnBody (_http_common.js:126:22)
        at Socket.socketOnData (_http_client.js:447:22)
        at Socket.emit (events.js:193:13)
        at Socket.EventEmitter.emit (domain.js:481:20)
        at addChunk (_stream_readable.js:295:12)
        at readableAddChunk (_stream_readable.js:276:11)
        at Socket.Readable.push (_stream_readable.js:231:10)
        at Pipe.onStreamRead (internal/stream_base_commons.js:154:17)

the code to add in 2_deploy_contracts.js must be added inside of module.exports = async function(deployer, network, accounts) {}