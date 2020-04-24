
const APIURL = 'https://cfw-takehome.developers.workers.dev/api/variants'

let variant

const HTMLHandler = new HTMLRewriter()

// Class to handle element manipulation
class ElementHandler {
  element(e) {
    if(e.getAttribute('id') == 'title' || e.tagName == 'title') {
      e.setInnerContent(`Cloudflare Test ${!variant ? '1' : '2'}`)
    } else if(e.getAttribute('id') == 'description') {
      e.setInnerContent(`Welcome to the ${!variant ? 'first' : 'second'} variant!`)
    } else if(e.getAttribute('id') == 'url') {
      e.setInnerContent('Visit my website!')
      e.setAttribute('href', '
https://www.linkedin.com/in/mohd-abid-ali-08026718b/')
    }
  }
}


const ElementHandl = new ElementHandler()
// Pass all element handlers to the custom class
HTMLHandler.on('title', ElementHandl)
HTMLHandler.on('h1#title', ElementHandl)
HTMLHandler.on('p#description', ElementHandl)
HTMLHandler.on('a#url', ElementHandl)
addEventListener('fetch', e => e.respondWith(handleRequest(e.request)))

// Handle all requests here
async function handleRequest(request) {
  // Get cookies from request headers
  const cookies = getCookieObject(request.headers)
  // Decide which variant URL to use
  if(cookies.hasOwnProperty('variant')) variant = parseInt(cookies.variant)
  else variant = Math.random() >= 0.5 ? 0 : 1
  
  const {variants} = await fetch(APIURL).then(res => res.json())
  // Fetch the url 
  const {url} = await fetch(variants[variant])
  
  const response = new Response(await fetch(url).then(res => res.text()))
  
  response.headers.set('Content-Type', 'text/html')
  
  if(!cookies.hasOwnProperty('variant')) response.headers.set('Set-Cookie', `variant=${variant}`)
  return HTMLHandler.transform(response)
}

// Function to get cookies in object format
function getCookieObject(headers) {
  const cookieObj = {}
  const cookieHead = headers.get('Cookie')
  if(cookieHead) {
    for(const cookieString of cookieHead.split('; ')) {
      const cookie = cookieString.split('=')
      cookieObj[cookie[0]] = cookie[1]
    }
   
    return cookieObj

  } else return {}
}
