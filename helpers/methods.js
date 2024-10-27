const { log } = require('console');
const fs = require('fs');
const os = require('os');
const path = require('path');
const generateOtp = () => {
    var otp = Math.ceil(Math.random() * 10000).toString();
    otp = otp.length < 3 ? otp.concat('9') : otp;
    otp = otp.length < 4 ? otp.concat('7') : otp;
    return otp;
    // return "3793";
}
const uuid = (phoneNumber) => {
    // const charset = "0123456789";
    // let uuid = "";
    // for (let i = 0, n = charset.length; i < 7; ++i) {
    //     uuid += charset.charAt(Math.floor(Math.random() * n));
    // }
    return phoneNumber.startsWith("0") ? phoneNumber.slice(1,) : phoneNumber;
    // return phoneNumber;

    // return uuid;
}

const generateReferralCode = (firstName, phone) => {
    let suffix = "HS-";
    let prefix = firstName.slice(0, firstName.length > 3 ? 3 : firstName.length) + phone.slice(8, 11);
    return suffix + prefix.toString().toUpperCase();
}

const generateId = () => {
    return Date.now().toString();

}
const generatePassword = (length) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }

    return password;

}

function createTempFile(data, extension = 'png') {
    console.log(data);
    const uint8Data = new Uint8Array(data);
    return new Promise((resolve, reject) => {
        const tempFilePath = path.join(os.tmpdir(), `temp_${Date.now()}.${extension}`);

        fs.writeFile(tempFilePath, uint8Data, 'binary', (err) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(tempFilePath);
                resolve(tempFilePath);
            }
        });
    });
}

const monifyAccountRef = (email) =>{
    let coded = Buffer.from(email).toString('base64');
    return `px-user-${coded}`;
}
const accountName = (fname, lname) =>{
    return `PX-${fname} ${lname}`;
}

const withdrawalRef = ()=>{
    return Date.now();
}

    

module.exports = { generateOtp, generateReferralCode, uuid, generateId, generatePassword, createTempFile, monifyAccountRef, accountName, withdrawalRef };