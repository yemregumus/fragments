# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments

# We're sending unsupported content-type
Content-Type: video/avi

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

# Body of the request goes in ```...``` when it's a string
# Updated after getting below warning
# warning: tests\integration\post-fragments.hurl:10:4 '```This is a fragment!```' request body is deprecated, 
# please use '`This is a fragment!`' instead 
`Something unsupported`

# 1. We expect to get back an HTTP 415
HTTP/1.1 415
# We have various assertions about the response that we want to check
[Asserts]
jsonpath "$.status" == "error"
# We expect to get back a JSON response with 415 error code
jsonpath "$.error.code" == 415
# We expect to get back a JSON response with `Unsupported type ${type} ` message
jsonpath "$.error.message" startsWith "Unsupported type"
