# 404 check
GET http://fragments-lb-1440859714.us-east-1.elb.amazonaws.com:80/no-such-route

# We should get back an HTTP 1.1 404 response
HTTP/1.1 404
