const authCtrl = require("./auth");
const userCtrl = require("./user");
const inqCtrl = require("./inquiry");
const testCtrl = require("./test");
const quoteCtrl = require("./quotation");
const poCtrl = require("./purchase-order");
const classCtrl = require("./classification");
const custCtrl = require("./customer");
const invCtrl = require("./inventory");
const bundleCtrl = require("./bundle");
const contractCtrl = require('./contract')

module.exports = {
  userCtrl,
  testCtrl,
  authCtrl,
  inqCtrl,
  quoteCtrl,
  poCtrl,
  classCtrl,
  custCtrl,
  invCtrl,
  bundleCtrl,
  contractCtrl
};
