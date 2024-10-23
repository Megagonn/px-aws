// // Install with: npm i flutterwave-node-v3
// const request = require('request');
// const axios = require('axios').default;
// const Flutterwave = require('flutterwave-node-v3');
// const { generateId } = require('./methods');
// const flw = new Flutterwave(process.env.PK, process.env.SK);


// const createTempAccount = async (email, amount, narration, ref) => {

//     const details = {
//         email: email,
//         amount,
//         narration,
//         tx_ref: ref,
//         is_permanent: false,
//     };
//     var getAccount = await flw.VirtualAcct.create(details);

//     return getAccount.status === 'success' ? { status: true, payload: getAccount.data } : { status: false, payload: getAccount };
// }

// const withdraw = async (bankCode, accountNumber, amount,) => {
//     const details = {
//         account_bank: "044",
//         account_number: "0690000040",
//         amount: 200,
//         currency: "NGN",
//         narration: "Withdrawal on PartyXpender",
//         reference: "dfs23fhr7ntg0293039_PMCK",
//         // reference: generateId(),
//     };
//     var initiateTransfer = await flw.Transfer.initiate(details);
//     return initiateTransfer.status === 'success' ? { status: true, payload: initiateTransfer.data } : { status: false, payload: initiateTransfer };
// }

// const getAllBanks = async () => {
//     const header = {
//         authorization: `Bearer ${process.env.SK}`,
//         content_type: "Content-Type: application/json",
//     }
//     let res = await axios.get("https://api.flutterwave.com/v3/banks/NG", {
//         headers: header
//     });
//     return res.data.status == 'success' ? { status: true, payload: res.data.data } : { status: false, payload: res.data };
// }

// module.exports = { createTempAccount, withdraw, getAllBanks }