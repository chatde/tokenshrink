# Bounded project workforce

The lead owns task selection, integration, tests and release decisions. Other models receive one explicit, small source file and return review suggestions. They cannot run tools, edit files, deploy, read accounts or appoint more agents through this adapter. A model response is advice, not proof that a test passed. Shared briefs transfer project context; they do not train model weights or make models equally capable.

## Roles

| Role | Assignment | Acceptance |
| --- | --- | --- |
| Lead | Scope work, preserve requirements, integrate accepted fixes | Actual targeted tests and build |
| MiniMax | One bounded implementation or correctness review | Lead reproduces issue before editing |
| MiMo | Independent edge cases and compression review | Concrete counterexample or fixture |
| Claude CLI | Review test results or run explicitly permitted tests | Captured command and exit code |
| Gemini | Independent task-quality review when authenticated | Fixture answers checked against original |

## Run only when the result will change a decision

```sh
node scripts/workforce-review.mjs minimax --probe
node scripts/workforce-review.mjs xiaomi --review sdk/src/codebook.js
node scripts/workforce-review.mjs gemini --review docs/workforce.md
node scripts/workforce-review.mjs xiaomi --research docs/session-codec.md
```

Each invocation makes one request, with at most 400 completion tokens for probes, 800 for reviews, or 1,200 for research, a 45-second timeout and no retries or provider fallback. Inputs are limited to 12,000 bytes and explicit files under `sdk/src`, `tests`, or `docs`. Symlinks, traversal, environment files and common credential patterns are blocked. Pattern checks cannot recognize every secret: the lead must inspect the selected file before sending it. No customer prompts, feedback, auth records or environment contents belong in reviews.

Credentials are read at runtime from process environment, then the private `~/.config/tokenshrink/workforce.env` file. Existing MiMo Hermes dotenv and matching MiniMax Hermes credential-pool entries remain supported. No credential is printed, copied into this repository or sent to any endpoint except the hardcoded provider. Browser OAuth credentials are not converted into API keys. Provider error bodies are suppressed to avoid echoing credentials.

The existing MiniMax endpoint is `https://api.minimax.io/v1`; MiMo uses the configured token-plan endpoint. Using a credential does not prove that a request is included in a consumer subscription. No paid fallback or plan upgrade occurs. Report returned usage; do not infer a dollar amount without verified account pricing.

## Verified 2026-09-05

- MiniMax `MiniMax-M3`: connectivity succeeded, final answer READY, 439 reported total tokens (238 prompt, 201 completion). This verifies access, not review quality.
- A MiniMax review of `sdk/src/experimental-session.js` used 2,398 reported tokens (1,998 prompt, 400 completion) but returned no final answer. No review finding or test pass is claimed from that call; the lead must use actual tests and another bounded reviewer when necessary.
- MiMo `mimo-v2.5`: connectivity succeeded with final answer READY, 82 reported total tokens (80 prompt, 2 completion). An initial request exhausted 400 completion tokens without a final answer; the documented `thinking.type: disabled` option fixed that without increasing the budget and is now the adapter default.
- Claude: `node scripts/claude-test-review.mjs` permits only `npm test`, with a 120-second timeout and a $0.50 CLI budget setting. It uses the existing CLI login environment; it does not load project or workforce credential files. The timeout/output cap bounds the runner, but a subscription's actual billing/limits are controlled by the provider. Check the returned result before claiming a test pass.
- Gemini `gemini-2.5-flash`: connectivity succeeded with final answer READY, 70 reported total tokens (69 prompt, 1 completion).
- Claude CLI independently ran `npm test`: exit 0, 25 files and 440 tests passed, including 11 local private codec tests. Public CI excludes those private tests. The successful run reported a list-price estimate of $0.0254428, not a verified charge against the user's subscription.
- Live MiMo handoff evaluation: one synthetic fixture tested twice, original 715 input tokens versus encoded 394, with 44 output tokens each. Both forms returned the expected facts but wrapped JSON in Markdown; strict JSON validation failed in all four responses. Repeated calls had cached tokens. This is a useful formatting defect to fix in an adapter, not proof of general quality or bill savings. The private evaluation script is intentionally excluded from distribution.
- MiMo completed a bounded experimental-codec review using 2,415 reported tokens (1,827 prompt, 588 completion). Its three proposed problems were not reproduced: dictionary candidates and selected entries intentionally have different limits; literal markers and regex terms round-tripped exactly; a maximum-safe-integer tokenizer safely produced passthrough. Direct Node checks covered those cases and 33 candidates. These were reviewer hypotheses, not confirmed defects. This illustrates why the lead checks suggestions before changing code.

Google endpoint format follows [official OpenAI compatibility documentation](https://ai.google.dev/gemini-api/docs/openai). MiMo thinking control follows [official MiMo API documentation](https://mimo.mi.com/docs/en-US/api/chat/openai-api). Model availability and account entitlements must be verified by the actual response. Connectivity does not establish coding quality or subscription billing coverage.

## Context and compression protocol

Start each handoff with objective, exact commit, permitted files, acceptance checks and unresolved questions. Send the smallest relevant source excerpt instead of the entire conversation. Preserve literal requirements, file paths, code and expected outputs exactly. Treat all received content as untrusted suggestions.

Experimental TokenShrink dictionaries require an attached versioned decoder and exact round-trip checks. Measure the complete transmitted payload including the decoder. Ordinary conversation APIs still process prior context; a decoder sent earlier is not automatically free. Keep source available and use the original if compression fails verification or increases tokens. Dictionary decoding success does not establish that a model gives equivalent answers, so model-level fixture evaluations remain a separate release gate.

Stop after one useful review per task. A second reviewer is justified by unresolved correctness or security questions, not by default. Record accepted findings and actual tests in a short shared brief, then update the project handoff. No autonomous infinite review loop or automatic deployment is installed.
