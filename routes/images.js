const express = require("express");
const axios = require("axios");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| AI HOTEL IMAGE PROMPTS
|--------------------------------------------------------------------------
*/

const imagePrompts = {

    hero: `
        ultra luxury five star hotel exterior in Nigeria,
        grand modern architectural design,
        elegant entrance,
        warm golden hour lighting,
        beautiful landscaped tropical gardens,
        palm trees,
        sophisticated luxury resort atmosphere,
        cinematic architectural photography,
        realistic professional hotel photography,
        premium hospitality advertisement,
        no people,
        no text,
        no logos,
        no watermark
    `,

    lobby: `
        breathtaking luxury five star hotel lobby,
        elegant contemporary African luxury hotel interior,
        high ceilings,
        marble floor,
        warm golden lighting,
        beautiful chandeliers,
        sophisticated furniture,
        premium reception area,
        large windows,
        cinematic interior photography,
        ultra realistic,
        professional hotel photography,
        no people,
        no text,
        no logos,
        no watermark
    `,

    pool: `
        spectacular luxury five star hotel swimming pool,
        elegant tropical resort,
        infinity pool,
        palm trees,
        luxurious lounge chairs,
        warm sunset lighting,
        sophisticated architecture,
        calm relaxing atmosphere,
        premium hospitality photography,
        cinematic,
        ultra realistic,
        no people,
        no text,
        no logos,
        no watermark
    `,

    restaurant: `
        elegant luxury five star hotel restaurant,
        sophisticated modern African luxury interior,
        beautifully decorated dining tables,
        warm ambient lighting,
        premium furniture,
        elegant chandeliers,
        upscale fine dining atmosphere,
        cinematic restaurant photography,
        ultra realistic,
        professional hospitality photography,
        no people,
        no text,
        no logos,
        no watermark
    `,

    deluxe: `
        luxurious five star deluxe hotel bedroom,
        sophisticated modern interior,
        large comfortable king size bed,
        premium white bedding,
        elegant gold and cream details,
        beautiful bedside lamps,
        large windows,
        soft warm lighting,
        luxury hotel room photography,
        realistic interior photography,
        high end hospitality advertisement,
        no people,
        no text,
        no logos,
        no watermark
    `,

    executive: `
        magnificent executive hotel suite,
        spacious luxury bedroom and sitting area,
        king size bed,
        elegant modern furniture,
        premium marble details,
        warm gold lighting,
        sophisticated cream and dark wood interior,
        floor to ceiling windows,
        luxurious five star hotel,
        professional interior photography,
        cinematic,
        ultra realistic,
        no people,
        no text,
        no logos,
        no watermark
    `,

    presidential: `
        extraordinary presidential luxury hotel suite,
        enormous five star presidential suite,
        elegant king size bed,
        separate luxury living room,
        premium marble floor,
        sophisticated dark wood and gold interior,
        floor to ceiling windows,
        spectacular city view,
        designer furniture,
        grand luxury chandelier,
        warm cinematic lighting,
        ultra realistic luxury hotel photography,
        world class hospitality advertisement,
        no people,
        no text,
        no logos,
        no watermark
    `
};


/*
|--------------------------------------------------------------------------
| GET AI IMAGE
|--------------------------------------------------------------------------
|
| Example:
|
| /api/images/deluxe
| /api/images/executive
| /api/images/presidential
|
*/

router.get("/:imageName", async (req, res) => {

    const imageName = req.params.imageName;

    const prompt = imagePrompts[imageName];

    if (!prompt) {

        return res.status(404).json({
            success: false,
            message: "Requested hotel image does not exist."
        });

    }


    /*
    |--------------------------------------------------------------------------
    | Check API key
    |--------------------------------------------------------------------------
    */

    if (!process.env.POLLINATIONS_API_KEY) {

        console.error(
            "POLLINATIONS_API_KEY is missing from .env"
        );

        return res.status(500).json({
            success: false,
            message: "AI image API key is not configured."
        });

    }


    try {

        const encodedPrompt = encodeURIComponent(
            prompt.trim().replace(/\s+/g, " ")
        );


        const imageUrl =
            `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux`;


        console.log(
            `Generating AI hotel image: ${imageName}`
        );


        const response = await axios.get(
            imageUrl,
            {
                headers: {
                    Authorization:
                        `Bearer ${process.env.POLLINATIONS_API_KEY}`
                },

                responseType: "arraybuffer",

                timeout: 120000
            }
        );


        /*
        |--------------------------------------------------------------------------
        | Send image back to browser
        |--------------------------------------------------------------------------
        */

        res.set(
            "Content-Type",
            response.headers["content-type"] ||
            "image/jpeg"
        );


        /*
        |--------------------------------------------------------------------------
        | Browser caching
        |--------------------------------------------------------------------------
        */

        res.set(
            "Cache-Control",
            "public, max-age=86400"
        );


        res.send(response.data);

    } catch (error) {

        console.error(
            `AI image generation failed for ${imageName}:`,
            error.response?.status || error.message
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to generate this hotel image right now."

        });

    }

});


module.exports = router;