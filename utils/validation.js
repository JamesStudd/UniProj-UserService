const creditCard = /^[0-9]{16}$/;
const emailValidate = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

function isCreditCardNumber(str) {
    if (!str) return false;
    var ccNumber = str.toString();
    let sanitized = ccNumber.replace(/[- ]+/g, '');
    return creditCard.test(sanitized);
}

function isEmail(str) {
    return emailValidate.test(str);
}

module.exports.isCreditCardNumber = isCreditCardNumber;
module.exports.isEmail = isEmail;
