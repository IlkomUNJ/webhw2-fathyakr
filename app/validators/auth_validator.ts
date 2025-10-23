import vine from '@vinejs/vine'

export const authValidator = vine.compile(
  vine.object({
    username: vine.string(),
    password: vine.string(),
  })
)
