'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';
export default function FeedbackPage() {
  const [category, setCategory] = useState('bug');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category, message }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not send feedback');
      setReference(data.id); setMessage('');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <><Navbar /><main className="pt-32 pb-20 px-6 max-w-2xl mx-auto">
    <h1 className="text-3xl font-bold text-text">Help improve TokenShrink</h1>
    <p className="mt-3 text-text-secondary">Report a problem, suggest an improvement, or ask a question. Feedback is private to the project team.</p>
    {reference ? <div role="status" className="mt-8 border border-savings rounded-xl p-6"><h2 className="text-xl text-savings">Thank you for the feedback.</h2><p className="mt-2">We saved your message for review.</p><p className="text-xs mt-2 break-all">Reference: {reference}</p><button className="mt-4 underline" onClick={()=>setReference('')}>Send another message</button></div> :
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block">Category<select value={category} onChange={e=>setCategory(e.target.value)} className="block w-full mt-2 bg-bg-card border border-border rounded p-3"><option value="bug">Bug report</option><option value="idea">Feature idea</option><option value="question">Question</option><option value="other">Other</option></select></label>
      <label className="block">Your feedback<textarea required minLength={10} maxLength={2000} rows={7} value={message} onChange={e=>setMessage(e.target.value)} aria-describedby="feedback-help" className="block w-full mt-2 bg-bg-card border border-border rounded p-3" /></label>
      <p id="feedback-help" className="text-sm text-text-muted">Please omit passwords, API keys, and private prompt content. Feedback may be summarized with AI to help our team review it.</p>
      {error && <p role="alert" className="text-red-400">{error}</p>}
      <button disabled={busy} className="rounded bg-savings text-bg px-5 py-3 disabled:opacity-50">{busy?'Sending…':'Send feedback'}</button>
    </form>}
  </main></>;
}
