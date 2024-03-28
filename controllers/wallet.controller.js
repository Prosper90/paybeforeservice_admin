require("dotenv").config();
const bcrypt = require("bcrypt");
const { sendResponseWithToken } = require("../utils/handleResponse");
const { makecall } = require("../utils/makeRequest");
const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse.js");
const { generateLocalHeader } = require("../utils/genHeadersData");
const { sendOtp } = require("../utils/sendOtp");
//const client = new twilio(process.env.TwilloaccountSid, process.env.TwilloauthToken);
const { v4: uuidv4 } = require("uuid");
const { User } = require("../models/Users");
const { createToken } = require("../utils/createTokens");



exports.WalletInfo = async (req, res, next) => {
    try {
        const localapiUrl = `${process.env.LOCAL_BASE}/v1/accounts/${process.env.PAYBEFORESERVICE_ACCOUNT_ID}`;
        const headers = generateLocalHeader();
      
        const responseLocal = await makecall(localapiUrl, {}, headers, "get", next);
        if (!responseLocal.success) return { status: false, message: responseLocal.message };
      
        const values = responseLocal?.data;
    
        // Fetch total balances from MongoDB
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to the beginning of the day
    
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); // Set time to the beginning of the next day

        // Aggregate to calculate total daily deposits for main and pending wallets
        const result = await User.aggregate([
                {
                $match: {
                    'createdAt': {
                    $gte: today,
                    $lt: tomorrow
                    }
                }
                },
                {
                $group: {
                    _id: null,
                    totalMainDeposit: { $sum: '$balances.main_wallet' },
                    totalPendingDeposit: { $sum: '$balances.pending_wallet' }
                }
                }
            ]);
            console.log(result, "initially");

            // Fetch total balances from MongoDB
            const pendingWallets = await User.aggregate([
                { $match: { status: 'pending' } },
                { $group: { _id: null, total: { $sum: '$balance.main_wallet' } } }
            ]);
            const mainWallets = await User.aggregate([
                { $match: { status: 'main' } },
                { $group: { _id: null, total: { $sum: '$balance.pending_wallet' } } }
            ]);

            const pendingWalletsTotal = pendingWallets.length > 0 ? pendingWallets[0].total : 0;
            const mainWalletsTotal = mainWallets.length > 0 ? mainWallets[0].total : 0;
            
            // return res.status(200).json({ status: true, data: result });

            // Extract the totals from the aggregation result
            // const { totalMainDeposit, totalPendingDeposit } = result[0];

            // console.log('Total Daily Main Deposit:', totalMainDeposit);
            // console.log('Total Daily Pending Deposit:', totalPendingDeposit);
    
    
            const totalUserBalances = pendingWalletsTotal + mainWalletsTotal;
    
            const returnObj = {
                wallet_balance: (values.available_balance/100),
                revenue: totalUserBalances || 0,
                total_main_today: result[0]?.totalMainDeposit || 0,
                total_pending_today: result[0]?.totalPendingDeposit || 0,
            };
    
        console.log('Total User Balances:', totalUserBalances);
        console.log('Total Revenue:', returnObj.revenue);
    
        return res.status(200).json({ status: true, data: returnObj });
      } catch (err) {
        next(err);
      }
};
