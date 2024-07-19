const { nrcTownshipList } = require("../utils/nrc")

exports.regionList = async (req, res) => {
    try {
        let list = nrcTownshipList
        list = Object.keys(list).
                filter((key) => key.includes(req.body.region)).
                reduce((cur, key) => { return list[key] }, {});

        return res.send({
            status: 0,
            data: list
        })
    } catch (error) {
        return res.send({
            status: 1,
            message: error?.message
        })
    }
}