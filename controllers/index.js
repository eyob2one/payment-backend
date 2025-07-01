const paymentController = require('./paymentController');
const businessController = require('./businessController');

module.exports = {
    ...paymentController,
    ...businessController
};