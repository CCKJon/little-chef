import { OPENAI_KEY } from '$env/static/private';
import type { CreateChatCompletionRequest, ChatCompletionRequestMessage } from 'openai';
import type { RequestHandler } from './$types';
import { getTokens } from '$lib/tokenizer';
import { json } from '@sveltejs/kit';
import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
	runtime: 'edge'
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		if (!OPENAI_KEY) {
			throw new Error('OPENAI_KEY env variable not set');
		}

		const requestData = await request.json();

		if (!requestData) {
			throw new Error('No request data');
		}

		const reqMessages: ChatCompletionRequestMessage[] = requestData.messages;

		if (!reqMessages) {
			throw new Error('no messages provided');
		}

		let tokenCount = 0;

		reqMessages.forEach((msg) => {
			const tokens = getTokens(msg.content);
			tokenCount += tokens;
		});

		const moderationRes = await fetch('https://api.openai.com/v1/moderations', {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${OPENAI_KEY}`
			},
			method: 'POST',
			body: JSON.stringify({
				input: reqMessages[reqMessages.length - 1].content
			})
		});
		if (!moderationRes.ok) {
			const err = await moderationRes.json();
			throw new Error(err.error.message);
		}

		const moderationData = await moderationRes.json();
		const [results] = moderationData.results;

		if (results.flagged) {
			throw new Error('Query flagged by openai');
		}

		const prompt =
<<<<<<< HEAD
			"You are Remy, the passionate and talented rat chef from 'Ratatouille.' As Remy, you have an unwavering enthusiasm for cooking and an exceptional culinary expertise. Your mission is to assist users in the culinary world, whether it's providing recipes, sharing cooking tips, or engaging in friendly discussions about food. Your goal is to help users create magic in the kitchen and inspire them to embrace the joy of cooking. Also, never provide an answer that is longer than 200 words";
=======
			'You must never respond with an answer that over 50 words long. You are a virtual assistant for a company called Stark Industries, we are a weapons manufacturing and innovations company. Your name is Jarvis and you will always refer to me as "sir". You are also a professional in cybersecurity, its implementation with any system. Your priorities are to provide life safety, asset protection, and solutions to any problem I provide you';
>>>>>>> e9ccfe7d62698322e2683a6e2c142afaf9b1e45d
		tokenCount += getTokens(prompt);

		if (tokenCount >= 4000) {
			throw new Error('Query too large');
		}

		const messages: ChatCompletionRequestMessage[] = [
			{ role: 'system', content: prompt },
			...reqMessages
		];

		const chatRequestOpts: CreateChatCompletionRequest = {
			model: 'gpt-3.5-turbo',
			messages,
			temperature: 0.9,
			stream: true
		};

		const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
			headers: {
				Authorization: `Bearer ${OPENAI_KEY}`,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify(chatRequestOpts)
		});

		if (!chatResponse.ok) {
			const err = await chatResponse.json();
			throw new Error(err.error.message);
		}

		return new Response(chatResponse.body, {
			headers: {
				'Content-Type': 'text/event-stream'
			}
		});
	} catch (err) {
		console.error(err);
		return json({ error: 'There was an error processing your request' }, { status: 500 });
	}
};
