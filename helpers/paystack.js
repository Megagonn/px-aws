// const dedicated_account = 
const axios = require('axios').default;
const sk = process.env.SK

const createDVAcustomer = async (customer, first_name, last_name, phone) => {
    try {
        const header = {
            authorization: `Bearer ${sk}`,
            content_type: "Content-Type: application/json",
        }
        let res = await axios.post("https://api.paystack.co/dedicated_account", {
            customer,
            "preferred_bank": "titan-paystack",
            first_name,
            last_name,
            phone
        }, {
            headers: header
        });
        return res.data.status ? { status: true, payload: res.data } : { status: false, payload: res.data };
    } catch (error) {
        return { status: false, payload: error }
    }
}
const createAndAssignDVA = async (email, first_name, last_name, phone) => {
    try {
        const header = {
            "Authorization": `Bearer ${sk}`,
            "Content-Type": "application/json",
        }
        let createCustomer = await axios.post("https://api.paystack.co/customer", { email: email, first_name: first_name, last_name, phone: phone }, {
            headers: header
        });
        console.log(createCustomer.data);
        if (createCustomer.data.status) {

            let res = await axios.post("https://api.paystack.co/dedicated_account", {
                customer: createCustomer.data.data.customer_code,
                "preferred_bank": "titan-paystack",
                email: email, first_name: first_name, last_name, phone: phone,
                country: "NG"
            }, {
                headers: header
            });
            console.log(res.data);
            return res.data.status ? { status: true, payload: res.data.data } : { status: false, payload: res.data.data };
        } else {

            return { status: false, payload: `DVA creation failed. \n\n${createCustomer.data.message}` }
        }
    } catch (error) {
        return { status: false, payload: error }
    }
}

module.exports = { createDVAcustomer, createAndAssignDVA }