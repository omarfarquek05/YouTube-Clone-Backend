import {rateLimit} from "express-rate-limit";
import { RedisStore } from "rate-limit-redis"
import RedisClient, { Command } from "ioredis"

// Create a ioredis client
const client = new RedisClient();

// Create and use the rate limiter
const limiterWithRedis = rateLimit({
    // Rate Limiter Configuration
    windowMs: 15 * 60 * 1000, // 15 minutes 
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    // limit : 100 ( instead of using old max use latest doc refer limit)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers

    // Redis store configuration
    store: new RedisStore({
         sendCommand : (command , ...args ) => client.send_command(command, ...args), 
     }),
})
 

// Basic Rate Limitor
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute How long to remember requests for, in milliseconds.
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: "Too many requests from this IP, try again after a minute"
});

export { limiter , limiterWithRedis };
