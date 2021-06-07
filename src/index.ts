import { handleOptions, handleRequest } from './handler'

addEventListener('fetch', (event) => {
  const request = event.request

  if (request.method === 'OPTIONS') {
    return event.respondWith(handleOptions(request))
  }

  if (request.method !== 'GET') {
    return event.respondWith(
      new Response('Method Not Allowed', {
        status: 405,
      }),
    )
  }

  event.respondWith(handleRequest(request))
})
