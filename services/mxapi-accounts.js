import fetch from 'node-fetch'
import { constants, HTTPResponseError } from './mxapi.js'

export async function list_accounts(user) {
    console.log('GET ' + constants().mx_base_url + '/users/' + user + '/accounts?page=1&records_per_page=5')
    try {

        const response = await fetch(constants().mx_base_url + '/users/' + user + '/accounts?page=1&records_per_page=5', {
            method: 'GET',
            headers: constants().mx_api_headers
        }).then(response => {
            if (response.ok) {
                return response.json()
            }
            else {
                console.log(response.status + ' ' + response.statusText)
                throw new HTTPResponseError(response)
            }
        })

        console.log(response)
        return response

    } catch (error) {
        return error
    }

}