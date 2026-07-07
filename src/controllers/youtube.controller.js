const axios = require("axios");

const buscarVideo = async (req, res) => {
    try {

        const { marca, modelo, anio } = req.query;

        const busqueda = `${marca} ${modelo} ${anio} review español`;

        const respuesta = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    part: "snippet",
                    q: busqueda,
                    type: "video",
                    maxResults: 1,
                    key: process.env.YOUTUBE_API_KEY
                }
            }
        );


        if (respuesta.data.items.length === 0) {
            return res.json({
                videoId: null
            });
        }


        const video = respuesta.data.items[0];


        res.json({
            videoId: video.id.videoId,
            titulo: video.snippet.title
        });


    } catch (error) {

        console.log(error.message);

        res.status(500).json({
            mensaje: "Error buscando video"
        });
    }
};


module.exports = {
    buscarVideo
};