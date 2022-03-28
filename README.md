# just connect

Exploration of how to interact with the MX Platform API without storing user guids. 

## pre-requisite
You will need a valid MX API key. [Sign up for one](https://dashboard.mx.com/sign_up) or obtain yours by logging into the [MX Dashboard](https://dashboard.mx.com/)

## how to run
1. clone this repository
1. edit the `.env` file in project root so that the value of `BASIC_AUTH_TOKEN` is the `Basic Auth Value` found on the [MX Dashboard](https://dashboard.mx.com/)
1. `$> npm run dev`
1. Open a browser window to https://localhost:3000

(you can run this app on a different port by specifying a PORT value when running: `$> PORT=3001 npm run dev`)

## current features
If you have already created MX users, you can **connect an existing user to an institution and retrieve account data**

Otherwise, you can
- connect & forget: everytime you connect, it will be with a new user
- connect & link the new MX user to a userid in from your system
- connect & "remember": if you use a login id that's already associated with an MX user, we'll retrieve the connection status for the existing user

Finally, for ease of use, this app exposes *MX user creation & deletion* as well.
