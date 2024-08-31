import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionIdExists } from '../middleware/session_id_checker'

export async function mealRoutes(app: FastifyInstance) {
  // Get all meals
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async () => {
      const meals = await knex('meals').select()
      return { meals }
    },
  )

  // Create a new meal
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      console.log(request.body)

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.coerce.boolean(),
        date: z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: 'Invalid date format',
        }),
      })

      const { name, description, isOnDiet, date } = createMealBodySchema.parse(
        request.body,
      )

      const parsedDate = new Date(date)

      await knex('meals').insert({
        id: crypto.randomUUID(),
        name,
        description,
        is_on_diet: isOnDiet,
        date: parsedDate,
        user_id: request.user?.id,
      })

      return reply.status(201).send()
    },
  )
}
