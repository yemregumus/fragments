# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments

# We're sending a plain text fragment
Content-Type: text/plain

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

# Body of the request goes in ```...``` when it's a string
# Updated after getting below warning
# warning: tests\integration\post-fragments.hurl:10:4 '```This is a fragment!```' request body is deprecated, 
# please use '`This is a fragment!`' instead 
`Hello S3!`

# 1. We expect to get back an HTTP 201
HTTP/1.1 201

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 3. Delete Fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# We expect to get back an HTTP 200
HTTP/1.1 200

# 4. Trying to get the deleted fragment
GET {{url}}
[BasicAuth]
user1@email.com:password1

# We expect to get back an HTTP 404 because the fragment has previously been deleted
HTTP/1.1 404
