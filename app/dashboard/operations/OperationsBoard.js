'use client';
import { useCallback, useEffect, useState } from 'react';
function FeedbackItem({ item, refresh }) {
  const [status,setStatus]=useState(item.status);
  const [resolution,setResolution]=useState(item.resolution||'');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function save(){
    setBusy(true);setError('');
    try{const r=await fetch(`/api/admin/feedback/${item.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status,resolution})});const data=await r.json();if(!r.ok)throw new Error(data.error);await refresh();}catch(e){setError(e.message)}finally{setBusy(false)}
  }
  return <article className="border border-border rounded-xl p-5 space-y-3 bg-bg-card">
    <p className="text-xs text-text-muted">{item.category} · {new Date(item.created_at).toLocaleDateString()} · {item.id}</p>
    <p className="whitespace-pre-wrap break-words">{item.message}</p>
    {item.summary && <p className="text-sm text-text-secondary">AI summary — review before acting: {item.summary}</p>}
    <label className="block text-sm">Status<select value={status} onChange={e=>setStatus(e.target.value)} className="block mt-1 p-2 rounded bg-bg border border-border">{['new','reviewing','planned','resolved'].map(s=><option key={s}>{s}</option>)}</select></label>
    <label className="block text-sm">Resolution or next step<textarea maxLength={2000} rows={2} value={resolution} onChange={e=>setResolution(e.target.value)} className="block w-full mt-1 p-2 rounded bg-bg border border-border" /></label>
    {error && <p role="alert" className="text-red-400">{error}</p>}
    <button disabled={busy} onClick={save} className="bg-savings text-bg rounded px-4 py-2 disabled:opacity-50">{busy?'Saving…':'Save status'}</button>
  </article>;
}
export default function OperationsBoard(){
 const [data,setData]=useState(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const refresh=useCallback(async()=>{setBusy(true);setError('');try{const r=await fetch('/api/admin/board',{cache:'no-store'});const d=await r.json();if(!r.ok)throw new Error(d.error);setData(d)}catch(e){setError(e.message)}finally{setBusy(false)}},[]);
 useEffect(()=>{refresh()},[refresh]);
 return <div className="mt-6 space-y-8">
  <div className="flex gap-4 items-center"><button disabled={busy} onClick={refresh} className="border border-border rounded px-4 py-2">{busy?'Loading…':'Refresh'}</button>{data&&<p className="text-xs text-text-muted">Updated {new Date(data.generatedAt).toLocaleString()}</p>}</div>
  {error&&<p role="alert" className="text-red-400">{error}</p>}
  {data&&<>
   <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[['Accounts',data.accounts.total],['New accounts · 30 days',data.accounts.new_accounts],['Logged requests · 30 days',data.usage.requests],['Active accounts · 30 days',data.usage.active_accounts]].map(([label,value])=><div key={label} className="p-5 border border-border rounded-xl bg-bg-card"><p className="text-sm text-text-muted">{label}</p><p className="text-3xl mt-2">{value}</p></div>)}</section>
   <p className="text-sm text-text-muted">Logged requests cover signed-in/API-key use. Anonymous and SDK telemetry is self-reported and shown separately; it is not unique users. Estimated savings are not verified provider bill reductions.</p>
   <section><h2 className="text-xl mb-3">Daily signed-in usage · 30 days</h2><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="p-2">Date</th><th>Requests</th><th>Active accounts</th></tr></thead><tbody>{data.daily.map(d=><tr key={d.day} className="border-t border-border"><td className="p-2">{d.day}</td><td>{d.requests}</td><td>{d.active_accounts}</td></tr>)}</tbody></table></div>{!data.daily.length&&<p>No recorded requests in this period.</p>}</section>
   <section><h2 className="text-xl mb-3">Self-reported telemetry · 30 days</h2><p className="text-sm text-text-muted mb-3">Collection begins with the tracking repair. Historical missing events cannot be recovered.</p>{data.telemetry.map(t=><p key={t.source}>{t.source}: {t.events} events · {Number(t.reported_tokens_saved).toLocaleString()} reported tokens saved</p>)}{!data.telemetry.length&&<p>No events recorded yet.</p>}</section>
   <section><h2 className="text-xl mb-4">Feedback inbox · latest 100</h2><div className="space-y-4">{data.feedback.map(f=><FeedbackItem key={f.id+f.updated_at} item={f} refresh={refresh}/>)}{!data.feedback.length&&<p>No feedback yet. Share the feedback page with users.</p>}</div></section>
  </>}
 </div>;
}
