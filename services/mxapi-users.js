import fetch from 'node-fetch'
import { constants, HTTPResponseError } from './mxapi.js'

export async function create_user(id, email, client_user_id) {
    if (client_user_id == undefined) {
        client_user_id = ''
    }
    try {
        const userbody = {
            "user": {
                "id": id,
                "email": email,
                "metadata": "{\"client_user_id\" : \"" + client_user_id + "\" }"
            }
        }
        console.log("POST " + constants().mx_base_url + "/users " + JSON.stringify(userbody))

        const userresponse = await fetch(constants().mx_base_url + '/users', {
            method: 'POST',
            headers: constants().mx_api_headers,
            body: JSON.stringify(userbody)
        }).then(response => {
            if (response.ok) {
                return response.json()
            }
            else {
                console.log(response.status + ' ' + response.statusText)
                throw new HTTPResponseError(response)
            }
        })

        return userresponse.user

    } catch (error) {
        return error
    }
}

export async function delete_user(user) {
    console.log("DELETE " + constants().mx_base_url + "/users/" + user)
    try {

        const userresponse = await fetch(constants().mx_base_url + '/users/' + user, {
            method: 'DELETE',
            headers: constants().mx_api_headers
        }).then(response => {
            return response
        })
        console.log(userresponse.status + ' ' + userresponse.statusText)
        return

    } catch (error) {
        console.log(error)
        return error
    }

}

export async function find_member(user, institution_code) {
    console.log("GET " + constants().mx_base_url + "/users/" + user + "/members")

    if (!user) {
        return
    }
    try {
        const usersresponse = await fetch(constants().mx_base_url + '/users/' + user + '/members', {
            method: 'GET',
            headers: constants().mx_api_headers
        }).then(response => {
            return response.json()
        })
        console.log(usersresponse)

        for (let i = 0; i < usersresponse.members.length; i++) {
            if (usersresponse.members[i].institution_code == institution_code) {
                return usersresponse.members[i]
            }
        }

        return []

    } catch (error) {
        console.error(error)
        return error
    }

}

export async function list_users() {
    console.log("GET " + constants().mx_base_url + "/users")
    try {
        const usersresponse = await fetch(constants().mx_base_url + '/users', {
            method: 'GET',
            headers: constants().mx_api_headers
        }).then(response => {
            return response.json()
        })
        console.log(usersresponse)
        return usersresponse

    } catch (error) {
        console.error(error)
        return error
    }
}