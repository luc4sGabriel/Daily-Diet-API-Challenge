import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/session_id_checker'

export async function userRoutes(app: FastifyInstance) {
  // Get all users
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async () => {
      const users = await knex('users').select()

      return { users }
    },
  )

  // Create a new user
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: crypto.randomUUID(),
      session_id: sessionId,
      name,
      email,
    })

    return reply.status(201).send()
  })
}
