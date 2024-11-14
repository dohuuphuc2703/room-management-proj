const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InvoiceSchema = new Schema({
    contract: { 
        type: Schema.Types.ObjectId, 
        ref: "Contract",
        unique: true,
        required: true,
    }, 

    title: {
        type: String,
        default: null,
    },

    totalOfSv :[{
        name: {
            type: String,
            default: null,
        },
        quantity: {
            type: Number,
            default: null,
        },
        totalAmount: {
            type: Number,
            default: null,
        },
    }],

    status: {
        type: Boolean,
        default: false,
    },

    total: {
        type: Number,
        default: null,
    },

},{
    timestamps : true,
});

module.exports = mongoose.model("Invoice", InvoiceSchema, "tblInvoice");