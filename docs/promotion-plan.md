# TokenShrink: first 10 activated users

Prepared 2026-09-05. Drafts only: nothing posted, sent, or purchased. Founder reviews every claim against the release actually live before publishing. No paid acquisition yet.

## Audience and outcome

Start with JavaScript developers who repeatedly send long natural-language instructions to an LLM. Invite them to test a synthetic version of one real workflow, compare complete input token counts, and check the resulting answer. Avoid asking for confidential prompts. Code-heavy prompts may deliberately pass through unchanged.

The goal is **10 distinct, non-owner accounts with a hosted request that records positive token savings**, followed by at least 3 returning on a different day within 7 days. These are pilot targets, not predictions. Successful compression means fewer counted input tokens; it does not establish unchanged answers or a lower provider bill. Record answer-quality feedback separately.

The free npm SDK and hosted free allowance are the entry point. The current paid hosted plan is called **Advanced**, at **$5/month** ($36/year), keeping full hosted compression available beyond 500 signed-in calls/month. Do not call experimental session dictionaries an included paid feature. The SDK remains free.

## Focused sequence

1. Before posting: smoke-test the anonymous homepage compressor, npm quick start, feedback submission, and owner metrics on the release being promoted. Save baseline non-owner positive-savings usage. Correct any unsupported accuracy or savings claims on the linked pages.
2. Day 1: publish the short founder note below on the project's own site or repository announcement space, if enabled. Publish the educational DEV article only after the founder understands and has verified every explanation. No unsolicited direct messages.
3. Days 2–3: founder answers questions personally, labels each reported failure, and fixes the largest reproducible blocker. Do not use generated replies on DEV or HN.
4. Days 4–7: consider one Show HN submission if the project has not already had an equivalent launch and the interactive demo works without signup. Founder writes it independently under HN's rules. Do not post a second DEV announcement or repeatedly resubmit because traction is low.
5. Day 8: compare activated and returning accounts, failed/no-savings requests, and quality feedback with baseline. Continue the channel that produced useful tests. If there are visits but no positive-savings usage, inspect onboarding and workload fit before broadening promotion.

## Measurement and campaign links

Use these proposed URLs:

- Founder note: `https://tokenshrink.com/?utm_source=founder&utm_medium=organic&utm_campaign=first10`
- DEV article: `https://tokenshrink.com/?utm_source=devto&utm_medium=community&utm_campaign=first10`
- Show HN: `https://tokenshrink.com/?utm_source=hackernews&utm_medium=community&utm_campaign=first10`

**UTM strings alone do not implement attribution.** Verify that the analytics view captures landing visits and the campaign before claiming channel results. The current operations board counts authenticated requests and positive-savings records; it does not establish a campaign-to-account conversion funnel. Anonymous and SDK telemetry is self-reported, and npm downloads are not people or activations.

For this first pilot, record campaign visits if verified analytics provides them, non-owner accounts with positive-savings hosted requests, and those accounts returning with another positive-savings request on a later day. Optionally ask testers which post brought them in and mark that attribution as self-reported. Do not infer a person-level conversion rate by dividing unrelated visit and account totals. Report unknown attribution explicitly. Exclude owner tests and known synthetic probes. Do not log prompt bodies to obtain attribution.

## Draft 1 — project-owned founder note

**Title: Help test TokenShrink on one repeated AI workflow**

I built TokenShrink to explore whether repeated AI instructions can use fewer input tokens. The JavaScript SDK is free; the website lets you try compression and send feedback.

I'm looking for 10 developers to test one synthetic example from a workflow they actually use. Compare the full compressed input with the original, then check whether your model still follows the important instructions. No saving or a worse answer is useful feedback too.

There's also an experimental session-dictionary prototype, Aster-1. It isn't the default compressor, and its small synthetic tests don't establish general answer accuracy.

[Try TokenShrink](https://tokenshrink.com/?utm_source=founder&utm_medium=organic&utm_campaign=first10) · [Research progress](https://tokenshrink.com/progress) · [Send feedback](https://tokenshrink.com/feedback)

## Draft 2 — DEV educational article

**Title: Three checks before trusting prompt compression savings**

I built TokenShrink, a free JavaScript prompt-compression SDK with a hosted demo. Here are three checks I use to keep the savings question honest.

**Count the whole input.** A shorter body can need a decoder that makes the complete prompt larger. Measure the combined decoder and compressed text with the tokenizer for the model you intend to use. Shorter character counts are not enough.

**Count every request.** Putting a dictionary earlier in a conversation doesn't make that context free. A useful session comparison adds up each actual input, including the dictionary when it is sent again. Then account separately for outputs, retries, and any provider caching before estimating cost.

**Test the answer as well as the text.** Software decoding back to the original string establishes a round trip. It doesn't establish that an LLM will interpret the encoded input correctly. Compare original and compressed prompts on the same task and check facts, constraints, and output format. A result that saves input tokens but needs a retry may not help.

For a first test, create a synthetic version of one repeated workflow. Write down the expected facts and constraints before running either prompt. Keep the output requirement identical, record full input and output counts, and include zero-savings cases in your results.

TokenShrink's Aster-1 session dictionary is an experimental prototype, separate from the default compressor. I'm looking for concrete workloads that expose where compression helps or fails, rather than a universal savings percentage.

[Try the demo](https://tokenshrink.com/?utm_source=devto&utm_medium=community&utm_campaign=first10) or install the free SDK with `npm install tokenshrink`. Please use synthetic data and share a reproducible failure through the site's feedback form.

*Disclosure: I own TokenShrink. This article was drafted with AI assistance; I reviewed its explanations and claims before publication.*

Publication gate: that last sentence is only true after the founder actually performs that review and understands the concepts. Keep the AI disclosure. Suggested tags: `javascript`, `ai`, `opensource`; check current tag availability in the editor.

## Show HN: founder-written submission only

The current official HN guidelines say: “Don't post generated text or AI-edited text.” Therefore neither draft above is a Show HN submission or comment. The founder must compose HN text independently; do not paste or ask an AI to polish it.

Preparation facts, not posting copy: personally built project; free runnable npm package; interactive no-signup demo; measured full-payload savings vary; experimental dictionary separate; creator available to discuss limitations. Title must start with Show HN. Link the usable application, not a signup-only page or this plan. Do not ask friends to vote or comment. A routine version update is generally insufficient for Show HN.

## Official channel rules checked

- [Show HN guidelines](https://news.ycombinator.com/showhn.html): personally made, usable work; ideally no signup barrier; creator present; no vote solicitation; ordinary version updates generally insufficient.
- [Hacker News guidelines](https://news.ycombinator.com/newsguidelines.html): avoid primarily promotional participation; generated or AI-edited text is prohibited.
- [DEV terms, content policy](https://dev.to/terms): substantive on-topic content, not primarily promotion/backlinks; no link-only article.
- [DEV code of conduct](https://dev.to/code-of-conduct) and [AI article guidelines](https://dev.to/guidelines-for-ai-assisted-articles-on-dev): disclose assistance, verify content and understand it yourself; do not generate community comments. Recheck rules when publishing.
