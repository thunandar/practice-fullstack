exports.validationResponse = (error) => {
    const errors = error.details.map(detail => {
        return {
            path: detail?.path[0],
            message: detail?.message
        }
    })

    return errors
}