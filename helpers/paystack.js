// const dedicated_account = 
const axios = require('axios').default;
const sk = process.env.SK
const mak = process.env.MONIFY_API_KEY
const msk = process.env.MONIFY_SECRET_KEY
const contractCode = process.env.CONTRACT_CODE
const rootURL = "https://sandbox.monnify.com";
const reservedURL = "/api/v2/bank-transfer/reserved-accounts";
const loginURL = "https://sandbox.monnify.com/api/v1/auth/login";

//API KEY: MK_TEST_G82V12HHQU
//SCRET KEY: SGVG0XN68VWXHFA4CSNPU87VXA8M7RWM

const getTokenFromMonify = async () => {
    try {
        let encodedToken = Buffer.from(`${mak}:${msk}`).toString('base64');
        console.log(encodedToken);

        let res = await axios.post(loginURL, {}, {
            headers: {
                'Authorization': `Basic ${encodedToken}`
            }
        })
        console.log(`This getTokenRes ${res}`);

        if (res.data.requestSuccessful) {
            console.log(res.data.responseBody.accessToken);

            return res.data.responseBody.accessToken;
        } return false;

    } catch (error) {
        console.log(error);
        return false;

    }
}

const createMonnifyAccount = async (customer, first_name, last_name, phone) => {
    try {
        let token = await getTokenFromMonify();
        const header = {
            authorization: `Bearer ${token}`,
            content_type: "Content-Type: application/json",
        }
        let body = {
            "accountReference": "my_ref1",
            "accountName": "Adebowale JK",
            "currencyCode": "NGN",
            "contractCode": contractCode,
            "customerEmail": "wolvedolph@gmail.com",
            "bvn": "21212121212",
            "customerName": "John Doe",
            "getAllAvailableBanks": false,
            "preferredBanks": ["035","232","50515","058"]
        };
        let res = await axios.post(rootURL + reservedURL, body, {
            headers: header
        });
        console.log(res.data);

        return res.data.requestSuccessful ? { status: true, payload: res.data } : { status: false, payload: res.data };
    } catch (error) {
        console.log(error);
        return { status: false, payload: error }
    }
}
// const createAndAssignDVA = async (email, first_name, last_name, phone) => {
//     try {
//         const header = {
//             "Authorization": `Bearer ${sk}`,
//             "Content-Type": "application/json",
//         }
//         let createCustomer = await axios.post("https://api.paystack.co/customer", { email: email, first_name: first_name, last_name, phone: phone }, {
//             headers: header
//         });
//         console.log(createCustomer.data);
//         if (createCustomer.data.status) {

//             let res = await axios.post("https://api.paystack.co/dedicated_account", {
//                 customer: createCustomer.data.data.customer_code,
//                 "preferred_bank": "titan-paystack",
//                 email: email, first_name: first_name, last_name, phone: phone,
//                 country: "NG"
//             }, {
//                 headers: header
//             });
//             console.log(res.data);
//             return res.data.status ? { status: true, payload: res.data.data } : { status: false, payload: res.data.data };
//         } else {

//             return { status: false, payload: `DVA creation failed. \n\n${createCustomer.data.message}` }
//         }
//     } catch (error) {
//         return { status: false, payload: error }
//     }
// }

module.exports = { createMonnifyAccount }