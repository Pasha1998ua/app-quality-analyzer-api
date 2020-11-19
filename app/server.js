const fastify = require('fastify')({ logger: false })
const calcs = require('./calcs');
const mysql = require("mysql2");
const md5 = require('md5');

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "app_quality_analyze",
    password: "root"
});
connection.connect(function(err){
    if (err) { return console.error("Error" + err.message); }
    else { console.log("Connection success"); }
});

// Routes
fastify.post('/calculate/', async (request, reply) => {
    reply.headers({
        'access-control-allow-origin': '*',
      })
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

        // Write to data base
        let paramsStringified = JSON.stringify({rMatrix: body.rMatrix,sMatrix: body.sMatrix,})
        const user = [md5(paramsStringified), JSON.stringify(result), paramsStringified];
        const sql = "INSERT INTO data(hash, value, params) VALUES(?, ?, ?)";
        
        connection.query(sql, user, function(err, results) {
            if(err) console.log(err);
            else console.log("Data added to data base");
        });

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

fastify.get('/get-params-from-base/', async (request, reply) => {
    reply.headers({
        'access-control-allow-origin': '*',
      })
    try {
        let body;
        if(!request || !request.query || !request.query.id) {
            reply.send({ 
                statusCode: 400,
                result: "Bad request" 
            })
            return false;
        }

        const sql = `SELECT * FROM data WHERE id = ${request.query.id}`;
        
        let result = connection.query(sql, function(err, results) {
            if(err) {
                console.error(err);
                reply.send({ 
                    statusCode: 400,
                    result: "Data base query error" 
                })
            } else {
                if(results && Array.isArray(results) && results.length > 0){
                    let data = JSON.parse(results[0].params);
                    reply.send({ 
                        statusCode: 200,
                        result: data 
                    })
                } else {
                    reply.send({ 
                        statusCode: 400,
                        result: "Empty data" 
                    })
                }
            }
        });
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