import { NextApiRequest, NextApiResponse } from 'next';
import { encode, decode } from "gpt-3-encoder";

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    const { url } = (await req.body) as {
        url?: string;
    };

    if (!url) {
        return res.status(400).send("No URL in request");
    }

    try {
        const fetchUrl = `https://api.diffbot.com/v3/analyze?url=${encodeURIComponent(url)}&token=b320c0f319a67e14aa6c9c84fa01d699`
        // const fetchUrl = `https://www.w3.org/services/html2txt?url=${encodeURIComponent(url)}&noinlinerefs=on&nonums=on`
        const response = await fetch(fetchUrl);
        console.log("url" + fetchUrl)
        console.log(response)
        if (response.status === 200) {
        const siteText = await response.text();

        if (siteText.length <= 200) {
            return res.send(siteText);
        }
        // siteText = Buffer.from(siteText, 'utf-8').toString()
        const trimmed = siteText.replace(/(\r\n|\n|\r)/gm, "").replace(/\s+/g, " ").trim()
        console.log(trimmed)
        let encoded = encode(trimmed);
        encoded = encoded.slice(0, 3500);
        const encodedSiteText = decode(encoded);
        console.log("decoded", encodedSiteText)
        return res.send(encodedSiteText);
    } else {
        return res.status(400).send("Bad Response")
    }
    } catch (error) {
        return res.status(400).send("Unexpected Error Occurred");
    }
}

export default handler;
