const crypto = require('crypto');
const config = require('../config/config');
const jsrsasign = require('jsrsasign');

// Fields not participating in signature
const excludeFields = [
  "sign",
  "sign_type",
  "header",
  "refund_info",
  "openType",
  "raw_request",
  "biz_content",
];

function signRequestObject(requestObject) {
  let fields = [];
  let fieldMap = {};
  
  // Collect all fields except excluded ones
  for (let key in requestObject) {
    if (excludeFields.indexOf(key) >= 0) continue;
    fields.push(key);
    fieldMap[key] = requestObject[key];
  }
  
  // Include fields from biz_content
  if (requestObject.biz_content) {
    let biz = requestObject.biz_content;
    for (let key in biz) {
      if (excludeFields.indexOf(key) >= 0) continue;
      fields.push(key);
      fieldMap[key] = biz[key];
    }
  }
  
  // Sort fields by ASCII
  fields.sort();
  
  // Create signature string
  let signStrList = [];
  for (let i = 0; i < fields.length; i++) {
    let key = fields[i];
    signStrList.push(key + "=" + fieldMap[key]);
  }
  
  let signOriginStr = signStrList.join("&");
  return signString(signOriginStr, config.privateKey);
}

function signString(text, privateKey) {
  const sig = new jsrsasign.KJUR.crypto.Signature({alg: "SHA256withRSA"});
  sig.init(privateKey);
  sig.updateString(text);
  return jsrsasign.hextob64(sig.sign());
}

function createTimeStamp() {
  return Math.round(new Date() / 1000) + "";
}

function createNonceStr() {
  let chars = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
    "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
    "U", "V", "W", "X", "Y", "Z"
  ];
  
  let str = "";
  for (let i = 0; i < 32; i++) {
    let index = parseInt(Math.random() * 35);
    str += chars[index];
  }
  return str;
}

function validatePhoneNumber(phone) {
  const regex = /^\+251\d{9}$/;
  return regex.test(phone);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB'
  }).format(amount);
}

module.exports = {
  signString,
  signRequestObject,
  createTimeStamp,
  createNonceStr,
  validatePhoneNumber,
  formatCurrency
};