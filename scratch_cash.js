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
  const Expense = mongoose.connection.collection('expenses');
  const PosExchange = mongoose.connection.collection('posexchanges');

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

  const expenses = await Expense.find({
    date: { $gte: todayStart, $lte: todayEnd }
  }).toArray();

  const posExchanges = await PosExchange.find({
    date: { $gte: todayStart, $lte: todayEnd }
  }).toArray();

  let grossCash = 0;
  for (const t of txs) {
    if (t.cashAmount > 0) {
      grossCash += t.cashAmount;
    }
  }

  let debtCash = 0;
  for (const d of dps) {
    if (d.cashAmount > 0) {
      debtCash += d.cashAmount;
    }
  }

  let cashExpenses = 0;
  for (const e of expenses) {
    if (e.method === 'cash') {
      cashExpenses += e.amount;
    }
  }

  let posCash = 0;
  for (const p of posExchanges) {
    if (p.cashGiven > 0) {
      posCash += p.cashGiven;
    }
  }

  console.log(`Gross Cash from Sales: ${grossCash}`);
  console.log(`Cash from Debt Payments: ${debtCash}`);
  console.log(`Cash Expenses: ${cashExpenses}`);
  console.log(`POS Cash Given: ${posCash}`);

  const netCash = grossCash + debtCash - cashExpenses - posCash;
  console.log(`\nCalculated Cash At Hand Currently: ${netCash}`);

  process.exit(0);
}

run().catch(console.error);
