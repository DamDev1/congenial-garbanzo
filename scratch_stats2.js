const mongoose = require('mongoose');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const mongoUriMatch = env.match(/MONGODB_URI=(.*)/);
const MONGODB_URI = mongoUriMatch ? mongoUriMatch[1].trim() : null;

if (!MONGODB_URI) {
  console.log("No mongo uri");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
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
