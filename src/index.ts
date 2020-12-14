import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core'
import microConfig from './mikro-orm.config'
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'

const main = async () => {

const orm = await MikroORM.init(microConfig)
    await orm.getMigrator().up()    

    const app = express()
    
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false
        }),
        context: () => ({em: orm.em})
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