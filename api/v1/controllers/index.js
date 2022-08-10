const authCtrl = require("./auth");
const userCtrl = require("./user");
const inqCtrl = require("./inquiry");
const testCtrl = require("./test");
const quoteCtrl = require("./quotation");
const poCtrl = require("./purchase-order");
const classCtrl = require("./classification");
const custCtrl = require("./customer");

module.exports = {
  userCtrl,
  testCtrl,
  authCtrl,
  inqCtrl,
  quoteCtrl,
  poCtrl,
  classCtrl,
  custCtrl,
};
