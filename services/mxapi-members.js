import fetch from 'node-fetch'
import { constants, HTTPResponseError } from './mxapi.js'

export async function createmember(institution, user, credential1_guid, credential1_value, credential2_guid, credential2_value) {
    console.log("POST " + constants().mx_base_url + "/users/" + user + "/members")
    try {
        const memberbody = {
            "member": {
                "credentials": [{
                    "guid": credential1_guid,
                    "value": credential1_value
                },
                {
                    "guid": credential2_guid,
                    "value": credential2_value
                }
                ],
                "institution_code": institution
            }
        }

        const memberresponse = await fetch(constants().mx_base_url + '/users/' + user + '/members', {
            method: 'POST',
            headers: constants().mx_api_headers,
            body: JSON.stringify(memberbody)
        }).then(response => {
            if (response.ok) {
                return response.json()
            }
            else {
                console.log(response.status + ' ' + response.statusText)
                throw new HTTPResponseError(response)
            }
        })
        console.log(memberresponse)
        return memberresponse.member

    } catch (error) {
        return error
    }
}

export async function updatemember(member, user, credential1_guid, credential1_value, credential2_guid, credential2_value) {
    console.log("PUT " + constants().mx_base_url + "/users/" + user + "/members/" + member)

    try {
        const memberbody = {
            "member": {
                "credentials": [{
                    "guid": credential1_guid,
                    "value": credential1_value
                },
                {
                    "guid": credential2_guid,
                    "value": credential2_value
                }
                ]
            }
        }

        const memberresponse = await fetch(constants().mx_base_url + '/users/' + user + '/members/' + member, {
            method: 'PUT',
            headers: constants().mx_api_headers,
            body: JSON.stringify(memberbody)
        }).then(response => {
            if (response.ok) {
                return response.json()
            }
            else {
                console.log(response.status + ' ' + response.statusText)
                throw new HTTPResponseError(response)
            }
        })
        console.log(memberresponse)
        return memberresponse.member

    } catch (error) {
        return error
    }
}

/* currently unused */
export async function listmembers(user) {
    console.log('GET ' + constants().mx_base_url + '/users/' + user + '/members?page=1&records_per_page=5')
    try {
        const response = await fetch(constants().mx_base_url + '/users/' + user + '/members?page=1&records_per_page=5', {
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

        if (response.members.length > 0) {
            console.log(response.members)
        }
        return response;

    } catch (error) {
        return error
    }

}

export async function read_member_status(user, member) {
    console.log("GET " + constants().mx_base_url + "/users/" + user + '/members/' + member + '/status')
    try {
        const memberresponse = await fetch(constants().mx_base_url + '/users/' + user + '/members/' + member + '/status', {
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

        console.log(memberresponse)
        return memberresponse.member


    } catch (error) {
        return error
    }
}