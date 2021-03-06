import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core'
import microConfig from './mikro-orm.config'
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { __prod__ } from './constants'
import { MyContext } from './types'



const main = async () => {

    const orm = await MikroORM.init(microConfig)
    await orm.getMigrator().up()    

    const app = express()

    const RedisStore = connectRedis(session)
    const redisClient = redis.createClient()

    app.use(
    session({
        name: 'qid',
        store: new RedisStore({ 
            client: redisClient,
            disableTouch: true
         }),
        cookie: {
            maxAge: 1000 * 60 * 60 *24 *365 *10,  //ten years
            httpOnly: true,
            sameSite: 'lax', //csrf
            secure: __prod__ //cookie only works in https
        },
        saveUninitialized: false,
        secret: 'mylittlecat',
        resave: false,
    })
)
    
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({req, res}): MyContext => ({em: orm.em, req, res})
    })

    apolloServer.applyMiddleware({ app})

    /*app.get('/', (_, res)=> {
       res.send('hello Lizzeth')
    }) */
    
    app.listen(4500, ()=> {
        console.log('server started on localhost:4500')
    })
  
   /*  const post = orm.em.create(Post, {title: 'my first post' })
    await orm.em.persistAndFlush(post)
    console.log('.....................sql 2...................')
    await orm.em.nativeInsert(Post, {title: 'my first post 2' })  */

    /* const posts = await orm.em.find(Post, {})
    console.log(posts) */

}

main().catch(err => {console.log(err)})