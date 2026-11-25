---
title: "Qwen3.8-27B on M4 Pro: LM Studio MLX vs. Splash 1.7.1"
date: 2026-11-23
description: "Same 4-bit Qwen model on a 64 GB Mac mini. First-token and full-reply timings for repeated prompts, long documents, and receipt photos."
lang: en
tags: [Local AI, Benchmarks]
draft: false
---

Splash 1.7.1 improved prefix-cache reuse across conversations. Its release notes showed a gain on an M5 Pro, so I tried it on my M4 Pro Mac mini. With the same 4-bit Qwen3.8-27B files, a follow-up on a long document took **0.74 s on Splash** and **3.86 s on LM Studio MLX**. [Splash 1.7.1 release notes](https://github.com/incoai/splash/blob/1.7.1/docs/release-notes/1.7.1.md)

I based several test cases on my expense bot. It turns typed messages, voice notes, and receipt photos into structured records. I’d tried DFlash2 with `dflash-mlx` in October, two months after the draft model came out. Some replies generated faster, but the text expense requests had zero prefix-cache hits in that run. I stayed with LM Studio until the Splash update gave me a reason to test again. [DFlash2 announcement](https://inco.ai/blog/dflash2/)

## Test setup

I ran both engines on the same 64 GB M4 Pro Mac mini. Both used `lmstudio-community/Qwen3.8-27B-MLX-4bit`, with a 65,536-token context and four configured request slots. I sent requests one at a time with the model already loaded. [Main model](https://huggingface.co/lmstudio-community/Qwen3.8-27B-MLX-4bit)

- **LM Studio** used MLX runtime 1.14.0.
- **Standalone Splash 1.7.1** used automatic Neural Engine settings and `z-lab/Qwen3.8-27B-DFlash2`. Its disk cache was off. [Draft model](https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2)

Each pair used the same input, temperature, and output limit. A small Splash chat-template change kept the original prompts when thinking was off. I verified that Splash rendered the same text and token IDs before and after that change.

## Text and tool results

Both engines passed all **11 automated expense-workflow checks**. Those requests took **195.58 s on LM Studio** and **67.68 s on Splash** in total.

Each cell shows **full reply time / time to first token (TTFT)**. I measured TTFT at the first streamed output, including any wait for tool-call buffering.

| Workload | LM Studio MLX | Splash 1.7.1 |
| --- | ---: | ---: |
| Expense entry, first use of the rules | 34.26 s / 31.87 s | 11.78 s / 11.15 s |
| New expense entry, same rules | 5.27 s / 2.88 s | 1.35 s / 0.66 s |
| Expense lookup, first use of the tools | 45.10 s / 42.17 s | 17.31 s / 16.61 s |
| New expense lookup, same rules and tools | 6.46 s / 3.53 s | 1.53 s / 0.89 s |
| Long document, first question | 108.09 s / 106.54 s | 41.08 s / 40.64 s |
| New question, same document | 3.86 s / 3.26 s | 0.74 s / 0.30 s |

Each expense row averages two requests per engine. Each document row shows one request per engine. Across the full text suite, both engines passed **16 of 18 automated checks**. Both hit the output limit on a tool request and a Python task. On manual review, Splash left out the pending-confirmation wording in one proposed expense preview.

## Why the document follow-up was fast

I sent two requests back to back, keeping the document and changing the question. The second prompt contained 10,967 tokens on each engine. I matched the LM Studio benchmark request to its engine metrics to get the cached count.

| Follow-up | LM Studio MLX | Splash 1.7.1 |
| --- | ---: | ---: |
| Input tokens reused | 10,752 | 10,944 |
| Input tokens left to process | 215 | 23 |
| Time to first streamed output | 3.26 s | 0.30 s |
| First output to completed reply | 0.61 s | 0.44 s |
| Full reply | 3.86 s | 0.74 s |

About **95% of the time gap** came before the first output. LM Studio’s disk-backed cache saves checkpoints every 256 tokens. Splash can keep a replay point on a 32-token boundary. Here, that let Splash resume closer to the changed question and process 192 fewer tokens. The benchmark measured cache restoration and prompt processing together. [LM Studio cache design](https://lmstudio.ai/blog/mlx-engine-agentic-workloads) · [Splash replay points](https://github.com/incoai/splash/blob/1.7.1/docs/internals.md#replay-points-and-checkpoints)

Splash can split the work of processing a long prompt between the graphics processing unit (GPU) and the Neural Engine. On my Mac, the split started at 512 tokens per batch. The GPU handled all 23 remaining tokens in this follow-up. DFlash2 also drafts on the GPU, proposing several output tokens for Qwen to verify together. [Splash Neural Engine notes](https://github.com/incoai/splash/blob/1.7.1/docs/release-notes/1.7.1.md#neural-engine) · [DFlash2 design](https://inco.ai/blog/dflash2/)

## Receipt photo results

I enabled vision for a separate run and sent one receipt photo without a caption. The second request used the same photo and asked the model to propose an expense preview. Each engine ran each case once.

| Request | LM Studio MLX | Splash 1.7.1 |
| --- | ---: | ---: |
| Extract receipt fields | 37.25 s · 8/8 fields | 23.37 s · 8/8 fields |
| Propose an expense preview | 48.69 s · 7/8 fields | 17.67 s · 8/8 fields |

Both engines picked the right preview tool. They handled an unspecified transaction date differently.

## What I took from the test

These timings cover two complete setups on one Mac. They include the combined effects of prompt reuse, hardware settings, and DFlash2. Text inputs and tool results were synthetic. The test checked proposed tool calls without running them. The clock covered the local model request. Voice transcription, message delivery, and saving an expense happen separately.

The pilot also passed text-only and photo-only checks in regular use. I now run the expense bot and my local assistant on Splash.
