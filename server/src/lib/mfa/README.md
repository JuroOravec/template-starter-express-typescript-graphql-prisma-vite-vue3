# Multi-factor authentication (MFA) lib

This library allows to do following flows:

1. User does an action that needs verification.
2. There's some data associated with the action. We store this data in a storage like Redis.
3. We craete a challenge - a token that we expect user to send back to us through different
   means.
4. We send this token to user - currently only via email is possible
5. User receives an email that contains a verification URL. The url has the challenge token encoded, and it points to a server endpoint that does the verification.
6. Upon clicking the verification URL, the endpoint verifies the validity of the challenge token.
7. If successful, a success callback is triggered on the server with the associated data from step 2.
8. User is redirected to the frontend with success / failure data encoded in the URL.
9. Frontend parses the URL, and shows a success / failure message accordingly.
