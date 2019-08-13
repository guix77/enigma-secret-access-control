const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Enigma, utils, eeConstants } = require('enigma-js/node');

var EnigmaContract;
if (typeof process.env.SGX_MODE === 'undefined' || (process.env.SGX_MODE != 'SW' && process.env.SGX_MODE != 'HW')) {
  console.log(`Error reading ".env" file, aborting....`);
  process.exit();
} else if (process.env.SGX_MODE == 'SW') {
  EnigmaContract = require('../build/enigma_contracts/EnigmaSimulation.json');
} else {
  EnigmaContract = require('../build/enigma_contracts/Enigma.json');
}
const EnigmaTokenContract = require('../build/enigma_contracts/EnigmaToken.json');


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const splitMessages = decryptedOutput => {
  console.log(decryptedOutput)
  // const decodedParameters = web3.eth.abi.decodeParameters(
  //   [
  //     {
  //       type: 'string',
  //       name: 'concatenatedMessages',
  //     },
  //     {
  //       type: 'uint[]',
  //       name: 'messagesLengths'
  //     }
  //   ],
  //   decryptedOutput
  // )
  // console.log(decodedParameters)
  // let pointer = 0
  // return messagesLengths.map(messageLength => {
  //   const message = decodedParameters.substring(pointer, pointer + messageLength)
  //   pointer += messageLength
  //   return message
  // })
  return []
}

let enigma = null;
let contractAddr;

