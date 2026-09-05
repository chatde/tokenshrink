import { describe, it, expect, vi, beforeEach } from 'vitest';
import Stripe from 'stripe';
const mocks = vi.hoisted(() => ({execute:vi.fn(),select:vi.fn(),limit:vi.fn(),rate:vi.fn(),retrieve:vi.fn()}));
vi.mock('@/app/lib/db', () => ({db:{execute:mocks.execute,select:mocks.select}}));
vi.mock('@/app/lib/rate-limit', () => ({checkRateLimit:mocks.rate,rateLimitResponse:()=>new Response('{}',{status:429})}));
vi.mock('@/app/lib/stripe', () => ({getStripe:()=>({webhooks:new Stripe('sk_test_local_only').webhooks,subscriptions:{retrieve:mocks.retrieve}})}));
import { POST as analytics } from '../app/api/analytics/route.js';
import { POST as webhook } from '../app/api/billing/webhook/route.js';
import { subscriptionState } from '../app/lib/subscription-state.js';
import { compressHistory } from '../sdk/src/history.js';
import { encode } from 'gpt-tokenizer/encoding/cl100k_base';

beforeEach(()=>{
 vi.clearAllMocks(); mocks.rate.mockResolvedValue({allowed:true});mocks.execute.mockResolvedValue([]);
 mocks.limit.mockResolvedValue([{id:'user-test'}]);
 mocks.select.mockReturnValue({from:()=>({where:()=>({limit:mocks.limit})})});
 process.env.STRIPE_WEBHOOK_SECRET='whsec_local_test';process.env.STRIPE_ADVANCED_PRICE_ID='price_month';
 process.env.STRIPE_ADVANCED_ANNUAL_PRICE_ID='price_year';
});
const request=body=>new Request('https://example.test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const valid={event:'compress',before:100,after:80,source:'sdk'};
describe('analytics endpoint persistence',()=>{
 it('writes valid telemetry',async()=>{expect((await analytics(request(valid))).status).toBe(200);expect(mocks.execute).toHaveBeenCalledOnce()});
 it.each([null,[],{...valid,before:-1},{...valid,after:101},{...valid,before:1.5},{...valid,event:'bad'},{...valid,source:'x'.repeat(65)}])('rejects malformed telemetry %j',async body=>{expect((await analytics(request(body))).status).toBe(400);expect(mocks.execute).not.toHaveBeenCalled()});
 it('reports a database outage',async()=>{mocks.execute.mockRejectedValue(new Error('offline'));const r=await analytics(request(valid));expect(r.status).toBe(503);expect(await r.json()).toMatchObject({ok:false})});
 it('returns CORS headers when rate limited',async()=>{mocks.rate.mockResolvedValue({allowed:false});const r=await analytics(request(valid));expect(r.status).toBe(429);expect(r.headers.get('Access-Control-Allow-Origin')).toBe('*')});
});
const sub={id:'sub_test',customer:'cus_test',status:'active',items:{data:[{price:{id:'price_month'},current_period_start:1700000000,current_period_end:1702592000}]}};
function signedRequest(type='customer.subscription.updated'){
 const payload=JSON.stringify({id:'evt_test',created:1700000010,type,data:{object:type==='checkout.session.completed'?{subscription:'sub_test'}:{id:'sub_test'}}});
 const signature=new Stripe('sk_test_local_only').webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET});
 return new Request('https://example.test',{method:'POST',headers:{'stripe-signature':signature},body:payload});
}
describe('Stripe synchronization',()=>{
 it('reads current API item periods',()=>{expect(subscriptionState(sub).currentPeriodEnd.toISOString()).toBe('2023-12-14T22:13:20.000Z')});
 it('supports legacy top-level periods',()=>{expect(subscriptionState({...sub,current_period_start:1,current_period_end:2,items:{data:[{price:{id:'price_month'}}]}}).currentPeriodEnd.getTime()).toBe(2000)});
 it('does not grant paid access for failed payment status',()=>{expect(subscriptionState({...sub,status:'past_due'}).plan).toBe('free')});
 it('ignores other Stripe products',()=>{expect(subscriptionState({...sub,items:{data:[{price:{id:'unrelated'}}]}})).toBeNull()});
 it('rejects missing period data instead of storing invalid dates',()=>{expect(()=>subscriptionState({...sub,items:{data:[{price:{id:'price_month'}}]}})).toThrow()});
 it('rejects forged events',async()=>{expect((await webhook(request({}))).status).toBe(400);expect(mocks.execute).not.toHaveBeenCalled()});
 it.each(['checkout.session.completed','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'])('synchronizes %s from current Stripe state',async type=>{mocks.retrieve.mockResolvedValue(sub);expect((await webhook(signedRequest(type))).status).toBe(200);expect(mocks.retrieve).toHaveBeenCalledWith('sub_test');expect(mocks.execute).toHaveBeenCalledOnce()});
 it('requests a retry if persistence fails',async()=>{mocks.retrieve.mockResolvedValue(sub);mocks.execute.mockRejectedValue(new Error('offline'));expect((await webhook(signedRequest())).status).toBe(500)});
});
it('history forwards tokenizer and honors analytics opt-out',()=>{
 const fetchMock=vi.spyOn(globalThis,'fetch').mockResolvedValue({ok:true});
 try {
 const text='It is important to validate all user input carefully. Please make sure to handle errors properly. In order to build robust applications, you must follow best practices. For the purpose of testing, write comprehensive test cases.';
 const result=compressHistory([{role:'user',content:text}],{tokenizer:t=>encode(t).length,analytics:false});
 expect(result.stats.totalTokensBefore).toBe(encode(text).length);
 expect(result.stats.totalTokensAfter).toBe(encode(result.messages[0].content).length);
 expect(fetchMock).not.toHaveBeenCalled();
 }finally{fetchMock.mockRestore()}
});
