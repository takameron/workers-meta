import * as chardet from 'chardet';
import * as iconv from 'iconv-lite';

export async function handleOptions(request: Request): Promise<Response> {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function handleRequest(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  let targetURL: string = String(searchParams.get('url'))

  // Add 'http://' if there is no http:// or https://
  const hitProtocol: RegExp = /^https?:\/\//
  if (!hitProtocol.test(targetURL)) {
    targetURL = "http://" + targetURL
  }

  let res: { [key: string]: string; } = {};

  const response: Response = await fetch(targetURL)
  if (response.body) {
    const arraybuffer: ArrayBuffer = await response.arrayBuffer()
    const array: Uint8Array = new Uint8Array(arraybuffer)

    // Decode
    const encoding: string = chardet.detect(array)!.toString()
    if (!encoding) throw new Error();
    const html: string = iconv.decode(array, encoding);

    // Analysis of meta tags
    const head = html.match(/<head>[\s\S]*?<\/head>/i)
    if (head) {
      const tags = head[0].match(/<meta[\s\S]*?>/gi)
      if (tags) {
        tags.forEach(tag => {
          const key = tag.match(/(?<=(property|name|itemprop)=")[\s\S]+?(?=")/i)
          const value = tag.match(/(?<=content=")[\s\S]+?(?=")/i)
          if (key && value) {
            // key is unified to lowercase and replace ':' to '_'
            const shapedkey = String(key[0]).toLowerCase().replace(':','_')
            res[shapedkey] = String(value[0])
          }
        })
      }
    }
  }

  const json = JSON.stringify(res)
  return new Response(json, {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  })
}
