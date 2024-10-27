const { monifyAccountRef, accountName } = require('./methods');

// const dedicated_account = 
const axios = require('axios').default;
const sk = process.env.SK
const mak = process.env.MONIFY_API_KEY
const msk = process.env.MONIFY_SECRET_KEY
const contractCode = process.env.CONTRACT_CODE
const rootURL = "https://sandbox.monnify.com";
const reservedURL = "/api/v2/bank-transfer/reserved-accounts";
const loginURL = "https://sandbox.monnify.com/api/v1/auth/login";
const accountDetailsURL = "/api/v2/bank-transfer/reserved-accounts/";
const allBanksURL = "/api/v1/sdk/transactions/banks";
const balanceURL = "/api/v2/disbursements/wallet-balance?accountNumber=";
const sendMoneyURL = "/api/v2/disbursements/single";
const deallocateAccountURL = "/api/v1/bank-transfer/reserved-accounts/reference/";

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
        let accountRef = monifyAccountRef(customer.email);
        let pxAccountName = accountName(customer.first_name, customer.last_name);
        const header = {
            authorization: `Bearer ${token}`,
            content_type: "Content-Type: application/json",
        }

        let body = {
            "accountReference": accountRef,
            "accountName": pxAccountName,
            "currencyCode": "NGN",
            "contractCode": contractCode,
            "customerEmail": customer.email,
            "bvn": "21212121212",
            "customerName": `${customer.first_name} ${customer.last_name}`,
            "getAllAvailableBanks": false,
            "preferredBanks": ["035"],
        };
        let res = await axios.post(rootURL + reservedURL, body, {
            headers: header
        });
        console.log(res.data);

        return res.data.requestSuccessful ? { status: true, payload: res.data.responseBody } : { status: false, payload: res.data };
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
        let accountDetailsRes = await axios.get(rootURL + accountDetailsURL + accountRef, {
            headers: header
        });
        console.log(accountDetailsRes.data);
        if (accountDetailsRes.data.requestSuccessful) {
            return { status: true, payload: accountDetailsRes.data.responseBody };
        } else {

            return { status: false, payload: `Failed to fetch account details. \n\n${accountDetailsRes.data.responseMessage}` }
        }
    } catch (error) {
        return { status: false, payload: error }
    }
}

const allBanks = async() => {
    try {
        let token = await getTokenFromMonify();
        const header = {
            authorization: `Bearer ${token}`,
            content_type: "Content-Type: application/json",
        }
        let res = await axios.post(rootURL+allBanksURL, {}, {
            headers: header
        })
        res.data.requestSuccessful ? { status: true, payload: res.data.responseBody } : { status: false, payload: `Failed to fetch banks' list. \n\n${res.data.responseMessage}` };
    } catch (error) {
        return { status: false, payload: error }
        
    }
}

const getBalance = async(accountNumber)=>{
    try {
        let token = await getTokenFromMonify();
        const header = {
            authorization: `Bearer ${token}`,
            content_type: "Content-Type: application/json",
        }

        let res = await axios.get(rootURL+balanceURL+accountNumber, {
            headers: header
        });

        res.data.requestSuccessful ? { status: true, payload: res.data.responseBody } : { status: false, payload: `Failed to fetch balance. \n\n${res.data.responseMessage}` };

    } catch (error) {
        return { status: false, payload: error }
        
    }
}

const sendMoney = async(sender, reciever, amount)=>{
    try {
        let token = await getTokenFromMonify();
        const header = {
            authorization: `Bearer ${token}`,
            content_type: "Content-Type: application/json",
        }
        
        let body = {
            "amount": 20,
            "reference":"ben9-jlo00hdhdjjdfjoj--i",
            "narration":"Test01",
            "destinationBankCode": "057",
            "destinationAccountNumber": "2085096393",
            "currency": "NGN",
            "sourceAccountNumber": "8016472829",
            "destinationAccountName": "Marvelous Benji"
        };
        let res = await axios.post(rootURL+sendMoneyURL, body, {
            headers: header
        });

        console.log(res.data);
        
    } catch (error) {
        
    }
}

module.exports = { createMonnifyAccount, fetchAccountDetails, allBanks, getBalance }