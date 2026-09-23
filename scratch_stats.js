const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

async function run() {
  const Transaction = mongoose.connection.collection('transactions');
  const DebtPayment = mongoose.connection.collection('debtpayments');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const txs = await Transaction.find({
    status: 'completed',
    createdAt: { $gte: todayStart, $lte: todayEnd }
  }).toArray();

  const dps = await DebtPayment.find({
    createdAt: { $gte: todayStart, $lte: todayEnd }
  }).toArray();

  let creditTotal = 0;
  for (const t of txs) {
    if (t.creditAmount > 0) {
      console.log(`- Transaction ${t._id}: creditAmount = ${t.creditAmount}`);
      creditTotal += t.creditAmount;
    }
  }

  let paymentTotal = 0;
  for (const d of dps) {
    console.log(`- DebtPayment ${d._id}: amountPaid = ${d.amountPaid}, cash=${d.cashAmount}, transfer=${d.transferAmount}`);
    paymentTotal += (d.cashAmount + d.transferAmount);
  }

  console.log(`\nTotal Credit Today: ${creditTotal}`);
  console.log(`Total Debt Paid Today: ${paymentTotal}`);
  console.log(`Net Debt Today: ${creditTotal - paymentTotal}`);
  process.exit(0);
}

run().catch(console.error);
