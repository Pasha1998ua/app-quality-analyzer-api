const fastify = require('fastify')({ logger: false })
const calcs = require('./calcs');

// Routes
fastify.post('/calculate/', async (request, reply) => {
    try {
        let body;
        if(request && request.body) {
            body = JSON.parse(request.body);
            if(!body.rMatrix || !body.sMatrix){
                reply.send({ 
                    statusCode: 400,
                    result: "Bad request" 
                })
                return false;
            }
        } else {
            reply.send({ 
                statusCode: 400,
                result: "Bad request" 
            })
            return false;
        }

        let result = calcs.calculateParams(body.rMatrix, body.sMatrix);

        reply.send({ 
            statusCode: 200,
            result 
        })
    } catch (err) {
        reply.send({ 
            statusCode: 500,
            result: err.toString()
        })
    }
})

// Run the server!
const start = async () => {
    try {
        await fastify.listen(8081);
        fastify.log.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
module.exports.start = start;