const routerUtils = (data) => {
    const sendPretty = (res, obj) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(obj, null, 3));
    };
    const validateUrlParam = (res, id) => {
        if (!id.match(/^[a-zA-Z0-9]*$/)) {
            res
                .status(400)
                .send('Invalid url parameter');
        }

        return Promise.resolve(id);
    };
    const getSubcollection = (req, res, main, sub) => {
        validateUrlParam(res, req.params.id)
            .then((id) => {
                return data[main].findById(id);
            })
            .then((film) => {
                sendPretty(res, film[sub]);
            })
            .catch((err) => {
                return res
                    .status(500)
                    .send('Server error:' + err);
            });
    };

    return {
        sendPretty,
        validateUrlParam,
        getSubcollection,
    };
};

module.exports = routerUtils;