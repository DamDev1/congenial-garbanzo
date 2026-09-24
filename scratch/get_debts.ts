import connectDB from '../lib/db/mongoose';
import Transaction from '../lib/models/Transaction';
import '../lib/models/Branch';
import '../lib/models/Customer';

async function run() {
  await connectDB();
  const start = new Date();
  start.setHours(0,0,0,0);
  const end = new Date();
  end.setHours(23,59,59,999);
  
  const txs = await Transaction.find({ 
    status: 'completed', 
    createdAt: { $gte: start, $lte: end }, 
    creditAmount: { $gt: 0 } 
  }).populate('branchId').populate('customerId').lean();
  
  console.log(JSON.stringify(txs, null, 2));
  process.exit(0);
}
run();
