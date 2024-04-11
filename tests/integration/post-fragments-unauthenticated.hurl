# Unauthenticated user POST to /v1/fragments
POST http://localhost:8080/v1/fragments

# We're sending a plain text fragment
Content-Type: text/plain

# Include HTTP Basic Auth credentials
[BasicAuth]
invalid_user@email.com:password1234

# Body of the request goes in ```...``` when it's a string
# Updated after getting below warning
# warning: tests\integration\post-fragments.hurl:10:4 '```This is a fragment!```' request body is deprecated, 
# please use '`This is a fragment!`' instead 
`This is a fragment!`

# 1. We expect to get back an HTTP 401
HTTP/1.1 401
# We have various assertions about the response that we want to check
[Asserts]
jsonpath "$.status" == "error"
# We expect to get back a JSON response with 415 error code
jsonpath "$.error.code" == 401
# We expect to get back a JSON response with "Unauthorized"
jsonpath "$.error.message" == "Unauthorized"