contract("SecretAccessControl", accounts => {
  const alice = accounts[0]
  const bob = accounts[1]
  const charles = accounts[2]
  const dave = accounts[3]
  const eve = accounts[4]
  const taskGasLimit = 10000000
  const taskGasPx = utils.toGrains(1e-7)

  before(function () {
    enigma = new Enigma(
      web3,
      EnigmaContract.networks['4447'].address,
      EnigmaTokenContract.networks['4447'].address,
      'http://localhost:3346',
      {
        gas: 4712388,
        gasPrice: 100000000000,
        from: alice,
      },
    );
    enigma.admin();

    contractAddr = fs.readFileSync('test/secret_access_control.txt', 'utf-8');
  });

  let task;

  // Alice sends a secret message to Bob and Charles.
  it('Alice should send a secret message to Bob and Charles', async () => {
    let taskFn = 'send_secret_message(address[],string)';
    let taskArgs = [
      [[bob, charles], 'address[]'],
      ["Hi Bob and Charles!", 'string'],
    ];
    task = await new Promise((resolve, reject) => {
      enigma.computeTask(taskFn, taskArgs, taskGasLimit, taskGasPx, alice, contractAddr)
        .on(eeConstants.SEND_TASK_INPUT_RESULT, (result) => resolve(result))
        .on(eeConstants.ERROR, (error) => reject(error));
    });
    // Task should be pending.
    task = await enigma.getTaskRecordStatus(task);
    expect(task.ethStatus).to.equal(1);
    // Task should be completed after a while.
    do {
      await sleep(1000);
      task = await enigma.getTaskRecordStatus(task);
    } while (task.ethStatus === 1);
    expect(task.ethStatus).to.equal(2);
  });

  // Bob reads his messages.
  it('Bob should have 1 message from Alice', async () => {
    let taskFn = 'read_messages()';
    let taskArgs = [];
    task = await new Promise((resolve, reject) => {
      enigma.computeTask(taskFn, taskArgs, taskGasLimit, taskGasPx, bob, contractAddr)
        .on(eeConstants.SEND_TASK_INPUT_RESULT, (result) => resolve(result))
        .on(eeConstants.ERROR, (error) => reject(error));
    });
    // Task should be pending.
    task = await enigma.getTaskRecordStatus(task);
    expect(task.ethStatus).to.equal(1);
    // Task should be completed after a while.
    do {
      await sleep(1000);
      task = await enigma.getTaskRecordStatus(task);
    } while (task.ethStatus === 1);
    expect(task.ethStatus).to.equal(2);
    // Bob should get 1 message from Alice.
    task = await new Promise((resolve, reject) => {
      enigma.getTaskResult(task)
        .on(eeConstants.GET_TASK_RESULT_RESULT, (result) => resolve(result))
        .on(eeConstants.ERROR, (error) => reject(error));
    });
    expect(task.engStatus).to.equal('SUCCESS');
    task = await enigma.decryptTaskResult(task);
    const messages = splitMessages(task.decryptedOutput)
    // deep.equal instead of equal
    // @see https://medium.com/@victorleungtw/testing-with-mocha-array-comparison-e9a45b57df27
    expect(messages).to.deep.equal(
      [
        'Hi Bob and Charles!'
      ]
    )
  });

  // // Alice sends another secret message to Bob and Dave.
  // it('Alice should send a secret message to Bob and Dave', async () => {
  //   let taskFn = 'send_secret_message(address[],string)';
  //   let taskArgs = [
  //     [[bob, dave], 'address[]'],
  //     ["Hi Bob and Dave!", 'string'],
  //   ];
  //   task = await new Promise((resolve, reject) => {
  //     enigma.computeTask(taskFn, taskArgs, taskGasLimit, taskGasPx, alice, contractAddr)
  //       .on(eeConstants.SEND_TASK_INPUT_RESULT, (result) => resolve(result))
  //       .on(eeConstants.ERROR, (error) => reject(error));
  //   });
  //   // Task should be pending.
  //   task = await enigma.getTaskRecordStatus(task);
  //   expect(task.ethStatus).to.equal(1);
  //   // Task should be completed after a while.
  //   do {
  //     await sleep(1000);
  //     task = await enigma.getTaskRecordStatus(task);
  //   } while (task.ethStatus === 1);
  //   expect(task.ethStatus).to.equal(2);
  // });

  // // Bob reads his messages again.
  // it('Bob should have 2 messages from Alice', async () => {
  //   let taskFn = 'read_messages()';
  //   let taskArgs = [];
  //   task = await new Promise((resolve, reject) => {
  //       enigma.computeTask(taskFn, taskArgs, taskGasLimit, taskGasPx, bob, contractAddr)
  //           .on(eeConstants.SEND_TASK_INPUT_RESULT, (result) => resolve(result))
  //           .on(eeConstants.ERROR, (error) => reject(error));
  //   });
  //   // Task should be pending.
  //   task = await enigma.getTaskRecordStatus(task);
  //   expect(task.ethStatus).to.equal(1);
  //   // Task should be completed after a while.
  //   do {
  //     await sleep(1000);
  //     task = await enigma.getTaskRecordStatus(task);
  //   } while (task.ethStatus === 1);
  //   // TODO: task is failing (ethStatus = 3), why? It's the same as before.
  //   //console.log(task)
  //   expect(task.ethStatus).to.equal(2);
  //   // Bob should get 2 messages from Alice.
  //   task = await new Promise((resolve, reject) => {
  //   enigma.getTaskResult(task)
  //     .on(eeConstants.GET_TASK_RESULT_RESULT, (result) => resolve(result))
  //     .on(eeConstants.ERROR, (error) => reject(error));
  //   });
  //   expect(task.engStatus).to.equal('SUCCESS');
  //   task = await enigma.decryptTaskResult(task);
  //   // deep.equal instead of equal
  //   // @see https://medium.com/@victorleungtw/testing-with-mocha-array-comparison-e9a45b57df27
  //   console.log(task.decryptedOutput)
  //   expect(web3.eth.abi.decodeParameters([{
  //       type: 'string[]',
  //       name: 'messages',
  //   }], task.decryptedOutput).messages)
  //   .to.deep.equal([
  //     'Hi Bob and Charles!',
  //     'Hi Bob and Dave!'
  //     ]
  //   );
  // });

  // // Charles reads his messages.
  // it('Charles should have 1 message from Alice', async () => {
  //   let taskFn = 'read_messages()';
  //   let taskArgs = [];
  //   task = await new Promise((resolve, reject) => {
  //       enigma.computeTask(taskFn, taskArgs, taskGasLimit, taskGasPx, charles, contractAddr)
  //           .on(eeConstants.SEND_TASK_INPUT_RESULT, (result) => resolve(result))
  //           .on(eeConstants.ERROR, (error) => reject(error));
  //   });
  //   // Task should be pending.
  //   task = await enigma.getTaskRecordStatus(task);
  //   expect(task.ethStatus).to.equal(1);
  //   // Task should be completed after a while.
  //   do {
  //     await sleep(1000);
  //     task = await enigma.getTaskRecordStatus(task);
  //   } while (task.ethStatus === 1);
  //   expect(task.ethStatus).to.equal(2);
  //   // Charles should get 1 message from Alice.
  //   task = await new Promise((resolve, reject) => {
  //   enigma.getTaskResult(task)
  //     .on(eeConstants.GET_TASK_RESULT_RESULT, (result) => resolve(result))
  //     .on(eeConstants.ERROR, (error) => reject(error));
  //   });
  //   expect(task.engStatus).to.equal('SUCCESS');
  //   task = await enigma.decryptTaskResult(task);
  //   // deep.equal instead of equal
  //   // @see https://medium.com/@victorleungtw/testing-with-mocha-array-comparison-e9a45b57df27
  //   expect(web3.eth.abi.decodeParameters([{
  //       type: 'string[]',
  //       name: 'messages',
  //   }], task.decryptedOutput).messages)
  //   .to.deep.equal([
  //     'Hi Bob and Charles!'
  //     ]
  //   );
  // });

  // // Dave reads his messages.
  // it('Dave should have 1 message from Alice', async () => {
  //   let taskFn = 'read_messages()';
  //   let taskArgs = [];
  //   task = await new Promise((resolve, reject) => {
  //       enigma.computeTask(taskFn, taskArgs, taskGasLimit, taskGasPx, dave, contractAddr)
  //           .on(eeConstants.SEND_TASK_INPUT_RESULT, (result) => resolve(result))
  //           .on(eeConstants.ERROR, (error) => reject(error));
  //   });
  //   // Task should be pending.
  //   task = await enigma.getTaskRecordStatus(task);
  //   expect(task.ethStatus).to.equal(1);
  //   // Task should be completed after a while.
  //   do {
  //     await sleep(1000);
  //     task = await enigma.getTaskRecordStatus(task);
  //   } while (task.ethStatus === 1);
  //   expect(task.ethStatus).to.equal(2);
  //   // Dave should get 1 message from Alice.
  //   task = await new Promise((resolve, reject) => {
  //   enigma.getTaskResult(task)
  //     .on(eeConstants.GET_TASK_RESULT_RESULT, (result) => resolve(result))
  //     .on(eeConstants.ERROR, (error) => reject(error));
  //   });
  //   expect(task.engStatus).to.equal('SUCCESS');
  //   task = await enigma.decryptTaskResult(task);
  //   // deep.equal instead of equal
  //   // @see https://medium.com/@victorleungtw/testing-with-mocha-array-comparison-e9a45b57df27
  //   expect(web3.eth.abi.decodeParameters([{
  //       type: 'string[]',
  //       name: 'messages',
  //   }], task.decryptedOutput).messages)
  //   .to.deep.equal([
  //     'Hi Bob and Dave!'
  //     ]
  //   );
  // });

  // // Eve reads her messages.
  // it('Eve should have no message from Alice', async () => {
  //   let taskFn = 'read_messages()';
  //   let taskArgs = [];
  //   task = await new Promise((resolve, reject) => {
  //       enigma.computeTask(taskFn, taskArgs, taskGasLimit, taskGasPx, eve, contractAddr)
  //           .on(eeConstants.SEND_TASK_INPUT_RESULT, (result) => resolve(result))
  //           .on(eeConstants.ERROR, (error) => reject(error));
  //   });
  //   // Task should be pending.
  //   task = await enigma.getTaskRecordStatus(task);
  //   expect(task.ethStatus).to.equal(1);
  //   // Task should be completed after a while.
  //   do {
  //     await sleep(1000);
  //     task = await enigma.getTaskRecordStatus(task);
  //   } while (task.ethStatus === 1);
  //   expect(task.ethStatus).to.equal(2);
  //   // Eve should get no message from Alice.
  //   task = await new Promise((resolve, reject) => {
  //   enigma.getTaskResult(task)
  //     .on(eeConstants.GET_TASK_RESULT_RESULT, (result) => resolve(result))
  //     .on(eeConstants.ERROR, (error) => reject(error));
  //   });
  //   expect(task.engStatus).to.equal('SUCCESS');
  //   task = await enigma.decryptTaskResult(task);
  //   // deep.equal instead of equal
  //   // @see https://medium.com/@victorleungtw/testing-with-mocha-array-comparison-e9a45b57df27
  //   expect(web3.eth.abi.decodeParameters([{
  //       type: 'string[]',
  //       name: 'messages',
  //   }], task.decryptedOutput).messages)
  //   .to.deep.equal([]);
  // });

});