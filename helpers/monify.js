// const dedicated_account = 
const axios = require('axios').default;
const sk = process.env.SK
const mak = process.env.MONIFY_API_KEY
const msk = process.env.MONIFY_SECRET_KEY
const contractCode = process.env.CONTRACT_CODE
const rootURL = "https://sandbox.monnify.com";
const reservedURL = "/api/v2/bank-transfer/reserved-accounts";
const loginURL = "https://sandbox.monnify.com/api/v1/auth/login";
const accountDetails = "/api/v2/bank-transfer/reserved-accounts/";

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

const createMonnifyAccount = async (customer) => {
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

const fetchAccountDetails = async (accountRef) => {
    try {
        let token = await getTokenFromMonify();
        const header = {
            authorization: `Bearer ${token}`,
            content_type: "Content-Type: application/json",
        }
        let accountDetailsRes = await axios.get(rootURL+accountDetails+accountRef, {
            headers: header
        });
        console.log(accountDetailsRes.data);
        if (accountDetailsRes.data.requestSuccessful) {
            return  { status: true, payload: accountDetailsRes.data.responseBody };
        } else {

            return { status: false, payload: `Failed to fetch account details. \n\n${accountDetailsRes.data.responseMessage}` }
        }
    } catch (error) {
        return { status: false, payload: error }
    }
}

module.exports = { createMonnifyAccount, fetchAccountDetails }