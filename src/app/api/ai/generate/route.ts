import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { prompt, type } = await req.json();

        // In a real application, you would call the OpenAI API here
        // import OpenAI from 'openai';
        // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        let mockResponse = "";

        if (type === "caption") {
            mockResponse = `Here's a great caption for your post:\n\n🚀 Just wrapped up exploring some fascinating new perspectives on ${prompt.substring(0, 20)}...\n\nThe future is looking brighter than ever. Always keep learning and pushing boundaries!\n\nWhat are your thoughts on this? Let me know below! 👇`;
        } else if (type === "hashtag") {
            mockResponse = `#Innovation #${prompt.split(' ')[0] || 'Tech'} #Future #Growth #Productivity #Success #Leadership`;
        } else {
            mockResponse = `[Twitter Thread]\n\n1/ Exploring ${prompt.substring(0, 20)} 🧵\nHere is why it matters more than ever today.\n\n2/ The key is understanding the fundamentals before jumping into the deep end.\n\n3/ What's your take?`;
        }

        return NextResponse.json({ content: mockResponse });
    } catch (error: unknown) {
        console.error(error);
        return NextResponse.json(
            { error: "Failed to generate content" },
            { status: 500 }
        );
    }
}
