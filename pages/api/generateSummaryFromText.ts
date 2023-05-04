import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  const { content } = (await req.json()) as {
    content?: string;
  };
  if (!content) {
    return new Response(null, {
      status: 400,
      statusText: "No website text in request"
    });
  }
  try {
    // const payloadClean: any = {
    //   model: "gpt-3.5-turbo",
    //   messages: [{ role: "user", content:  `${content} Remove the irrelevant data from this json, and return a new json file. ONLY RETURN THE JSON AND NOTHING ELSE`}],
    //   temperature: 0.3,
    //   top_p: 1,
    //   frequency_penalty: 0,
    //   presence_penalty: 0,
    //   max_tokens: 1000,
    //   stream: false,
    //   n: 1,
    // };

    // const res = await fetch("https://api.openai.com/v1/chat/completions", {
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    //   },
    //   method: "POST",
    //   body: JSON.stringify(payloadClean),
    // });

    // if (!res.ok) {
    //   throw new Error("Failed to get response from OpenAI API");
    // }

    // const json = await res.json();
    // const cleanedJson = json.choices[0].message.content;

    // let cleanedJson = content;

    const prompt = `${content}

    ## Fiverr Gig Improvement Suggestions
    
    As an experienced Fiverr seller, you have been tasked with improving my Fiverr gig. Based on the above data, provide the following suggestions using markdown:
    
    ### Craft a Compelling Gig Title
    
    Critique my current gig title if I have one. Then, write a gig title that showcases my unique services and skills.
    
    ### Write an Engaging Gig Description
    
    Critique my current gig description if I have one. Then, create a description that provides an overview of my services and highlights my strengths.
    
    ### Tips For Showcasing Your Skills Effectively
    
    Provide guidance on how to showcase my skills and expertise in a way that is clear and concise.
    
    ### Present My Portfolio
    
    Highlight my previous work and projects. Give some tips on how to present my portfolio in the best possible way.
    
    ### General Tips for a Standout Gig
    
    Provide additional tips for creating a standout gig, such as adding high-quality gig images, encouraging positive reviews, and adding a video introduction.
    
    ### Additional Tips
    
    Provide any additional tips or recommendations that you think will be helpful for improving my gig.
    
    Make sure to address me directly with "You." Be as thorough as possible to ensure that my gig stands out to potential buyers and clients. Also, make sure your suggestions are in this format, which is the traditional md format for GitHub. In addition, remember that code overflows horizontally, so if a line of text is too long, split it into multiple lines. This will make it easier to read, and is especially important for the description section.
    
    Individual tips can be displayed using numbered lists, and examples can be in code blocks. Here's an example:
    
    ### Craft a Compelling Gig Title
    
    1. Use keywords that are relevant to your services and industry.
    2. Highlight your unique skills and services.
    3. Make sure the gig title is concise and attention-grabbing.
    
    Here is an example of a good gig title that will work well for your gig:
    
    \`\`\`
      --> Good gig title goes here.
    \`\`\`

    Note that the API used to get the profile might be missing data. It also has a tendency to only fetch one package even if there are multiple. Try to account for this in your suggestions, and work with the data you have.
  `

    const payload: OpenAIStreamPayload = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 1300,
      stream: true,
      n: 1,
  };

    const stream = await OpenAIStream(payload);
    return new Response(stream);
  } catch (e: any) {
    console.log({ e });
    return new Response(null, {
      status: 400,
      statusText: "Bad response"
    });
  }
};

export default handler;
