import { notFound } from 'next/navigation';
import { requireAdmin } from '@/app/lib/admin';
import Navbar from '@/app/components/Navbar';
import OperationsBoard from './OperationsBoard';
export const dynamic = 'force-dynamic';
export default async function OperationsPage() {
  if (!await requireAdmin()) notFound();
  return <><Navbar /><main className="pt-32 pb-20 px-6 max-w-6xl mx-auto"><h1 className="text-3xl font-bold text-text">TokenShrink operations</h1><OperationsBoard /></main></>;
}
