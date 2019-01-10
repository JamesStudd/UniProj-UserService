const creditCard = /^[0-9]{16}$/;
const emailValidate = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * Takes a string, strips away any dashes and validates that is 16 in length and only numeric.
 * @param {String} str 
 */
function isCreditCardNumber(str) {
    if (!str) return false;
    var ccNumber = str.toString();
    let sanitized = ccNumber.replace(/[- ]+/g, '');
    return creditCard.test(sanitized);
}

/**
 * Takes a string, validates it against the emailValidate regex to validate an email.
 * @param {String} str 
 */
function isEmail(str) {
    return emailValidate.test(str);
}

// Export these 2 functions to other files.
module.exports.isCreditCardNumber = isCreditCardNumber;
module.exports.isEmail = isEmail;
