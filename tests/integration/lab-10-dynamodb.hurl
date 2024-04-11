# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments

# We're sending a JSON fragment
Content-Type: application/json

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

# Sending one key/value pair
{ "service": "DynamoDB" }

# 1. We expect to get back an HTTP 201
HTTP/1.1 201

# capture the Location header value and the fragment's id in variables named fragment1_url and fragment1_id
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# 2. GET the fragments metadata using the location url
GET {{fragment1_url}}/info

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

# We expect to get back an HTTP 200
HTTP/1.1 200

[Asserts]
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.type" == "application/json"

# 3. Authenticated POST to /v1/fragments (2nd fragment)
POST http://localhost:8080/v1/fragments

# We're sending markdown fragment
Content-Type: text/markdown

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

# Sending markdown fragment
`DynamoDB is **great**.`

# We expect to get back an HTTP 201
HTTP/1.1 201

# capture the Location header value and the fragment's id in variables named fragment1_url and fragment1_id
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# 4. GET the fragments metadata using the location url
GET {{fragment2_url}}/info

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

# We expect to get back an HTTP 200
HTTP/1.1 200

[Asserts]
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.type" == "text/markdown"

# 5. GET the list of fragments for the same authorized user without expanding them
GET http://localhost:8080/v1/fragments

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragments" includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}

# 6. DELETE the first fragment
DELETE {{fragment1_url}}

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# 7. Try to GET the deleted fragment
GET {{fragment1_url}}

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404

# 8. GET the list of fragments for the authorized, confirm that the first id is NOT included but that the second id is
GET http://localhost:8080/v1/fragments

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragments" not includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}
