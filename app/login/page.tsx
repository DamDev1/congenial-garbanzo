import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';


export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    if (session.user.role === 'owner') {
      redirect('/owner');
    } else if (session.user.role === 'manager') {
      redirect('/manager');
    } else {
      redirect('/cashier');
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[440px] px-8 py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-500 text-[15px]">
            Enter your email and password to access your account.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
